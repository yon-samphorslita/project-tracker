import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubtaskService } from './subtask.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Subtask } from './subtask.entity';

@Controller('subtask')
export class SubtaskController {
  constructor(private readonly subtaskService: SubtaskService) {}

  // Create a new subtask
  @Post()
  create(@Body() createSubtaskDto: CreateSubtaskDto): Promise<Subtask> {
    return this.subtaskService.create(createSubtaskDto);
  }

  // Retrieve all subtasks
  @Get()
  findAll(): Promise<Subtask[]> {
    return this.subtaskService.findAll();
  }

  // Retrieve a specific subtask by ID
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Subtask | null> {
    return this.subtaskService.findOne(+id);
  }

  // Retrieve subtasks by task ID
  @Get('task/:taskId')
  findByTaskId(@Param('taskId') taskId: string): Promise<Subtask[]> {
    return this.subtaskService.findByTaskId(+taskId);
  }

  // Update a specific subtask by ID
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
  ): Promise<Subtask | null> {
    return this.subtaskService.update(+id, updateSubtaskDto);
  }

  // Delete a specific subtask by ID
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.subtaskService.remove(+id);
  }
}
