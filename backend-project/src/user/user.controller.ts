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
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const updatedUser = await this.userService.update(
      id,
      updateUserDto,
      req.user.id,
      ['password'],
    );
    if (!updatedUser) throw new NotFoundException('User not found');
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.userService.delete(id, req.user.id);
  }

@Patch(':id/reset-password')
async resetPassword(@Param('id', ParseIntPipe) id: number, @Request() req) {
  await this.userService.updatePassword(
    id,
    '',
    req.user.id,
    false,
    undefined,
    true, 
  );
  return { message: 'Password reset to default successfully' };
}
}
