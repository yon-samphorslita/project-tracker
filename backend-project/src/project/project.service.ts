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
import { Team } from 'src/team/team.entity';
import { Status } from '../enums/status.enum';
import { ActivityService } from 'src/activity/activity.service';
import { NotificationService } from 'src/notification/notification.service';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    private readonly activityService: ActivityService,
    private readonly notificationService: NotificationService,
  ) {}

  // Create a new project
  async createProject(
    createProjectDto: CreateProjectDto,
    user: User,
  ): Promise<Project> {
    let team: Team | null = null;
if (createProjectDto.teamId) {
  team = await this.teamRepository.findOne({
    where: { id: createProjectDto.teamId },
    relations: ['members', 'pms', 'mainMembers'],
  });

  if (!team) {
    throw new NotFoundException(`Team with ID ${createProjectDto.teamId} not found`);
  }
}

const project = this.projectRepository.create({
  ...createProjectDto,
  user,
  created_at: new Date(),
  team, // safe, because entity allows Team | null
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
  async findAll(user: User): Promise<Project[]> {
    const projects = await this.projectRepository.find({
      relations : [
      'team',
      'team.members',
      'team.mainMembers',
      'team.pms',
      'user',
      'tasks',
      'tasks.user',
    ]
    })

    if (user.role === Role.ADMIN) {
      return projects;
    }

    if (user.role === Role.PROJECT_MANAGER) {
      return projects.filter((p) =>
      p.team?.pms?.some((pm) => pm.id === user.id))
    }

    return projects.filter(
      (p) =>
        p.team?.mainMembers?.some((mm) => mm.id === user.id) ||
      p.team?.members?.some((m) => m.id === user.id) ||
      p.tasks?.some((t) => t.user?.id === user.id)
    )
  }

  // Find a single project by ID
  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: [
        'team',
        'team.members',
        'team.pms',
        'user',
        'tasks',
        'tasks.subtasks',
      ],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async findProjectsForPM(pmId: number): Promise<Project[]> {
    return this.projectRepository.find({
      where: {
        team: {
          pms: { id: pmId },
        },
      },
      relations: ['team', 'team.pms'], // adjust relations as needed
    });
  }


  // Update a project
  async update(
    id: number,
    dto: UpdateProjectDto,
    user: User,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['user', 'tasks', 'tasks.subtasks', 'team'],
    });

    if (!project)
      throw new NotFoundException(`Project with ID ${id} not found`);

    // Update team if teamId is provided
    if (dto.teamId) {
      const team = await this.teamRepository.findOne({
        where: { id: dto.teamId },
        relations: ['members', 'pms', 'mainMembers'],
      });
      if (!team)
        throw new NotFoundException(`Team with ID ${dto.teamId} not found`);
      project.team = team;
    }

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

    if (changes.length > 0) {
      Object.assign(project, dto);
      const savedProject = await this.projectRepository.save(project);

      await this.activityService.logAction(
        user.id,
        `Project "${savedProject.p_name}" updated on:\n${changes.join('; \n')}`,
      );

      return savedProject;
    }

    return project;
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
