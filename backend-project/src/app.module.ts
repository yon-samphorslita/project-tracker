import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SubtaskModule } from './subtask/subtask.module';
import { NotificationModule } from './notification/notification.module';
import { MemberModule } from './member/member.module';
// import { EventModule } from './event/event.module';
import { authMiddlewareFactory } from './auth/auth.middleware.factory';
import { Role } from './enums/role.enum';

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
    NotificationModule,
    MemberModule,
    // EventModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Admin only route
    consumer
      .apply(authMiddlewareFactory([Role.ADMIN]))
      .forRoutes({ path: 'auth/admin', method: RequestMethod.GET });

    // Admin OR Project Manager route
    consumer
      .apply(authMiddlewareFactory([Role.ADMIN, Role.PROJECT_MANAGER]))
      .forRoutes({ path: 'auth/pm-or-admin', method: RequestMethod.GET });
  }
}
