import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedUsers } from './seeds/user.seed';
import { DataSource } from 'typeorm';
import { join } from 'path';
import * as express from 'express';
import { JwtRoleGuard } from './auth/jwt-role.guard';
import { ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //enable cors
  app.enableCors();

  //seed initial admin user
  const dataSource = app.get(DataSource);
  await seedUsers(dataSource);

  //serve static images
  app.use(
    '/upload/images',
    express.static(join(__dirname, '..', 'upload/images')),
  );

  //apply global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  //apply global jwt and role guard
  const reflector = app.get(Reflector);
  const authService = app.get(AuthService)
  app.useGlobalGuards(new JwtRoleGuard(reflector, authService));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
