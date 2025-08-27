import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { ProjectGuard } from './project.guard';

@UseGuards(AuthGuard('jwt'))
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll(@Request() req): Promise<Project[]> {
    if (!req.user?.id)
      throw new ForbiddenException('Invalid user authentication');

    const isAdmin = req.user.role === 'admin';
    return this.projectService.findAll(req.user.id, isAdmin);
  }

  @Get(':id')
  @UseGuards(ProjectGuard)
  findOne(@Param('id') id: string, @Request() req): Promise<Project> {
    const projectId = +id;
    if (isNaN(projectId)) throw new NotFoundException('Invalid project ID');

    const isAdmin = req.user.role === 'admin';
    return this.projectService.findOne(projectId, req.user.id, isAdmin);
  }

  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req,
  ): Promise<Project> {
    return this.projectService.createProject(createProjectDto, req.user);
  }

  @Patch(':id')
  @UseGuards(ProjectGuard)
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ): Promise<Project> {
    const projectId = +id;
    if (isNaN(projectId)) throw new NotFoundException('Invalid project ID');

    return this.projectService.update(projectId, updateProjectDto, req.user);
  }

  @Delete(':id')
  @UseGuards(ProjectGuard)
  delete(@Param('id') id: string, @Request() req): Promise<void> {
    const projectId = +id;
    if (isNaN(projectId)) throw new NotFoundException('Invalid project ID');

    return this.projectService.delete(projectId, req.user);
  }
}
