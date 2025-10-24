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

    console.log('SubtaskGuard - User:', user);
    if (!user?.id) throw new ForbiddenException('User not authenticated');
    

    // Check if the route has a subtask ID
    const subtaskId = request.params.id ? +request.params.id : null;

    if (subtaskId) {
      const subtask = await this.subtaskService.findOne(subtaskId);
      if (!subtask) throw new NotFoundException('Subtask not found');

      // Admins can access any subtask
      if (user.role === 'admin') {
        request.subtask = subtask;
        return true;
      }

      // Only allow if user owns the parent task/project
      const task = subtask.task;
      if (task.user.id !== user.id && user.role !== 'admin') {
        throw new ForbiddenException(
          'You are not authorized to access this subtask',
        );
      }

      request.subtask = subtask;
      return true;
    }

    // For routes like task/:taskId, you could optionally check task ownership
    const taskId = request.params.taskId ? +request.params.taskId : null;
    // if (taskId) {
    //   const subtasks = await this.subtaskService.findByTaskId(taskId);
    //   if (!subtasks) throw new NotFoundException('Task not found');

    //   // Admin bypass
    //   if (user.role === 'admin') return true;

    //   // Check if user owns the task
    //   if (subtasks.length > 0 && subtasks[0].task.user !== user.id) {
    //     throw new ForbiddenException(
    //       'You are not authorized to access subtasks for this task',
    //     );
    //   }

    //   return true;
    // }

    if (taskId) {
      const subtasks = await this.subtaskService.findByTaskId(taskId);
      if (!subtasks) throw new NotFoundException('No subtasks found for this task');

      if (user.role === 'admin') return true;

      if (subtasks.length > 0 && subtasks[0].task.user.id !== user.id) {
        throw new ForbiddenException('You are not authorized to access subtasks for this task');
      }

      return true;
    }


    // For creation or general access
    return true;
  }
}
