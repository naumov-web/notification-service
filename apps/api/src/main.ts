import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { setupSwagger } from '@app/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  setupSwagger(app);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
