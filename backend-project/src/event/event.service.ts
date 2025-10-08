import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from 'src/user/user.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, user: User): Promise<Event> {
    const event = this.eventRepository.create({
      ...createEventDto,
      user: user,
      created_at: new Date(),
    });
    return this.eventRepository.save(event);
  }

  async findAll(userId?: number): Promise<Event[]> {
    if (userId) {
      return this.eventRepository.find({
        where: { user: { id: userId } },
        relations: ['user'],
      });
    }
    return this.eventRepository.find({ relations: ['user'] });
  }

  async findOne(id: number, userId?: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!event) throw new NotFoundException('Event not found');
    if (userId && event.user?.id !== userId) {
      throw new ForbiddenException('You do not have access to this event');
    }
    return event;
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
    user?: User,
  ): Promise<Event> {
    const event = await this.findOne(id, user?.id);
    Object.assign(event, updateEventDto);
    return this.eventRepository.save(event);
  }

  async delete(id: number, userId?: number): Promise<void> {
    const event = await this.findOne(id, userId);
    await this.eventRepository.delete(event.id);
  }
}
