import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Project } from 'src/project/project.entity';
import { Task } from 'src/task/task.entity';
import { User } from 'src/user/user.entity';
import { ProjectModule } from 'src/project/project.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Project, Task, User]),
    ProjectModule,
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
