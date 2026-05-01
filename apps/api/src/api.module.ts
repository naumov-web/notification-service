import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { DatabaseModule } from '@app/database';
import {NotificationsModule} from "./notifications/notifications.module";

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
