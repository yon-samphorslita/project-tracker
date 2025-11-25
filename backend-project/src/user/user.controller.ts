import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Request,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/enums/role.enum';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateUserDto, @Request() req) {
    return this.userService.createUser(dto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.userService.findAll();
  }

  @Get('members')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  async getCandidates() {
    const users = await this.userService.findAll();
    return users.map((u) => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
      team: u.team,
    }));
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Get(':id/teams')
  async getUserTeams(@Param('id') id: number) {
    return this.userService.getUserTeams(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto | ResetPasswordDto,
    @Request() req,
  ) {
    if ('resetPassword' in body && body.resetPassword === true) {
      return this.userService.resetPassword(id, req.user.id);
    }

    return this.userService.update(id, body as UpdateUserDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.userService.delete(id, req.user.id);
  }
}
