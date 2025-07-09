import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(__dirname, '..', '..', '..', '.env');
console.log('Looking for .env at:', envPath);

dotenv.config({
  path: envPath,
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 8081);
}
bootstrap();
