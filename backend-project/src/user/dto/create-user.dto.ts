import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from 'src/enums/role.enum';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  first_name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  last_name?: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be valid' })
  role?: Role;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  img_url?: string;
}
