import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Template } from '@app/database/entities/template.entity';

import { ListTemplatesDto } from './dto/list-templates.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async list(dto: ListTemplatesDto) {
    const query = this.templateRepository
      .createQueryBuilder('template')
      .orderBy('template.id', 'DESC');

    if (dto.limit) {
      query.take(dto.limit);
    }

    if (dto.offset) {
      query.skip(dto.offset);
    }

    if (dto.eventType) {
      query.andWhere('template."eventType" = :eventType', {
        eventType: dto.eventType,
      });
    }

    if (dto.channel) {
      query.andWhere('template.channel = :channel', {
        channel: dto.channel,
      });
    }

    if (dto.version) {
      query.andWhere('template.version = :version', {
        version: dto.version,
      });
    }

    const [items, count] = await query.getManyAndCount();

    return {
      count,
      items,
    };
  }
}
