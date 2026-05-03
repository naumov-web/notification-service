import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: client.Registry;

  public deliveriesTotal: client.Counter<string>;
  public deliveriesSent: client.Counter<string>;
  public deliveriesFailed: client.Counter<string>;
  public retriesTotal: client.Counter<string>;

  constructor() {
    this.registry = new client.Registry();
    client.collectDefaultMetrics({ register: this.registry });

    this.deliveriesTotal = new client.Counter({
      name: 'deliveries_total',
      help: 'Total number of delivery attempts',
      labelNames: ['channel'],
      registers: [this.registry],
    });

    this.deliveriesSent = new client.Counter({
      name: 'deliveries_sent_total',
      help: 'Total number of successful deliveries',
      labelNames: ['channel'],
      registers: [this.registry],
    });

    this.deliveriesFailed = new client.Counter({
      name: 'deliveries_failed_total',
      help: 'Total number of failed deliveries',
      labelNames: ['channel'],
      registers: [this.registry],
    });

    this.retriesTotal = new client.Counter({
      name: 'deliveries_retries_total',
      help: 'Total number of retries',
      labelNames: ['channel'],
      registers: [this.registry],
    });
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
