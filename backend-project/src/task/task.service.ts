import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';

import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from 'src/user/user.entity';
import { Project } from 'src/project/project.entity';
import { NotificationsGateway } from 'src/notification/notification.gateway';
import { NotificationService } from 'src/notification/notification.service';
import { ProjectService } from '../project/project.service';
import { ActivityService } from 'src/activity/activity.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationService: NotificationService,
    private readonly projectService: ProjectService,
    private readonly activityService: ActivityService,
  ) {}

  async create(dto: CreateTaskDto, actor: User): Promise<Task> {
    const project = await this.projectRepo.findOne({
      where: { id: dto.projectId },
      relations: ['team', 'team.members', 'team.pms'],
    });
    if (!project) throw new NotFoundException('Project not found');

    const assignee = dto.userId
      ? await this.validateAssignee(dto.userId, project, actor)
      : actor;

    const task = this.taskRepository.create({
      ...dto,
      user: assignee,
      project,
    });

    const savedTask = await this.taskRepository.save(task);

    await this.activityService.logAction(
      actor.id,
      `Created task: "${savedTask.t_name}" (Project: "${project.p_name}", Due: ${dayjs(savedTask.due_date).format('MMM D, YYYY')})`,
    );

    await this.projectService.refreshProjectStatus(project.id);

    const notification = await this.notificationService.create({
      userId: assignee.id,
      title: 'New Task Assigned',
      message: savedTask.t_name,
      read_status: false,
    });

    this.notificationsGateway.sendNotification(
      String(assignee.id),
      notification,
    );

    return savedTask;
  }

  async update(id: number, dto: UpdateTaskDto, actor: User): Promise<Task> {
    const task = await this.findOne(id, actor.id, actor.role === 'admin');

    if (dto.userId && dto.userId !== task.user?.id) {
      task.user = await this.validateAssignee(dto.userId, task.project!, actor);
    }

    Object.assign(task, dto);

    const changes = this.getChanges(task, dto);

    const savedTask = await this.taskRepository.save(task);

    if (changes.length > 0) {
      await this.activityService.logAction(
        actor.id,
        `Task "${savedTask.t_name}" updated:\n${changes.join('; \n')}`,
      );
    }

    if (savedTask.project?.id) {
      await this.projectService.refreshProjectStatus(savedTask.project.id);
    }

    return savedTask;
  }

  async delete(id: number, actor: User): Promise<void> {
    const task = await this.findOne(id, actor.id, actor.role === 'admin');
    const projectId = task.project?.id;

    await this.taskRepository.remove(task);

    await this.activityService.logAction(
      actor.id,
      `Deleted task: ${task.t_name}`,
    );

    if (projectId) {
      await this.projectService.refreshProjectStatus(projectId);
    }
  }

  async findAll(userId?: number): Promise<Task[]> {
    const relations = ['user', 'project', 'subtasks'];
    const where = userId ? { user: { id: userId } } : {};
    return this.taskRepository.find({ where, relations });
  }

  async findOne(id: number, userId?: number, isAdmin = false): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: [
        'user',
        'project',
        'subtasks',
        'project.team',
        'project.team.members',
        'project.team.pms',
      ],
    });
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);

    const isPM =
      task.project?.team?.pms?.some((pm) => pm.id === userId) ?? false;

    if (!isAdmin && !isPM && userId && task.user?.id !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async findByProject(projectId: number, userId?: number): Promise<Task[]> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: [
        'team',
        'team.pms',
        'team.members',
        'tasks',
        'tasks.user',
        'tasks.subtasks',
      ],
    });
    if (!project) throw new NotFoundException('Project not found');

    const isPM = userId && project.team?.pms?.some((pm) => pm.id === userId);

    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.subtasks', 'subtasks')
      .where('task.projectId = :projectId', { projectId });

    if (userId && !isPM) {
      query.andWhere('user.id = :userId', { userId });
    }

    return query.getMany();
  }

  private getChanges(task: Task, dto: UpdateTaskDto): string[] {
    const changes: string[] = [];

    if (dto.t_name && dto.t_name !== task.t_name) {
      changes.push(`Name from "${task.t_name}" to "${dto.t_name}"`);
    }
    if (dto.t_description && dto.t_description !== task.t_description) {
      changes.push(`Description updated`);
    }
    if (dto.t_priority && dto.t_priority !== task.t_priority) {
      changes.push(`Priority from "${task.t_priority}" to "${dto.t_priority}"`);
    }

    if (dto.t_status && dto.t_status !== task.t_status) {
      changes.push(`Status from "${task.t_status}" to "${dto.t_status}"`);
    }

    // Compare date fields (using dayjs for clarity)
    if (
      dto.start_date &&
      dayjs(dto.start_date).isValid() &&
      !dayjs(dto.start_date).isSame(task.start_date)
    ) {
      changes.push(
        `Start Date from "${dayjs(task.start_date).format('MMM D, YYYY')}" to "${dayjs(
          dto.start_date,
        ).format('MMM D, YYYY')}"`,
      );
    }
    if (
      dto.due_date &&
      dayjs(dto.due_date).isValid() &&
      !dayjs(dto.due_date).isSame(task.due_date)
    ) {
      changes.push(
        `Due Date from "${dayjs(task.due_date).format('MMM D, YYYY')}" to "${dayjs(
          dto.due_date,
        ).format('MMM D, YYYY')}"`,
      );
    }
    if (dto.userId && task.user && dto.userId !== task.user.id) {
      changes.push(
        `Assigned user changed from "${task.user.id}" to "${dto.userId}"`,
      );
    }

    return changes;
  }

  private async validateAssignee(
    userId: number,
    project: Project,
    actor: User,
  ): Promise<User> {
    const assignee = await this.userRepo.findOne({ where: { id: userId } });
    if (!assignee) throw new NotFoundException('User not found');

    const teamMembers = [
      ...(project.team?.members || []),
      ...(project.team?.pms || []),
    ];

    const isPM = project.team?.pms?.some((pm) => pm.id === actor.id) ?? false;

    if (
      !teamMembers.some((m) => m.id === assignee.id) &&
      !isPM &&
      actor.role !== 'admin'
    ) {
      throw new ForbiddenException('User must be a member of the project team');
    }

    return assignee;
  }
}
