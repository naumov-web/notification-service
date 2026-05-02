import { ApiProperty } from '@nestjs/swagger';

class NotificationListItemDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    eventType: string;

    @ApiProperty({
        enum: ['pending', 'processing', 'done', 'failed', 'cancelled'],
    })
    status: string;

    @ApiProperty()
    createdAt: string;
}

export class ListNotificationsResponseDto {
    @ApiProperty({
        example: 100,
    })
    count: number;

    @ApiProperty({
        type: [NotificationListItemDto],
    })
    items: NotificationListItemDto[];
}