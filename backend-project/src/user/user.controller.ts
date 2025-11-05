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
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @Request() req): Promise<User> {
    const performedById = req.user.id;
    return this.userService.createUser(createUserDto, performedById);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User | null> {
    return this.userService.findOne(id);
  }

  @Get(':id/teams')
  getUserTeams(@Param('id') id: number) {
    return this.userService.getUserTeams(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req, // add request to get the admin performing the action
  ): Promise<User | null> {
    const performedById = req.user.id; // the user performing the update
    return this.userService.update(id, updateUserDto, performedById);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<void> {
    const performedById = req.user.id;
    return this.userService.delete(id, performedById);
  }
}
