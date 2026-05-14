import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Headers,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth';
import { NotificationQueryService } from '@app/query/notification-query.service';
import { ListNotificationsResponseDto } from './dto/list-notifications-response.dto';

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
  create(
    @Body() dto: CreateNotificationDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.service.create(dto, idempotencyKey);
  }

  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get notifications list' })
  @ApiResponse({
    status: 200,
    description: 'List of notifications',
    type: ListNotificationsResponseDto,
  })
  async list(@Query() query: ListNotificationsDto) {
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
