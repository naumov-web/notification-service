import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { EventsModule } from './events/events.module';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [],
  providers: [],
})
export class WorkerModule {}
