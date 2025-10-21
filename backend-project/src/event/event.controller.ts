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
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { EventGuard } from './event.guard';

@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  findAll(@Request() req): Promise<Event[]> {
    if (req.user.role === 'admin') return this.eventService.findAll();
    return this.eventService.findAll(req.user.id, req.project.id);
  }

  @Get(':id')
  @UseGuards(EventGuard)
  findOne(@Param('id') id: string, @Request() req): Promise<Event> {
    const eventId = +id;
    return this.eventService.findOne(eventId, req.user.id, req.project.id);
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
    const eventId = +id;
    return this.eventService.update(eventId, updateEventDto, req.user);
  }

  @Delete(':id')
  @UseGuards(EventGuard)
  delete(@Param('id') id: string, @Request() req): Promise<void> {
    const eventId = +id;
    return this.eventService.delete(eventId, req.user.id);
  }
}
