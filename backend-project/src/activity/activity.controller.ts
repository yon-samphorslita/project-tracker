import { Controller, Get, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { Role } from '../enums/role.enum';
import { Roles } from 'src/auth/roles.decorator';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Roles(Role.ADMIN)
  @Get('logs')
  async getLogs() {
    return this.activityService.getLogs();
  }
}
