import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
} from 'class-validator';
import { Status } from '../../enums/status.enum';
import { Priority } from '../../enums/priority.enum';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  t_name: string;

  @IsOptional()
  @IsString()
  t_description?: string;

  @IsOptional()
  @IsEnum(Status)
  t_status?: Status;

  @IsOptional()
  @IsEnum(Priority)
  t_priority?: Priority;

  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @IsOptional()
  @IsDateString()
  due_date?: Date;

  @IsNotEmpty()
  @IsInt()
  projectId?: number;

  @IsOptional()
  @IsInt()
  userId?: number;
}
