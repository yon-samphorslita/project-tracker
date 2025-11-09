import { Module } from '@nestjs/common';
import { SubtaskService } from './subtask.service';
import { SubtaskController } from './subtask.controller';
import { Subtask } from './subtask.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityModule } from 'src/activity/activity.module';
import { SubtaskGuard } from './subtask.guard';
import { Task } from 'src/task/task.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Subtask, Task]), ActivityModule],
  controllers: [SubtaskController],
  providers: [SubtaskService, SubtaskGuard],
})
export class SubtaskModule {}
