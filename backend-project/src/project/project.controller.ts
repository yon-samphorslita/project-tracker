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
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectGuard } from './project.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/enums/role.enum';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  findAll(@Request() req): Promise<Project[]> {
    return this.projectService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(ProjectGuard)
  findOne(@Param('id') id: string, @Request() req): Promise<Project> {
    return this.projectService.findOne(+id);
  }

  @Get('pm/:pmId')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  findProjectsForPM(@Param('pmId') pmId: string): Promise<Project[]> {
    return this.projectService.findProjectsForPM(+pmId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req,
  ): Promise<Project> {
    return this.projectService.createProject(createProjectDto, req.user);
  }

  @Patch(':id')
  @UseGuards(ProjectGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ): Promise<Project> {
    return this.projectService.update(+id, updateProjectDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @UseGuards(ProjectGuard)
  delete(@Param('id') id: string, @Request() req): Promise<void> {
    return this.projectService.delete(+id, req.user);
  }
}
