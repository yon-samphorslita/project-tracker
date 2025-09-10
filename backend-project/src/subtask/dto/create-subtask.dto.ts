import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { Status } from 'src/enums/status.enum';

export class CreateSubtaskDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsInt()
  @IsNotEmpty()
  taskId: number;
}