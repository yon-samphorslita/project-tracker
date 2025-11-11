import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SubtaskModule } from './subtask/subtask.module';
import { EventModule } from './event/event.module';
import { NotificationModule } from './notification/notification.module';
import { TeamModule } from './team/team.module';
import { ActivityModule } from './activity/activity.module';
import { UploadController } from './upload/upload.controller';
import { JwtRoleGuard } from './auth/jwt-role.guard';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'admin',
      password: 'Password@123',
      database: 'project_management',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ProjectModule,
    TaskModule,
    UserModule,
    AuthModule,
    SubtaskModule,
    EventModule,
    NotificationModule,
    TeamModule,
    ActivityModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, JwtRoleGuard],
  exports: [JwtRoleGuard],
})
export class AppModule {}
