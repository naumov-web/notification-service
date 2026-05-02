import { Body, Controller, Post, Patch, Param } from '@nestjs/common';
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
    async retry(@Param('id') notificationId: string) {
        return this.service.retry(notificationId);
    }
}