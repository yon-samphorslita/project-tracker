import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamDto } from './create-team.dto';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTeamDto  {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  addPms?: number[]

  @IsArray()
  @IsOptional()
  removePms?: number[]

  @IsArray()
  @IsOptional()
  addMembers?: number[]

  @IsArray()
  @IsOptional()
  removeMembers?: number[]

  addSecondaryMembers?: number[];
  removeSecondaryMembers?: number[];
}
