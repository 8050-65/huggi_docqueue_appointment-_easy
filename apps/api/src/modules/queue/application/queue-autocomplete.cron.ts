// apps/api/src/modules/queue/application/queue-autocomplete.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueueService } from './queue.service';

@Injectable()
export class QueueAutoCompleteCron {
  private readonly logger = new Logger(QueueAutoCompleteCron.name);

  constructor(private readonly queue: QueueService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async autoCompleteConsultations() {
    const completed = await this.queue.autoCompleteStaleConsultations();
    if (completed > 0) {
      this.logger.log(`Auto-completed ${completed} stale consultation(s)`);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async autoMarkNoShow() {
    const marked = await this.queue.autoMarkNoShow();
    if (marked > 0) {
      this.logger.log(`Auto-marked ${marked} appointment(s) as no-show`);
    }
  }
}
