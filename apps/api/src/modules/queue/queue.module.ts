// apps/api/src/modules/queue/queue.module.ts
import { Module } from '@nestjs/common';
import { QueueService } from './application/queue.service';
import { QueueController } from './infrastructure/queue.controller';
import { QueueRepository } from './infrastructure/queue.repository';
import { QueueAutoCompleteCron } from './application/queue-autocomplete.cron';

@Module({
  controllers: [QueueController],
  providers: [QueueService, QueueRepository, QueueAutoCompleteCron],
  exports: [QueueService],
})
export class QueueModule {}
