import {Body, Controller, Get, Post, Patch, Delete, Query, Param, NotFoundException} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth';
import {NotificationQueryService} from "@app/query/notification-query.service";

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly service: NotificationsService,
        private readonly queryService: NotificationQueryService,
    ) {}

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

    @ApiBearerAuth()
    @Get()
    @ApiOperation({ summary: 'Get notifications list' })
    @ApiResponse({
        status: 200,
        description: 'List of notifications',
        schema: {
            example: {
                count: 100,
                items: [
                    {
                        id: 'uuid',
                        userId: 'uuid',
                        eventType: 'user.registered',
                        status: 'sent',
                        createdAt: '2026-05-01T10:00:00Z',
                    },
                ],
            },
        },
    })
    async list(
        @Query() query: ListNotificationsDto
    ) {
        return this.queryService.list({
            limit: Number(query.limit),
            offset: Number(query.offset),
            userId: query.userId,
            eventType: query.eventType,
            status: query.status,
            sortBy: query.sortBy,
            order: query.order,
        });
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

    @Get(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get notification details' })
    @ApiResponse({
        status: 200,
        description: 'Notification details',
    })
    @ApiResponse({
        status: 404,
        description: 'Notification not found',
    })
    async getOne(@Param('id') id: string) {
        return await this.queryService.getDetails(id);
    }
}