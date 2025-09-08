import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotificationsGateway } from 'src/notification/notification.gateway';
import { User } from 'src/user/user.entity';
import { Project } from 'src/project/project.entity';
import { Notification } from 'src/notification/notification.entity';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,

    @InjectRepository(User) 
    private readonly userRepo: Repository<User>,

    @InjectRepository(Project) 
    private readonly projectRepo: Repository<Project>,

    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    // Fetch related user
    const user = await this.userRepo.findOne({ 
      where: { id: createTaskDto.userId } 
    });
    if (!user) throw new Error(`User with ID ${createTaskDto.userId} not found`);

    // Fetch related project
    const project = await this.projectRepo.findOne({
      where: { id: createTaskDto.projectId },
    });
    if (!project) throw new Error(`Project with ID ${createTaskDto.projectId} not found`);

    // Create task entity
    const task = this.taskRepository.create({
      t_name: createTaskDto.t_name,
      t_description: createTaskDto.t_description,
      t_priority: createTaskDto.t_priority,
      start_date: createTaskDto.start_date,
      due_date: createTaskDto.due_date,
      user,      
      project,   
      // created_at: new Date(),
    });

    const savedTask = await this.taskRepository.save(task);

    // Save notification in DB
    const notification = await this.notificationService.create({
      userId: user.id,
      title: "New Task Assigned",
      message: `${savedTask.t_name}`,
      // message: `You have been assigned a new task "${savedTask.t_name}" in project "${project.p_name}". Due: ${savedTask.due_date}`,
      read_status: false,
    });

    // Send notification
    this.notificationsGateway.sendNotification(
      String(user.id),
      notification
    );

    return savedTask;
  }


  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  async findOne(id: number): Promise<Task | null> {
    return this.taskRepository.findOneBy({ id });
  }
  async findByProject(projectId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { project: { id: projectId } },
      relations: ['project'],
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    await this.taskRepository.update(id, updateTaskDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.taskRepository.delete(id);
  }
}
