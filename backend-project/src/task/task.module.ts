import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { TaskController } from './task.controller';
import { NotificationsGateway } from 'src/notification/notification.gateway';
import { User } from 'src/user/user.entity';
import { Project } from 'src/project/project.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { ProjectModule } from '../project/project.module';
import { ActivityModule } from 'src/activity/activity.module';
@Module({
  imports: [TypeOrmModule.forFeature([Task, User, Project]), NotificationModule, ProjectModule, ActivityModule],
  providers: [TaskService],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {}
