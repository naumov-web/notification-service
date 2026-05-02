import {
    IsUUID,
    IsOptional,
    IsString,
    IsObject,
    IsDateString,
    ValidateNested,
    IsInt,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ChannelsDto {
    @ApiPropertyOptional({
        description: 'Email',
        example: 'test@mail.com',
    })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional({
        description: 'Phone number',
        example: '+1234567890',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        description: 'Push device token',
        example: 'fcm_device_token_123',
    })
    @IsOptional()
    @IsString()
    deviceToken?: string;
}

export class CreateNotificationDto {
    @ApiProperty({
        description: 'ID user',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'Delivery channels',
        type: ChannelsDto,
    })
    @ValidateNested()
    @Type(() => ChannelsDto)
    channels: ChannelsDto;

    @ApiProperty({
        description: 'Notification event type',
        example: 'user.signup',
    })
    @IsString()
    eventType: string;

    @ApiProperty({
        description: 'Parameters for the template',
        example: {
            name: 'John Snow',
        },
    })
    @IsObject()
    parameters: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Delayed sending (ISO line)',
        example: '2026-05-10T10:00:00Z',
    })
    @IsOptional()
    @IsDateString()
    sendAt?: string;

    @ApiPropertyOptional({
        description: 'Max retries count',
        example: 3,
        minimum: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    maxRetriesCount?: number;
}