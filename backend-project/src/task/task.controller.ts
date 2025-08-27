import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { TaskGuard } from './task.guard';

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll(@Request() req): Promise<Task[]> {
    if (!req.user?.id)
      throw new ForbiddenException('Invalid user authentication');
    if (req.user.role === 'admin') return this.taskService.findAll();
    return this.taskService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(TaskGuard)
  findOne(@Param('id') id: string, @Request() req): Promise<Task> {
    const taskId = +id;
    return this.taskService.findOne(taskId, req.user.id);
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @Request() req,
  ): Promise<Task[]> {
    const pid = +projectId;
    if (req.user.role === 'admin') return this.taskService.findByProject(pid);
    return this.taskService.findByProject(pid, req.user.id);
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req): Promise<Task> {
    return this.taskService.create(createTaskDto, req.user);
  }

  @Patch(':id')
  @UseGuards(TaskGuard)
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ): Promise<Task> {
    const taskId = +id;
    return this.taskService.update(taskId, updateTaskDto, req.user);
  }

  @Delete(':id')
  @UseGuards(TaskGuard)
  delete(@Param('id') id: string, @Request() req): Promise<void> {
    const taskId = +id;
    return this.taskService.delete(taskId, req.user.id);
  }
}
