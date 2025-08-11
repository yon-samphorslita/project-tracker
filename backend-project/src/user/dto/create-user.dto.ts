import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class CreateUserDto {
  //   @IsNotEmpty()
  //   @IsString()
  //   first_name: string;

  //   @IsNotEmpty()
  //   @IsString()
  //   last_name: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  //   @IsNotEmpty()
  @IsOptional()
  @IsEnum(Role)
  role: Role;

  @IsString()
  @IsOptional()
  img_url?: string;
}
