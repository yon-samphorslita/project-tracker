import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { SubtaskService } from './subtask.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Subtask } from './subtask.entity';
import { SubtaskGuard } from './subtask.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/enums/role.enum';

@Controller('subtasks')
export class SubtaskController {
  constructor(private readonly subtaskService: SubtaskService) {}

  // Create a new subtask
  @Post()
  @Roles(Role.MEMBER)
  create(
    @Body() createSubtaskDto: CreateSubtaskDto,
    @Req() req,
  ): Promise<Subtask> {
    const userId = req.user.id;
    return this.subtaskService.create(createSubtaskDto, userId);
  }

  // Retrieve all subtasks
  @Get()
  findAll(): Promise<Subtask[]> {
    return this.subtaskService.findAll();
  }

  // Retrieve a specific subtask by ID
  @Get(':id')
  @UseGuards(SubtaskGuard)
  findOne(@Param('id') id: string): Promise<Subtask | null> {
    return this.subtaskService.findOne(+id);
  }

  // Retrieve subtasks by task ID
  @Get('task/:taskId')
  @UseGuards(SubtaskGuard)
  findByTaskId(@Param('taskId') taskId: string): Promise<Subtask[]> {
    const id = Number(taskId);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid task ID');
    }
    return this.subtaskService.findByTaskId(id);
  }

  // Update a specific subtask by ID
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MEMBER)
  @UseGuards(SubtaskGuard)
  update(
    @Param('id') id: string,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
    @Req() req,
  ): Promise<Subtask> {
    const userId = req.user.id;
    return this.subtaskService.update(+id, updateSubtaskDto, userId);
  }

  // Delete a specific subtask by ID
  @Delete(':id')
  @Roles(Role.ADMIN, Role.MEMBER)
  @UseGuards(SubtaskGuard)
  remove(@Param('id') id: string, @Req() req): Promise<Subtask> {
    const userId = req.user.id;
    return this.subtaskService.remove(+id, userId);
  }
}
