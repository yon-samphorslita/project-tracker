import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createInitialAdmin } from './seeds/user.seed';
import { DataSource } from 'typeorm';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const dataSource = app.get(DataSource);
  await createInitialAdmin(dataSource);
  app.use(
    '/upload/images',
    express.static(join(__dirname, '..', 'upload/images')),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
