import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { DatabaseModule } from '@app/database';
import {NotificationsModule} from "./notifications/notifications.module";

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [],
  providers: [ApiService],
})
export class ApiModule {}
