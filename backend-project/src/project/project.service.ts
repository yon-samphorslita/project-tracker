import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../user/user.entity';
import { Status } from '../enums/status.enum';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  // Create a new project
  async createProject(
    createProjectDto: CreateProjectDto,
    user: User,
  ): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      user,
      created_at: new Date(),
    });
    return this.projectRepository.save(project);
  }

  // Find all projects (admin → all, user → own or member)
  async findAll(userId?: number, isAdmin = false): Promise<Project[]> {
    if (isAdmin || !userId) {
      return this.projectRepository.find({
        relations: ['members', 'members.user', 'user'],
      });
    }

    return this.projectRepository.find({
      where: [{ user: { id: userId } }, { members: { user: { id: userId } } }],
      relations: ['members', 'members.user', 'user'],
    });
  }

  // Find a single project by ID
  async findOne(
    id: number,
    userId?: number,
    isAdmin = false,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: isAdmin
        ? { id }
        : [
            { id, user: { id: userId } },
            { id, members: { user: { id: userId } } },
          ],
      relations: ['members', 'members.user', 'user', 'tasks', 'tasks.subtasks'],
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${id} not found or access denied`,
      );
    }

    return project;
  }

  // Update a project
  async update(
    id: number,
    dto: UpdateProjectDto,
    user: User,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['user', 'tasks', 'tasks.subtasks'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (project.user.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Only owner can modify the project');
    }

    // Prevent completing project if tasks/subtasks are incomplete
    if (dto.status === Status.COMPLETED) {
      const hasIncomplete = project.tasks.some(
        (task) =>
          task.t_status !== Status.COMPLETED ||
          task.subtasks?.some((sub) => sub.status !== Status.COMPLETED),
      );

      if (hasIncomplete) {
        throw new ForbiddenException(
          'Cannot mark project as completed until all tasks and subtasks are completed',
        );
      }
    }

    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  // Refresh project status based on tasks/subtasks
  async refreshProjectStatus(projectId: number): Promise<void> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['tasks', 'tasks.subtasks'],
    });

    if (!project) return;

    project.status = this.computeProjectStatus(project);
    await this.projectRepository.save(project);
  }

  // Compute project status dynamically
  private computeProjectStatus(project: Project): Status {
    if (!project.tasks?.length) return Status.NOT_STARTED;

    const allCompleted = project.tasks.every((task) => {
      const subtasksCompleted =
        task.subtasks?.every((sub) => sub.status === Status.COMPLETED) ?? true;
      return task.t_status === Status.COMPLETED && subtasksCompleted;
    });
    if (allCompleted) return Status.COMPLETED;

    const allNotStarted = project.tasks.every((task) => {
      const subtasksNotStarted =
        task.subtasks?.every((sub) => sub.status === Status.NOT_STARTED) ??
        true;
      return task.t_status === Status.NOT_STARTED && subtasksNotStarted;
    });
    if (allNotStarted) return Status.NOT_STARTED;

    return Status.IN_PROGRESS;
  }

  // Delete a project
  async delete(id: number, user: User): Promise<void> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (project.user.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Only owner can delete the project');
    }

    await this.projectRepository.remove(project);
  }
}
