import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createInitialAdmin } from './seeds/user.seed';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const dataSource = app.get(DataSource);
  await createInitialAdmin(dataSource);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
