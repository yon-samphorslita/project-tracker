import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { Status } from '../../enums/status.enum';

export class CreateEventDto {
  @IsString()
  e_name: string;

  @IsOptional()
  @IsString()
  e_description?: string;

  @IsOptional()
  @IsEnum(Status)
  e_status?: Status;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  projectId?: number;

  @IsOptional()
  @IsNumber()
  userId?: number;
}
