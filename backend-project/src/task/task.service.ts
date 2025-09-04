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
import { User } from '../user/user.entity';
import { ProjectService } from '../project/project.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly projectService: ProjectService,
  ) {}

  // Create a new task
  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      user,
      created_at: new Date(),
    });

    const savedTask = await this.taskRepository.save(task);

    if (savedTask.project?.id) {
      await this.projectService.refreshProjectStatus(savedTask.project.id);
    }

    return savedTask;
  }

  // Find all tasks
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

  // Find a single task by ID
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

  // Update a task
  async update(id: number, dto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id, user.id, user.role === 'admin');
    Object.assign(task, dto);

    const savedTask = await this.taskRepository.save(task);

    if (task.project?.id) {
      await this.projectService.refreshProjectStatus(task.project.id);
    }

    return savedTask;
  }

  // Delete a task
  async delete(id: number, user: User): Promise<void> {
    const task = await this.findOne(id, user.id, user.role === 'admin');
    const projectId = task.project?.id;

    await this.taskRepository.remove(task);

    if (projectId) {
      await this.projectService.refreshProjectStatus(projectId);
    }
  }

  // Find tasks by project
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
