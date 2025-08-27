// /src/task/task.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TaskGuard implements CanActivate {
  constructor(
    private readonly taskService: TaskService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const taskId = +request.params.id;

    if (!user) throw new ForbiddenException('User not authenticated');
    if (isNaN(taskId)) throw new NotFoundException('Invalid task ID');

    // Admins bypass ownership check
    if (user.role === 'admin') return true;

    // Fetch the task
    const task = await this.taskService.findOne(taskId);
    if (!task) throw new NotFoundException('Task not found');

    // Check ownership: task.user.id must match authenticated user id
    if (task.user && task.user.id === user.id) return true;

    throw new ForbiddenException('You do not have access to this task');
  }
}
