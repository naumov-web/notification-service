import { NestFactory } from '@nestjs/core';
import { SchedulerModule } from './scheduler.module';

async function bootstrap() {
  var app = await NestFactory.create(SchedulerModule);
  app.init();
}
bootstrap();
