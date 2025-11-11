import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SubtaskService } from './subtask.service';

@Injectable()
export class SubtaskGuard implements CanActivate {
  constructor(private readonly subtaskService: SubtaskService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // { id, role, teamId }

    const subtaskId = request.params.id ? +request.params.id : null;
    const taskId = request.params.taskId ? +request.params.taskId : null;

    // Admin can access everything
    if (user.role === 'admin') return true;

    // Subtask-specific route
    if (subtaskId) {
      const subtask = await this.subtaskService.findOne(subtaskId);
      if (!subtask) throw new NotFoundException('Subtask not found');
      request.subtask = subtask;

      const ownerId = subtask.task?.user?.id;
      const ownerTeamId = subtask.task?.user?.team;

      if (user.role === 'pm') {
        // PM can see all subtasks in their team
        if (ownerTeamId !== user.teamId) {
          throw new ForbiddenException(
            'You cannot access subtasks outside your team',
          );
        }
        // Allow view, but enforce edit/delete restriction in controller/service
        return true;
      }

      if (user.role === 'member') {
        if (ownerId !== user.id) {
          throw new ForbiddenException('You can only access your own subtasks');
        }
        return true;
      }
    }

    // Route: /subtasks/task/:taskId
    if (taskId) {
      const subtasks = await this.subtaskService.findByTaskId(taskId);

      if (user.role === 'pm') {
        const allowed = subtasks.every(
          (st) => st.task.user.team === user.teamId,
        );
        if (!allowed)
          throw new ForbiddenException(
            'You cannot access subtasks outside your team',
          );
        return true; // PM can view subtasks
      }

      if (user.role === 'member') {
        const allowed = subtasks.every((st) => st.task.user.id === user.id);
        if (!allowed)
          throw new ForbiddenException('You can only access your own subtasks');
        return true;
      }
    }

    return true;
  }
}
