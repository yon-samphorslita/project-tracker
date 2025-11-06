import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { EventGuard } from './event.guard';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  findAll(@Request() req): Promise<Event[]> {
    return this.eventService.findAll(req.user);
  }
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('summary')
  async getAdminSummary() {
    return this.eventService.getAdminSummary();
  }

  @Get(':id')
  @UseGuards(EventGuard)
  findOne(@Param('id') id: string, @Request() req): Promise<Event> {
    return this.eventService.findOne(+id, req.user.id);
  }

  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @Request() req,
  ): Promise<Event> {
    return this.eventService.create(createEventDto, req.user);
  }

  @Patch(':id')
  @UseGuards(EventGuard)
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
  ): Promise<Event> {
    return this.eventService.update(+id, updateEventDto, req.user);
  }

  @Delete(':id')
  @UseGuards(EventGuard)
  delete(@Param('id') id: string, @Request() req): Promise<void> {
    return this.eventService.delete(+id, req.user);
  }
}
