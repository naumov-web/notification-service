import { Body, Controller, Post, Patch, Delete, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly service: NotificationsService) {}

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create notification' })
    @ApiResponse({
        status: 201,
        description: 'Notification created',
    })
    create(@Body() dto: CreateNotificationDto) {
        return this.service.create(dto);
    }


    @Patch(':id/retry')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Retry failed deliveries for notification' })
    @ApiResponse({
        status: 200,
        description: 'Retry events created',
        schema: {
            example: {
                retried: 2,
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'No failed deliveries for this notification',
        schema: {
            example: {
                statusCode: 404,
                message: 'No failed deliveries for this notification',
            },
        },
    })
    async retry(@Param('id') notificationId: string) {
        return this.service.retry(notificationId);
    }

    @Delete(':id/cancel')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cancel notification delivery' })
    @ApiResponse({
        status: 200,
        description: 'Notification cancelled',
        schema: {
            example: {
                cancelled: true,
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Notification not found',
    })
    async cancel(@Param('id') notificationId: string) {
        return this.service.cancel(notificationId);
    }
}