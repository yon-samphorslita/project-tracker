import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { UpdatePasswordDto } from 'src/user/dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('users')
  async getAllUsers() {
    const users = await this.userService.findAll();
    return users.map(({ password, ...rest }) => rest);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Post('user')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.authService.createUser(createUserDto);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const token = await this.authService.login(user);
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...token };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    await this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.userService.findOne(req.user.id);
    if (!user) throw new NotFoundException('User not found');
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.id;
    if ('email' in updateUserDto) delete updateUserDto.email;
    if ('password' in updateUserDto) delete updateUserDto.password;

    const updatedUser = await this.userService.update(userId, updateUserDto);
    if (!updatedUser) throw new NotFoundException('User not found');
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('user/:id')
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if ('password' in updateUserDto) delete updateUserDto.password;
    if (updateUserDto.email) {
      const existing = await this.userService.findOneByEmail(
        updateUserDto.email,
        true,
      );
      if (existing && existing.id !== Number(userId)) {
        throw new ForbiddenException('Email is already in use');
      }
    }

    const updatedUser = await this.userService.update(
      Number(userId),
      updateUserDto,
    );
    if (!updatedUser) throw new NotFoundException('User not found');
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update-password')
  async updatePassword(@Request() req, @Body() body: UpdatePasswordDto) {
    const user = await this.userService.findOneByEmail(req.user.email, true);
    if (!user) throw new NotFoundException('User not found');
    if (req.user.role !== Role.ADMIN && user.password_changed) {
      throw new ForbiddenException('You can only update your password once.');
    }

    if (!user.password)
      throw new ForbiddenException('No password set for this user');

    const valid = await bcrypt.compare(
      String(body.oldPassword),
      String(user.password),
    );
    if (!valid) throw new ForbiddenException('Old password is incorrect');

    await this.authService.updateUserPassword(
      req.user.id,
      body.newPassword,
      true,
    );
    return { message: 'Password updated successfully' };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('user/:id/update-password')
  async adminUpdatePassword(
    @Param('id') userId: number,
    @Body() body: { newPassword: string },
  ) {
    const user = await this.userService.findOne(Number(userId), true);
    if (!user) throw new NotFoundException('User not found');
    await this.authService.updateUserPassword(
      Number(userId),
      body.newPassword,
      false,
    );
    return { message: 'Password updated successfully by admin' };
  }

  // Unauthenticated request OTP
  @Post('request-otp')
  async requestOtp(@Body() body: { email: string }) {
    const user = await this.userService.findOneByEmail(body.email, true);
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.authService.generateOtp(user.id);
    // Optionally send email here
    return { message: 'OTP sent to your email', otp };
  }

  // Reset password (unauthenticated, using email + OTP)
  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; otp: string; newPassword: string },
  ) {
    // Find user by email
    const user = await this.userService.findOneByEmail(body.email, true);
    if (!user) throw new NotFoundException('User not found');

    // Verify OTP
    const validOtp = await this.authService.verifyOtp(user.id, body.otp);
    if (!validOtp) throw new ForbiddenException('Invalid or expired OTP');

    // Update password
    await this.authService.updateUserPassword(user.id, body.newPassword, true);
    return { message: 'Password updated successfully' };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    const user = await this.userService.findOneByEmail(body.email, true);
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    if (
      !user.otp_code ||
      !user.otp_expiry ||
      user.otp_code !== body.otp ||
      new Date(user.otp_expiry) < now
    ) {
      throw new ForbiddenException('Invalid or expired OTP');
    }

    return { message: 'OTP verified successfully' };
  }
}
