export type DeliveryStatus = 'pending' | 'processing' | 'sent' | 'failed';

export interface DeliveryRow {
  id: string;
  notificationId: string;

  channel: string;
  target: string;
  renderedBody: string;

  status: DeliveryStatus;

  attempts: number;
  maxRetries: number;

  nextRetryAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}
