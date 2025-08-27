import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Subtask } from './subtask.entity';

@Injectable()
export class SubtaskService {
  constructor(
    @InjectRepository(Subtask)
    private subtaskRepository: Repository<Subtask>,
  ) {}

  async create(createSubtaskDto: CreateSubtaskDto): Promise<Subtask> {
    return this.subtaskRepository.save(createSubtaskDto);
  }

  async findAll(): Promise<Subtask[]> {
    return this.subtaskRepository.find();
  }

  async findOne(id: number): Promise<Subtask | null> {
    return this.subtaskRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateSubtaskDto: UpdateSubtaskDto,
  ): Promise<Subtask | null> {
    await this.subtaskRepository.update(id, updateSubtaskDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.subtaskRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Subtask with id ${id} not found`);
    }
  }
  async findByTaskId(taskId: number): Promise<Subtask[]> {
    return this.subtaskRepository.find({
      where: { task: { id: taskId } },
    });
  }
}
