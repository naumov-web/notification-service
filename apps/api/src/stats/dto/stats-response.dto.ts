import { ApiProperty } from '@nestjs/swagger';

export class StatsItemDto {
  @ApiProperty({
    example: '2026-05-01',
    description: 'Time bucket (day or hour)',
  })
  bucket: string;

  @ApiProperty({
    example: 120,
  })
  total: number;

  @ApiProperty({
    example: 100,
  })
  sent: number;

  @ApiProperty({
    example: 20,
  })
  failed: number;

  @ApiProperty({
    example: 0.8333,
    description: 'Success rate (sent / total)',
  })
  success_rate: number;
}

export class StatsResponseDto {
  @ApiProperty({
    type: [StatsItemDto],
  })
  items: StatsItemDto[];
}
