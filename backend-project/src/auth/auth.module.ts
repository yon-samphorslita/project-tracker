import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';
import { JwtStrategy } from './jwt.strategy';
import { AuthGuard } from './auth.guard';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    UserModule,
    ConfigModule, // Import ConfigModule here
    JwtModule.registerAsync({
      imports: [ConfigModule], // import ConfigModule to get access to ConfigService
      inject: [ConfigService], // inject ConfigService
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // get secret from env
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      global: true, // make JwtModule global if needed
    }),
  ],
  providers: [AuthService, JwtStrategy, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
