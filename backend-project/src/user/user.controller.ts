import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Request,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/enums/role.enum';
@Roles(Role.ADMIN)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.userService.createUser(createUserDto, req.user.id);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Get(':id/teams')
  async getUserTeams(@Param('id') id: number) {
    return this.userService.getUserTeams(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto | ResetPasswordDto,
    @Request() req,
  ) {
    if ('resetPassword' in body && body.resetPassword === true) {
      return this.userService.resetPassword(
        id,
        req.user.id,
      );
    }

    return this.userService.update(id, body as UpdateUserDto, req.user.id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.userService.delete(id, req.user.id);
  }
}
