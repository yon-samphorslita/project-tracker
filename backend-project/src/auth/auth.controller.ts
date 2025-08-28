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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('users')
  async getAllUsers() {
    const users = await this.userService.findAll();

    return users.map(({ password, ...rest }) => rest);
  }

  // Create user (admin only)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.authService.createUser(createUserDto);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // Login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const token = await this.authService.login(user);
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...token };
  }
  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    await this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }

  // Get profile
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.userService.findOne(req.user.id);
    if (!user) throw new NotFoundException('User not found');

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update profile (cannot update email or password)
  @UseGuards(AuthGuard)
  @Patch('update')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.id;

    // Remove email and password updates
    if ('email' in updateUserDto) delete updateUserDto.email;
    if ('password' in updateUserDto) delete updateUserDto.password;

    const updatedUser = await this.userService.update(userId, updateUserDto);
    if (!updatedUser) throw new NotFoundException('User not found');

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
  @UseGuards(AuthGuard)
  @Patch('update-password')
  async updatePassword(@Request() req, @Body() body: UpdatePasswordDto) {
    const userId = req.user.id;

    // Fetch user including password
    const user = await this.userService.findOneByEmail(req.user.email, true);
    if (!user) throw new NotFoundException('User not found');

    // Verify old password
    const valid = await bcrypt.compare(body.oldPassword, user.password);
    if (!valid) throw new ForbiddenException('Old password is incorrect');

    // Update to new password
    await this.authService.updateUserPassword(userId, body.newPassword);

    return { message: 'Password updated successfully' };
  }
}
