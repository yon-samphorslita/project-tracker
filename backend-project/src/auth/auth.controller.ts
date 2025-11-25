import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { UpdatePasswordDto } from 'src/user/dto/update-password.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const token = await this.authService.login(user);
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    await this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }

  @Patch('update-password')
  async updatePassword(@Request() req, @Body() body: UpdatePasswordDto) {
    await this.authService.updatePassword(
      req.user.id,
      body.oldPassword,
      body.newPassword,
    );
    return { message: 'Password updated successfully' };
  }

  @Public()
  @Post('request-otp')
  async requestOtp(@Body() body: { email: string }) {
    const user = await this.authService.findOneByEmail(body.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.authService.generateOtp(user.email);
    return { message: 'OTP sent to your email', otp };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; otp: string; newPassword: string },
  ) {
    const validOtp = await this.authService.verifyOtp(body.email, body.otp);
    if (!validOtp) throw new ForbiddenException('Invalid or expired OTP');

    await this.authService.updatePasswordByEmail(body.email, body.newPassword);
    return { message: 'Password updated successfully' };
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    const isValid = await this.authService.verifyOtp(body.email, body.otp);
    if (!isValid) throw new NotFoundException('Invalid or expired OTP');

    return { message: 'OTP verified successfully' };
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.userService.findOne(req.user.id);
    if (!user) throw new NotFoundException('User not found');
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const excluded = [
      'email',
      'password',
      'role',
      'id',
      'active',
      'password_changed',
      'otp_code',
      'otp_expiry',
      'created_at',
      'deletedAt',
    ];
    excluded.forEach((field) => delete updateUserDto[field]);

    const updatedUser = await this.userService.update(
      req.user.id,
      updateUserDto,
      req.user.id,
    );
    if (!updatedUser) throw new NotFoundException('User not found');
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
