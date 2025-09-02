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

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  // Create
  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      user,
      created_at: new Date(),
    });
    return this.taskRepository.save(task);
  }

  // Find all (admin → all, user → own only)
  async findAll(userId?: number): Promise<Task[]> {
    if (userId) {
      return this.taskRepository.find({
        where: { user: { id: userId } },
        relations: ['user', 'project'],
      });
    }
    return this.taskRepository.find({ relations: ['user', 'project'] });
  }

  // Find one
  async findOne(id: number, userId?: number, isAdmin = false): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user', 'project'],
    });

    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);

    if (!isAdmin && userId && task.user?.id !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  // Find tasks by project
  async findByProject(projectId: number, userId?: number): Promise<Task[]> {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .leftJoinAndSelect('task.project', 'project')
      .where('task.projectId = :projectId', { projectId });

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }

    return query.getMany();
  }

  // Update
  async update(id: number, dto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id, user.id, user.role === 'admin');
    Object.assign(task, dto);
    return this.taskRepository.save(task);
  }

  // Delete
  async delete(id: number, user: User): Promise<void> {
    const task = await this.findOne(id, user.id, user.role === 'admin');
    await this.taskRepository.remove(task);
  }
}
