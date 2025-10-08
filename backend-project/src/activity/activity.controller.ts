// src/activity/activity.controller.ts
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ActivityService } from './activity.service';
import { Role } from '../enums/role.enum';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @UseGuards(AuthGuard)
  @Get('logs')
  async getLogs(@Request() req) {
    const user = req.user;
    return this.activityService.getLogs(user.id, user.role === Role.ADMIN);
  }
}
