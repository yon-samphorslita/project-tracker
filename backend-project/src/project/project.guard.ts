import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProjectService } from './project.service';

@Injectable()
export class ProjectGuard implements CanActivate {
  constructor(private readonly projectService: ProjectService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const projectId = +request.params.id;

    if (!userId || isNaN(projectId)) {
      throw new NotFoundException('Invalid user or project ID');
    }

    // Fetch project and verify ownership
    const project = await this.projectService.findOne(projectId, userId);

    if (!project) {
      throw new ForbiddenException(
        'You are not authorized to access this project',
      );
    }

    // Attach project to request for reuse in controller
    request.project = project;

    return true;
  }
}
