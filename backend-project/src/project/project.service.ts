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

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  // Create a project and assign the logged-in user
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

  // Get all projects for the logged-in user
  async findAll(userId: number): Promise<Project[]> {
    if (!userId)
      throw new ForbiddenException('User ID is required to fetch projects');

    return this.projectRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  // Get one project only if owned by user
  async findOne(id: number, userId: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
    if (!project)
      throw new NotFoundException(
        `Project with ID ${id} not found or access denied`,
      );
    return project;
  }

  // Update project only if owned by user
  async update(
    id: number,
    dto: UpdateProjectDto,
    user: User,
  ): Promise<Project> {
    const project = await this.findOne(id, user.id);
    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  // Delete project only if owned by user
  async delete(id: number, userId: number): Promise<void> {
    const project = await this.findOne(id, userId);
    await this.projectRepository.remove(project);
  }
}
