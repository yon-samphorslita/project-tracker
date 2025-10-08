// src/activity/activity.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityRepo: Repository<ActivityLog>,
  ) {}

  async logAction(userId: number, action: string) {
    const log = this.activityRepo.create({ userId, action });
    return this.activityRepo.save(log);
  }

  async getLogs(userId: number, isAdmin: boolean) {
    if (isAdmin)
      return this.activityRepo.find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    return this.activityRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }
}
