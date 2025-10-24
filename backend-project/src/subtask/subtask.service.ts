import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Subtask } from './subtask.entity';
import { Status } from 'src/enums/status.enum';
import { Task } from 'src/task/task.entity';

@Injectable()
export class SubtaskService {
  constructor(
    @InjectRepository(Subtask)
    private subtaskRepository: Repository<Subtask>,
  ) {}

  async create(createSubtaskDto: CreateSubtaskDto): Promise<Subtask> {
    const { taskId, name, status } = createSubtaskDto;

    const task = await this.subtaskRepository.manager.findOne(Task, { where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    const subtask = this.subtaskRepository.create({
      name,
      status: Status.NOT_STARTED,
      task,
      taskId,
    });
    return this.subtaskRepository.save(subtask);
  }

  async findAll(): Promise<Subtask[]> {
    return this.subtaskRepository.find({
      relations: ['task', 'task.user'],
    });
  }

  async findOne(id: number): Promise<Subtask | null> {
    return this.subtaskRepository.findOne({
      where: { id },
      relations: ['task', 'task.user'],
    });
  }

  // async update(
  //   id: number,
  //   updateSubtaskDto: UpdateSubtaskDto,
  // ): Promise<Subtask | null> {
  //   await this.subtaskRepository.update(id, updateSubtaskDto);
  //   return this.findOne(id);
  // }

  // async remove(id: number): Promise<void> {
  //   const result = await this.subtaskRepository.delete(id);
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`Subtask with id ${id} not found`);
  //   }
  // }

  async update(id: number, dto: UpdateSubtaskDto): Promise<Subtask> {
    const subtask = await this.subtaskRepository.findOne({ where: { id } });
    if (!subtask) throw new NotFoundException(`Subtask with id ${id} not found`);
    Object.assign(subtask, dto);
    return this.subtaskRepository.save(subtask);
  }

  async remove(id: number): Promise<Subtask> {
    const subtask = await this.subtaskRepository.findOne({ where: { id } });
    if (!subtask) throw new NotFoundException(`Subtask with id ${id} not found`);
    await this.subtaskRepository.remove(subtask);
    return subtask;
  }


  async findByTaskId(taskId: number): Promise<Subtask[]> {
    return this.subtaskRepository.find({
      where: {  taskId },
      relations: ['task', 'task.user'],
    });
  }
}
