// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   NotFoundException,
//   ForbiddenException,
// } from '@nestjs/common';
// import { EventService } from './event.service';

// @Injectable()
// export class EventGuard implements CanActivate {
//   constructor(private readonly eventService: EventService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const user = request.user;
//     const eventId = +request.params.id;

//     if (!user) throw new ForbiddenException('User not authenticated');

//     const event = await this.eventService.findOne(eventId);

//     if (!event) throw new NotFoundException('Event not found');

//     // Admin can access everything
//     if (user.role === 'admin') return true;

//     // Only the owner of the event can access
//     if (event.user?.id !== user.id) {
//       throw new ForbiddenException('You do not have access to this event');
//     }

//     return true;
//   }
// }
