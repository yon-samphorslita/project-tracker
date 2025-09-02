import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TaskService } from './task.service';

@Injectable()
export class TaskGuard implements CanActivate {
  constructor(private readonly taskService: TaskService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const taskId = +request.params.id;

    if (!user?.id || isNaN(taskId)) {
      throw new NotFoundException('Invalid user or task ID');
    }

    // Admins bypass
    if (user.role === 'admin') {
      request.task = await this.taskService.findOne(taskId, undefined, true);
      return true;
    }

    const task = await this.taskService.findOne(taskId, user.id);
    if (!task)
      throw new ForbiddenException(
        'You are not authorized to access this task',
      );

    request.task = task;
    return true;
  }
}
