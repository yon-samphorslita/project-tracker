import { Controller, Get, Post, Patch, Delete, Body, Param } from "@nestjs/common";
import { TaskService } from "./task.service";
import { Task } from "./task.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    @Get()
    findAll(): Promise<Task[]> {
        return this.taskService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number): Promise<Task | null> {
        return this.taskService.findOne(id);
    }

    @Post()
    create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
        return this.taskService.create(createTaskDto);
    }

    @Patch(':id')
    update(
        @Param('id') id: number,
        @Body() updateTaskDto: UpdateTaskDto,
    ): Promise<Task | null> {
        return this.taskService.update(id, updateTaskDto);
    }

    @Delete(':id')
    delete(@Param('id') id: number): Promise<void> {
        return this.taskService.delete(id);
    }
}