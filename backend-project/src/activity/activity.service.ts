import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity.entity';
import { ActivityGateway } from './activity.gateway';
import { User } from '../user/user.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityRepo: Repository<ActivityLog>,
    private readonly gateway: ActivityGateway,
  ) {}

  // Called whenever a user performs an action
  async logAction(userId: number, action: string) {
    // Save log
    const log = this.activityRepo.create({ userId, action });
    const savedLog = await this.activityRepo.save(log);

    // Reload the log with user relation
    const logWithUser = await this.activityRepo.findOne({
      where: { id: savedLog.id },
      relations: ['user'],
    });

    if (!logWithUser) {
      throw new Error('Failed to load saved activity log with user');
    }

    // Emit to admin clients
    this.gateway.sendLog({
      id: logWithUser.id,
      userId: logWithUser.userId,
      user: { email: logWithUser.user?.email },
      action: logWithUser.action,
      createdAt: logWithUser.createdAt,
    });

    return logWithUser;
  }

  // Admin-only: get all logs
  async getLogs() {
    return this.activityRepo.find({
      order: { createdAt: 'DESC' },
    });
  }
}
