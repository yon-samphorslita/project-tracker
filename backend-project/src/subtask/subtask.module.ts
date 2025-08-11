import { Module } from '@nestjs/common';
import { SubtaskService } from './subtask.service';
import { SubtaskController } from './subtask.controller';
import { Subtask } from './subtask.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Subtask])],
  controllers: [SubtaskController],
  providers: [SubtaskService],
})
export class SubtaskModule {}
