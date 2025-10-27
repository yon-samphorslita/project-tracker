import {
  Controller,
  Get,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivityService } from './activity.service';
import { Role } from '../enums/role.enum';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('logs')
  async getLogs(@Request() req) {
    const user = req.user;

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied: admin only');
    }

    return this.activityService.getLogs();
  }
}
