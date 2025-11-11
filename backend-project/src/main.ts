import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { createInitialAdmin } from './seeds/user.seed';
import { DataSource } from 'typeorm';
import { join } from 'path';
import * as express from 'express';
import { JwtRoleGuard } from './auth/jwt-role.guard';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //enable cors
  app.enableCors();

  //seed initial admin user
  const dataSource = app.get(DataSource);
  await createInitialAdmin(dataSource);

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
  const jwtService = app.get(JwtService);
  app.useGlobalGuards(new JwtRoleGuard(reflector, jwtService));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
