import {
    IsUUID,
    IsOptional,
    IsString,
    IsObject,
    IsDateString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ChannelsDto {
    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    deviceToken?: string;
}

export class CreateNotificationDto {
    @IsUUID()
    userId: string;

    @ValidateNested()
    @Type(() => ChannelsDto)
    channels: ChannelsDto;

    @IsString()
    eventType: string;

    @IsObject()
    parameters: Record<string, any>;

    @IsOptional()
    @IsDateString()
    sendAt?: string;

    @IsOptional()
    maxRetriesCount?: number;
}