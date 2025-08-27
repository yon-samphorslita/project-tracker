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
import { User } from 'src/user/user.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      user: user,
      created_at: new Date(),
    });
    return this.taskRepository.save(task);
  }

  async findAll(userId?: number): Promise<Task[]> {
    if (userId) {
      return this.taskRepository.find({ where: { user: { id: userId } } });
    }
    return this.taskRepository.find({ relations: ['user'] });
  }

  async findOne(id: number, userId?: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user', 'project'],
    });
    if (!task) throw new NotFoundException('Task not found');
    if (userId && task.user?.id !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }
    return task;
  }

  async findByProject(projectId: number, userId?: number): Promise<Task[]> {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .where('task.projectId = :projectId', { projectId });

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }

    return query.getMany();
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    user?: User,
  ): Promise<Task> {
    const task = await this.findOne(id, user?.id);
    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async delete(id: number, userId?: number): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.taskRepository.delete(task.id);
  }
}
