import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SubtaskService } from './subtask.service';

@Injectable()
export class SubtaskGuard implements CanActivate {
  constructor(private readonly subtaskService: SubtaskService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new ForbiddenException('User not authenticated');
    }

    // Route: /subtasks/:id
    const subtaskId = request.params.id ? +request.params.id : null;
    if (subtaskId) {
      const subtask = await this.subtaskService.findOne(subtaskId);
      if (!subtask) throw new NotFoundException('Subtask not found');

      request.subtask = subtask;

      if (user.role === 'admin') return true;

      const taskOwnerId = subtask.task?.user?.id;
      if (taskOwnerId !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to access this subtask',
        );
      }

      return true;
    }

    // Route: /subtasks/task/:taskId
    const taskId = request.params.taskId ? +request.params.taskId : null;
    if (taskId) {
      const subtasks = await this.subtaskService.findByTaskId(taskId);
      if (!subtasks) throw new NotFoundException('Task not found');

      if (user.role === 'admin') return true;

      const taskOwnerId = subtasks[0]?.task?.user?.id;
      if (subtasks.length && taskOwnerId !== user.id) {
        throw new ForbiddenException(
          'You are not authorized to access subtasks for this task',
        );
      }

      return true;
    }

    // For creation or other routes, allow
    return true;
  }
}
