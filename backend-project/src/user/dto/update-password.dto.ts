// update-password.dto.ts
import { IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @IsNotEmpty()
  oldPassword: string; // optional, if you want user to confirm current password
}
