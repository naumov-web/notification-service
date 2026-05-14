import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { TemplatesService } from './templates.service';
import { ListTemplatesDto } from './dto/list-templates.dto';
import { TemplatesListResponseDto } from './dto/template-response.dto';

@ApiTags('templates')
@ApiBearerAuth()
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get templates list' })
  @ApiResponse({
    status: 200,
    type: TemplatesListResponseDto,
  })
  list(@Query() dto: ListTemplatesDto) {
    return this.templatesService.list(dto);
  }
}
