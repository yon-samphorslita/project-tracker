import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { Project } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectService: ProjectService) {}
  @Get()
  findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Project | null> {
    return this.projectService.findOne(id);
  }

  @Post()
  create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectService.createProject(createProjectDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<Project | null> {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.projectService.delete(id);
  }
}
