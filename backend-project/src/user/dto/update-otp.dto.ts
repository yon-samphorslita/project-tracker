import { CreateUserDto } from './create-user.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsDate } from 'class-validator';

export class UpdateOtpDto {
  @IsOptional()
  @IsString()
  otp_code?: string;

  @IsOptional()
  @IsDate()
  otp_expiry?: Date;
}
