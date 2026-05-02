import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly service: NotificationsService) {}

    @Post()
    @ApiOperation({ summary: 'Create notification' })
    @ApiResponse({
        status: 201,
        description: 'Notification created',
    })
    create(@Body() dto: CreateNotificationDto) {
        return this.service.create(dto);
    }
}