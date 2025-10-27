import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectService } from './project.service';
import { Project } from './project.entity';
import { ProjectsController } from './project.controller';
import { ActivityModule } from 'src/activity/activity.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    ActivityModule,
    NotificationModule,
  ],
  providers: [ProjectService],
  controllers: [ProjectsController],
  exports: [ProjectService],
})
export class ProjectModule {}
