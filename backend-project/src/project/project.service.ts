import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';

import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../user/user.entity';
import { Status } from '../enums/status.enum';
import { ActivityService } from 'src/activity/activity.service';
import { NotificationsGateway } from 'src/notification/notification.gateway';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly activityService: ActivityService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationService: NotificationService,
  ) {}

  // Create a new project
  async createProject(
    createProjectDto: CreateProjectDto,
    user: User,
  ): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      user,
      created_at: new Date(),
    });

    const savedProject = await this.projectRepository.save(project);

    await this.activityService.logAction(
      user.id,
      `Created project: "${savedProject.p_name}" (Start: ${dayjs(savedProject.start_date).format('MMM D, YYYY')}, Due: ${dayjs(savedProject.due_date).format('MMM D, YYYY')})`,
    );

    // Send notifications to all team members
    if (savedProject.team?.members?.length) {
      const memberIds = savedProject.team.members.map((m) => m.id);

      await this.notificationService.notifyUsers(
        memberIds,
        'New Project Assigned',
        `Project "${savedProject.p_name}" has been assigned to your team.`,
      );
    }

    return savedProject;
  }

  // Find all projects
  async findAll(userId?: number, isAdmin = false): Promise<Project[]> {
    const relations = [
      'team',
      'team.members',
      'team.pms',
      'user',
      'tasks',
      'tasks.user',
    ];

    if (isAdmin || !userId) {
      return this.projectRepository.find({ relations });
    }

    const user = await this.projectRepository.manager.findOne(User, {
      where: { id: userId },
      relations: ['team', 'pmTeams'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Explicitly type teamIds
    const teamIds: number[] = [];

    if (user.team) teamIds.push(user.team.id);
    if (user.pmTeams?.length) {
      teamIds.push(...user.pmTeams.map((team) => team.id));
    }

    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.team', 'team')
      .leftJoinAndSelect('team.members', 'member')
      .leftJoinAndSelect('team.pms', 'pms')
      .leftJoinAndSelect('project.user', 'user')
      .leftJoinAndSelect('project.tasks', 'tasks')
      .leftJoinAndSelect('tasks.user', 'taskUser')
      .where('project.userId = :userId', { userId })
      .orWhere('team.id IN (:...teamIds)', { teamIds })
      .getMany();
  }

  // Find a single project by ID
  async findOne(
    id: number,
    userId?: number,
    isAdmin = false,
  ): Promise<Project> {
    const projectQB = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.team', 'team')
      .leftJoinAndSelect('team.members', 'member')
      .leftJoinAndSelect('team.pms', 'pms')
      .leftJoinAndSelect('project.user', 'user')
      .leftJoinAndSelect('project.tasks', 'tasks')
      .leftJoinAndSelect('tasks.subtasks', 'subtasks')
      .where('project.id = :id', { id });

    if (!isAdmin) {
      const user = await this.projectRepository.manager.findOne(User, {
        where: { id: userId },
        relations: ['team', 'pmTeams'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const teamIds: number[] = [];
      if (user.team) teamIds.push(user.team.id);
      if (user.pmTeams?.length) {
        teamIds.push(...user.pmTeams.map((team) => team.id));
      }

      projectQB.andWhere(
        'project.userId = :userId OR team.id IN (:...teamIds)',
        { userId, teamIds },
      );
    }

    const project = await projectQB.getOne();

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${id} not found or access denied`,
      );
    }

    return project;
  }

  // Update a project
  async update(
    id: number,
    dto: UpdateProjectDto,
    user: User,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['user', 'tasks', 'tasks.subtasks'],
    });

    if (!project)
      throw new NotFoundException(`Project with ID ${id} not found`);
    if (project.user?.id !== user.id && user.role !== 'admin')
      throw new ForbiddenException('Only owner can modify the project');

    // Prevent marking completed if tasks/subtasks are incomplete
    if (dto.status === Status.COMPLETED) {
      const hasIncomplete = project.tasks.some(
        (task) =>
          task.t_status !== Status.COMPLETED ||
          task.subtasks?.some((sub) => sub.status !== Status.COMPLETED),
      );

      if (hasIncomplete) {
        throw new ForbiddenException(
          'Cannot mark project as completed until all tasks and subtasks are completed',
        );
      }
    }

    // Track changes for logging
    const changes = this.getChanges(project, dto);

    // Only save and log if there are actual changes
    if (changes.length === 0) return project;

    Object.assign(project, dto);
    const savedProject = await this.projectRepository.save(project);

    await this.activityService.logAction(
      user.id,
      `Project "${savedProject.p_name}" updated on:\n${changes.join('; \n')}`,
    );

    return savedProject;
  }

  // Refresh project status based on tasks/subtasks
  async refreshProjectStatus(projectId: number): Promise<void> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['tasks', 'tasks.subtasks'],
    });

    if (!project) return;

    project.status = this.computeProjectStatus(project);
    await this.projectRepository.save(project);
  }

  // Compute project status dynamically
  private computeProjectStatus(project: Project): Status {
    if (!project.tasks?.length) return Status.NOT_STARTED;

    const allCompleted = project.tasks.every(
      (task) =>
        task.t_status === Status.COMPLETED &&
        (task.subtasks?.every((sub) => sub.status === Status.COMPLETED) ??
          true),
    );
    if (allCompleted) return Status.COMPLETED;

    const allNotStarted = project.tasks.every(
      (task) =>
        task.t_status === Status.NOT_STARTED &&
        (task.subtasks?.every((sub) => sub.status === Status.NOT_STARTED) ??
          true),
    );
    if (allNotStarted) return Status.NOT_STARTED;

    return Status.IN_PROGRESS;
  }

  // Delete a project
  async delete(id: number, user: User): Promise<void> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!project)
      throw new NotFoundException(`Project with ID ${id} not found`);

    // Safely check owner
    if (project.user && project.user.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Only owner can delete the project');
    }

    await this.projectRepository.remove(project);
    await this.activityService.logAction(
      user.id,
      `Deleted project: ${project.p_name}`,
    );
  }

  // Helpers
  private isDateField(key: string): boolean {
    return ['start_date', 'due_date'].includes(key);
  }

  private formatFieldName(key: string): string {
    const map: Record<string, string> = {
      p_name: 'Name',
      p_description: 'Description',
      start_date: 'Start Date',
      due_date: 'Due Date',
      status: 'Status',
    };
    return (
      map[key] ||
      key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    );
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined || value === '') return '—';
    return String(value).replace(/^"|"$/g, '').trim();
  }

  private getChanges(project: Project, dto: UpdateProjectDto): string[] {
    const changes: string[] = [];
    const excludedFields = ['id', 'created_at', 'updated_at', 'user'];

    for (const key of Object.keys(dto)) {
      if (excludedFields.includes(key)) continue;

      const oldVal = (project as any)[key];
      const newVal = (dto as any)[key];

      // Handle date fields
      if (this.isDateField(key)) {
        const oldDate = dayjs(oldVal).format('YYYY-MM-DD');
        const newDate = dayjs(newVal).format('YYYY-MM-DD');

        if (oldDate !== newDate) {
          changes.push(
            `${this.formatFieldName(key)} from "${dayjs(oldVal).format('MMMM D, YYYY')}" to "${dayjs(newVal).format('MMMM D, YYYY')}"`,
          );
        }
        continue;
      }

      // Handle other fields
      if (oldVal !== newVal) {
        changes.push(
          `${this.formatFieldName(key)} from "${this.formatValue(oldVal)}" to "${this.formatValue(newVal)}"`,
        );
      }
    }

    return changes;
  }
}
