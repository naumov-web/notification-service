import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsIn } from 'class-validator';

export class StatsQueryDto {
    @ApiProperty({
        example: '2026-05-01 00:00:00',
    })
    @IsDateString()
    from: string;

    @ApiProperty({
        example: '2026-05-02 00:00:00',
    })
    @IsDateString()
    to: string;

    @ApiProperty({
        enum: ['day', 'hour'],
        default: 'day',
        required: false,
    })
    @IsOptional()
    @IsIn(['day', 'hour'])
    groupBy: 'day' | 'hour' = 'day';

    @ApiProperty({
        required: false,
    })
    @IsOptional()
    eventType?: string;

    @ApiProperty({
        required: false,
    })
    @IsOptional()
    channel?: string;
}