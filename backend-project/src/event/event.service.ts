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
import { Project } from 'src/project/project.entity';
import { ActivityService } from 'src/activity/activity.service';
import * as dayjs from 'dayjs';
@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly activityService: ActivityService,
  ) {}

  async create(createEventDto: CreateEventDto, user: User): Promise<Event> {
    const project = await this.projectRepository.findOne({
      where: { id: createEventDto.projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      user,
      project,
      created_at: new Date(),
    });

    const savedEvent = await this.eventRepository.save(event);

    await this.activityService.logAction(
      user.id,
      `Created event "${savedEvent.e_name}" in project "${project.p_name}" starting at ${dayjs(savedEvent.start_date).format('DD MMM, YYYY')} and ending at ${dayjs(savedEvent.end_date).format('DD MMM, YYYY')}.`,
    );

    return savedEvent;
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
    user: User,
  ): Promise<Event> {
    const event = await this.findOne(id, user.id);
    const oldEventData = { ...event };

    Object.assign(event, updateEventDto);
    const updatedEvent = await this.eventRepository.save(event);

    if (user) {
      const changes: string[] = [];
      if (oldEventData.e_name !== updatedEvent.e_name)
        changes.push(
          `Title: "${oldEventData.e_name}" to "${updatedEvent.e_name}"`,
        );
      if (oldEventData.e_description !== updatedEvent.e_description)
        changes.push('Description changed');
      if (oldEventData.start_date !== updatedEvent.start_date)
        changes.push(
          `Start from: ${dayjs(oldEventData.start_date).format('DD MMM, YYYY')} to ${dayjs(updatedEvent.start_date).format('DD MMM, YYYY')}`,
        );
      if (oldEventData.end_date !== updatedEvent.end_date)
        changes.push(
          `End on: ${dayjs(oldEventData.end_date).format('DD MMM, YYYY')} to ${dayjs(updatedEvent.end_date).format('DD MMM, YYYY')}`,
        );

      const changesStr =
        changes.length > 0 ? changes.join('; ') : 'No significant changes';
      await this.activityService.logAction(
        user.id,
        `Updated event "${updatedEvent.e_name}". Updated on: ${changesStr}.`,
      );
    }

    return updatedEvent;
  }

  async delete(id: number, user: User): Promise<void> {
    const event = await this.findOne(id, user.id);
    await this.eventRepository.delete(event.id);

    if (user.id) {
      await this.activityService.logAction(
        user.id,
        `Deleted event "${event.e_name}" from project "${event.project?.p_name}".`,
      );
    }
  }

  async findAll(user: User): Promise<Event[]> {
    return this.eventRepository.find({
      where: { user: { id: user.id } }, // restrict to their own events
      relations: ['user', 'project'],
    });
  }

  async findOne(id: number, userId: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['user', 'project'],
    });

    if (!event) throw new NotFoundException('Event not found');

    if (event.user?.id !== userId) {
      throw new ForbiddenException('You do not have access to this event');
    }

    return event;
  }

  async findAllForAdmin(): Promise<Event[]> {
    return this.eventRepository.find({ relations: ['user', 'project'] });
  }
  async getAdminSummary() {
    const events = await this.findAllForAdmin();

    const summary: Record<string, number> = {};

    events.forEach((event) => {
      const userName = event.user
        ? `${event.user.first_name} ${event.user.last_name}`
        : 'Unknown';
      if (!summary[userName]) summary[userName] = 0;
      summary[userName]++;
    });

    return Object.entries(summary).map(([userName, eventCount]) => ({
      userName,
      eventCount,
    }));
  }
}
