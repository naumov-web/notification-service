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

export interface NotificationDetails {
    notification: NotificationRow;

    deliveries: {
        id: string;
        channel: string;
        status: string;
        target: string;
    }[];

    stats: {
        total: number;
        sent: number;
        failed: number;
        pending: number;
    };
}