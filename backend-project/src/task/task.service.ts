import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      created_at: new Date(),
    });
    return this.taskRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  async findOne(id: number): Promise<Task | null> {
    return this.taskRepository.findOneBy({ id });
  }
  async findByProject(projectId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { project: { id: projectId } },
      relations: ['project'],
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    await this.taskRepository.update(id, updateTaskDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.taskRepository.delete(id);
  }
}
