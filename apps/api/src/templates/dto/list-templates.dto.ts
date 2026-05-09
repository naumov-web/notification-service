import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListTemplatesDto {
  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsIn(['email', 'sms', 'push'])
  channel?: 'email' | 'sms' | 'push';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
