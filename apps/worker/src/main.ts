import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  app.init();
}
bootstrap();
