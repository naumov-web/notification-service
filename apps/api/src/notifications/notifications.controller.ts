import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly service: NotificationsService) {}

    @Post()
    create(@Body() dto: CreateNotificationDto) {
        return this.service.create(dto);
    }
}