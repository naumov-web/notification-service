import { Module } from '@nestjs/common';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';
import { DatabaseModule } from '@app/database';
import {EventsModule} from "./events/events.module";

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [WorkerController],
  providers: [WorkerService],
})
export class WorkerModule {}
