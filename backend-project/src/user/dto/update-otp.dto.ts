import { Type } from 'class-transformer';
import { IsOptional, IsString, IsDate } from 'class-validator';

export class UpdateOtpDto {
  @IsOptional()
  @IsString()
  otp_code?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  otp_expiry?: Date;
}
