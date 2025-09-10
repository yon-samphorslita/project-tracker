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
    // Fetch related user (assignee)
    const assignee = await this.userRepo.findOne({
      where: { id: dto.userId },
    });
    if (!assignee) {
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
      user: assignee,
      project,
    });

    const savedTask = await this.taskRepository.save(task);

    // Log creation
    await this.activityService.logAction(
      actor.id,
      `Created task: ${savedTask.t_name}`,
    );

    // Refresh project status
    await this.projectService.refreshProjectStatus(project.id);

    // Save & send notification
    const notification = await this.notificationService.create({
      userId: assignee.id,
      title: 'New Task Assigned',
      message: `You have been assigned a new task "${savedTask.t_name}" in project "${project.p_name}". Due: ${savedTask.due_date}`,
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
    Object.assign(task, dto);

    const savedTask = await this.taskRepository.save(task);

    // Log update
    await this.activityService.logAction(
      actor.id,
      `Updated task: ${savedTask.t_name}`,
    );

    if (savedTask.project?.id) {
      await this.projectService.refreshProjectStatus(savedTask.project.id);
    }

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
}
