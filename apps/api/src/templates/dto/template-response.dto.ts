import { ApiProperty } from '@nestjs/swagger';
import { TemplateChannel } from '@app/database/entities/template.entity';

export class TemplateItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventType: string;

  @ApiProperty({
    enum: TemplateChannel,
  })
  channel: TemplateChannel;

  @ApiProperty()
  version: number;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  body: string;
}

export class TemplatesListResponseDto {
  @ApiProperty()
  count: number;

  @ApiProperty({
    type: [TemplateItemDto],
  })
  items: TemplateItemDto[];
}
