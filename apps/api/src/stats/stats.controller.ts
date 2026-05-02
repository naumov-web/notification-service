import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatsService } from "./stats.service";
import {StatsResponseDto} from "./dto/stats-response.dto";
import {StatsQueryDto} from "./dto/stats-query.dto";

@Controller('statistic')
@ApiBearerAuth()
export class StatsController {
    constructor(private readonly service: StatsService) {}

    @Get()
    @ApiOperation({ summary: 'Get analytics stats' })
    @ApiResponse({
        status: 200,
        description: 'Analytics stats',
        type: StatsResponseDto,
    })
    async getStats(@Query() query: StatsQueryDto) {
        return this.service.getStats(query);
    }
}