import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Subtask } from './subtask.entity';
import { Status } from 'src/enums/status.enum';
import { Task } from 'src/task/task.entity';
import { ActivityService } from 'src/activity/activity.service';

@Injectable()
export class SubtaskService {
  constructor(
    @InjectRepository(Subtask)
    private subtaskRepository: Repository<Subtask>,
    private readonly activityService: ActivityService, // Inject ActivityService
  ) {}

  async create(
    createSubtaskDto: CreateSubtaskDto,
    userId: number,
  ): Promise<Subtask> {
    const { taskId, name } = createSubtaskDto;

    const task = await this.subtaskRepository.manager.findOne(Task, {
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException(`Task with id ${taskId} not found`);
    }

    const subtask = this.subtaskRepository.create({
      name,
      status: Status.NOT_STARTED,
      task,
      taskId,
    });
    const savedSubtask = await this.subtaskRepository.save(subtask);

    // Log activity
    await this.activityService.logAction(
      userId,
      `Created subtask "${savedSubtask.name}" for task "${task.t_name}".`,
      taskId
    );

    return savedSubtask;
  }

  async findAll(): Promise<Subtask[]> {
    return this.subtaskRepository.find({
      relations: ['task', 'task.user', 'task.user.team'],
    });
  }

  async findOne(id: number): Promise<Subtask | null> {
    return this.subtaskRepository.findOne({
      where: { id },
      relations: ['task', 'task.user', 'task.user.team'],
    });
  }

  async update(
    id: number,
    dto: UpdateSubtaskDto,
    userId?: number,
  ): Promise<Subtask> {
    const subtask = await this.subtaskRepository.findOne({
      where: { id },
      relations: ['task'],
    });
    if (!subtask)
      throw new NotFoundException(`Subtask with id ${id} not found`);

    // const oldName = subtask.name;

    const changes: string[] = [];

    if (dto.name && dto.name !== subtask.name) {
      changes.push(`name from "${subtask.name}" to "${dto.name}"`);
    }
    if (dto.status && dto.status !== subtask.status) {
      changes.push(`status from "${subtask.status}" to "${dto.status}"`);
    }

    Object.assign(subtask, dto);
    const updatedSubtask = await this.subtaskRepository.save(subtask);

    // Log activity
    // if (userId) {
    //   await this.activityService.logAction(
    //     userId,
    //     `Updated subtask "${oldName}" to "${updatedSubtask.name}" for task "${subtask.task.t_name}".`,
    //     subtask.taskId
    //   );
    // }
    if (userId && changes.length > 0) {
      await this.activityService.logAction(
        userId,
        `Updated subtask (${changes.join(', ')}) for task "${subtask.task.t_name}".`,
        subtask.task.id,
      );
    }
    return updatedSubtask;
  }

  async remove(id: number, userId?: number): Promise<Subtask> {
    const subtask = await this.subtaskRepository.findOne({
      where: { id },
      relations: ['task'],
    });
    if (!subtask)
      throw new NotFoundException(`Subtask with id ${id} not found`);

    await this.subtaskRepository.remove(subtask);

    // Log activity
    if (userId) {
      await this.activityService.logAction(
        userId,
        `Deleted subtask "${subtask.name}" from task "${subtask.task.t_name}".`,
        subtask.taskId
      );
    }

    return subtask;
  }

  async findByTaskId(taskId: number): Promise<Subtask[]> {
    return this.subtaskRepository.find({
      where: { taskId },
      relations: ['task', 'task.user'],
    });
  }
}
