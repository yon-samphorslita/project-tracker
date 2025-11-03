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
    const user = request.user;
    const projectId = +request.params.id;

    if (!user?.id || isNaN(projectId)) {
      throw new NotFoundException('Invalid user or project ID');
    }

    // Admin can access all projects
    const isAdmin = user.role === 'admin';
    const project = await this.projectService.findOne(
      projectId,
      user.id,
      isAdmin,
    );

    if (!project) {
      if (isAdmin) throw new NotFoundException('Project not found');
      throw new ForbiddenException(
        'You are not authorized to access this project',
      );
    }

    request.project = project;
    return true;
  }
}
