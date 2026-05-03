export type NotificationStatus =
  | 'pending'
  | 'processing'
  | 'done'
  | 'failed'
  | 'cancelled';

export interface NotificationRow {
  id: string;

  userId: string;
  eventType: string;
  parameters: Record<string, any>;

  status: NotificationStatus;

  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryRow {
  id: string;
  channel: string;
  status: string;
  target: string;
}

export interface CountRow {
  count: number;
}

export interface NotificationDetails {
  notification: NotificationRow;
  deliveries: DeliveryRow[];
}
