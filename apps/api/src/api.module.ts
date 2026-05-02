import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { DatabaseModule } from '@app/database';
import {NotificationsModule} from "./notifications/notifications.module";
import { AuthModule } from '@app/auth';
import { AuthModule as AuthApiModule } from "./auth/auth.module"

@Module({
  imports: [DatabaseModule, NotificationsModule, AuthModule, AuthApiModule],
  controllers: [],
  providers: [ApiService],
})
export class ApiModule {}
