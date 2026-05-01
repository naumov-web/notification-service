import { Module } from '@nestjs/common';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { DatabaseModule } from '@app/database';
import { ScheduleModule } from '@nestjs/schedule';
import {OutboxModule} from "./outbox/outbox.module";

@Module({
  imports: [
      DatabaseModule,
      ScheduleModule.forRoot(),
      OutboxModule,
  ],
  controllers: [SchedulerController],
  providers: [SchedulerService],
})
export class SchedulerModule {
  constructor() {
    console.log('📦 SchedulerModule initialized');
  }
}
