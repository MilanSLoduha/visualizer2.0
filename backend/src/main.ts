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
  
  // Povolte CORS pre všetky origins (pre development)
  app.enableCors({
    origin: true, // Alebo ['http://localhost:3000', 'http://localhost:3001']
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  await app.listen(process.env.PORT ?? 8081);
  console.log('🚀 Backend beží na http://localhost:8081');
}
bootstrap();
