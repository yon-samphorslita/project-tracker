import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from './activity.entity';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { ActivityGateway } from './activity.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog]), AuthModule],
  providers: [ActivityService, ActivityGateway],
  controllers: [ActivityController],
  exports: [ActivityService],
})
export class ActivityModule {}
