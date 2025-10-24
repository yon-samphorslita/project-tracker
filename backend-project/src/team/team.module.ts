import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { Team } from './team.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { NotificationModule } from 'src/notification/notification.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, User]),
    NotificationModule,
  ],
  controllers: [TeamController],
  providers: [TeamService, UserService],
})
export class TeamModule {}
