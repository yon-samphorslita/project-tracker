import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.createUser(createUserDto);

    // Generate JWT token for new user
    const token = await this.authService.login(user);

    // Exclude password before sending response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...token, // { accessToken }
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.authService.login(user);

    // Exclude password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...token,
    };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // User info is injected into req.user by AuthGuard
    return req.user;
  }
}
