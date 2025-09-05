import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { Task } from './task.entity';
import { TaskController } from './task.controller';
import { ProjectModule } from '../project/project.module';
import { ActivityModule } from 'src/activity/activity.module';
@Module({
  imports: [TypeOrmModule.forFeature([Task]), ProjectModule, ActivityModule],
  providers: [TaskService],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {}
