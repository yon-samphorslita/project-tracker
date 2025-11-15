import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { Role } from 'src/enums/role.enum';

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

    const project = await this.projectService.findOne(projectId);

    if (!project) throw new NotFoundException('Project not found');

    // Role-based access
    const canAccess =
      user.role === Role.ADMIN ||
      (user.role === Role.PROJECT_MANAGER &&
        project.team?.pms?.some(
          (pm) => pm.id === user.id)) ||
      (user.role === Role.MEMBER &&
        (project.team?.members?.some(
          (m) => m.id === user.id) ||
          project.team?.mainMembers?.some(
            (mm) => mm.id === user.id))) || 
            project.user?.id === user.id; // owner

    if (!canAccess) {
      throw new ForbiddenException(
        'You are not authorized to access this project',
      );
    }

    request.project = project;
    return true;
  }
}
