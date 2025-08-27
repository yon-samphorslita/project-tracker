import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Status } from '../../enums/status.enum';
import { Priority } from '../../enums/priority.enum';
export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  p_name: string;

  @IsOptional()
  @IsString()
  p_description?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsDateString()
  start_date?: Date;

  @IsOptional()
  @IsDateString()
  due_date?: Date;
}
