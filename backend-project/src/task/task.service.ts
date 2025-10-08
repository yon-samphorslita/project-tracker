import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotificationsGateway } from 'src/notification/notification.gateway';
import { User } from 'src/user/user.entity';
import { Project } from 'src/project/project.entity';
import { NotificationService } from 'src/notification/notification.service';
import { ProjectService } from '../project/project.service';
import { ActivityService } from 'src/activity/activity.service';
import * as dayjs from 'dayjs';

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
    // Fetch related user
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    // Fetch related project
    const project = await this.projectRepo.findOne({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${dto.projectId} not found`);
    }

    // Create task entity
    const task = this.taskRepository.create({
      t_name: dto.t_name,
      t_description: dto.t_description,
      t_priority: dto.t_priority,
      start_date: dto.start_date,
      due_date: dto.due_date,
      user,
      project,
    });

    const savedTask = await this.taskRepository.save(task);

    // Log creation
    await this.activityService.logAction(
      actor.id,
      `Created task: "${savedTask.t_name}" (Project: "${project.p_name}", Due: ${dayjs(savedTask.due_date).format('MMM D, YYYY')})`,
    );

    // Refresh project status
    await this.projectService.refreshProjectStatus(project.id);

    // Save & send notification
    const notification = await this.notificationService.create({
      userId: user.id,
      title: 'New Task Assigned',
      message: `${savedTask.t_name}`,
      // message: `You have been assigned a new task "${savedTask.t_name}" in project "${project.p_name}". Due: ${savedTask.due_date}`,
      read_status: false,
    });

    this.notificationsGateway.sendNotification(String(user.id), notification);

    return savedTask;
  }

  async update(id: number, dto: UpdateTaskDto, actor: User): Promise<Task> {
    const task = await this.findOne(id, actor.id, actor.role === 'admin');
    if (!task)
      throw new NotFoundException(`Task with ID ${id} not found or no access`);

    const changes = this.getChanges(task, dto);
    if (changes.length === 0) return task; // no changes

    Object.assign(task, dto);
    const savedTask = await this.taskRepository.save(task);

    await this.activityService.logAction(
      actor.id,
      `Task "${savedTask.t_name}" updated on:\n${changes.join('; \n')}`,
    );

    if (savedTask.project?.id)
      await this.projectService.refreshProjectStatus(savedTask.project.id);

    return savedTask;
  }

  async delete(id: number, actor: User): Promise<void> {
    const task = await this.findOne(id, actor.id, actor.role === 'admin');
    const projectId = task.project?.id;

    await this.taskRepository.remove(task);

    // Log deletion
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

    if (userId) {
      return this.taskRepository.find({
        where: { user: { id: userId } },
        relations,
      });
    }

    return this.taskRepository.find({ relations });
  }

  async findOne(id: number, userId?: number, isAdmin = false): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user', 'project', 'subtasks'],
    });

    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);

    if (!isAdmin && userId && task.user?.id !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async findByProject(projectId: number, userId?: number): Promise<Task[]> {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.subtasks', 'subtasks')
      .where('task.projectId = :projectId', { projectId });

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }

    return query.getMany();
  }
  private getChanges(task: Task, dto: UpdateTaskDto): string[] {
    const changes: string[] = [];

    // Compare string fields
    if (dto.t_name && dto.t_name !== task.t_name) {
      changes.push(`Name from "${task.t_name}" to "${dto.t_name}"`);
    }

    if (dto.t_description && dto.t_description !== task.t_description) {
      changes.push(`Description updated`);
    }

    if (dto.t_priority && dto.t_priority !== task.t_priority) {
      changes.push(`Priority from "${task.t_priority}" to "${dto.t_priority}"`);
    }

    // Compare date fields (using dayjs for clarity)
    if (
      dto.start_date &&
      dayjs(dto.start_date).isValid() &&
      !dayjs(dto.start_date).isSame(task.start_date)
    ) {
      changes.push(
        `Start Date from "${dayjs(task.start_date).format('MMM D, YYYY')}" to "${dayjs(dto.start_date).format('MMM D, YYYY')}"`,
      );
    }

    if (
      dto.due_date &&
      dayjs(dto.due_date).isValid() &&
      !dayjs(dto.due_date).isSame(task.due_date)
    ) {
      changes.push(
        `Due Date from "${dayjs(task.due_date).format('MMM D, YYYY')}" to "${dayjs(dto.due_date).format('MMM D, YYYY')}"`,
      );
    }

    // Compare assigned user if included
    if (dto.userId && task.user && dto.userId !== task.user.id) {
      changes.push(
        `Assigned user changed from "${task.user.id}" to "${dto.userId}"`,
      );
    }

    return changes;
  }
}
