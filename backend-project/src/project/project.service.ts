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
      relations: ['members', 'members.user', 'user'],
    });

    if (!project)
      throw new NotFoundException(
        `Project with ID ${id} not found or access denied`,
      );
    return project;
  }

  async update(
    id: number,
    dto: UpdateProjectDto,
    user: User,
  ): Promise<Project> {
    const project = await this.findOne(id, user.id, user.role === 'admin');

    if (project.user.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Only owner can modify the project');
    }

    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  async delete(id: number, user: User): Promise<void> {
    const project = await this.findOne(id, user.id, user.role === 'admin');

    if (project.user.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Only owner can delete the project');
    }

    await this.projectRepository.remove(project);
  }
}
