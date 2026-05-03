import { DataSource, Repository } from 'typeorm';
import { Template } from '@app/database/entities/template.entity';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { TemplateDefinition } from './template.types';

export class TemplateSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run() {
    const repo = this.dataSource.getRepository(Template);

    const dir = join(__dirname, 'definitions');
    const files = readdirSync(dir);

    for (const file of files) {
      if (!file.endsWith('.json')) {
        continue;
      }

      const raw = readFileSync(join(dir, file), 'utf-8');
      const def = JSON.parse(raw) as TemplateDefinition;

      await this.upsert(repo, def);

      console.log(`Seeded: ${def.eventType} (${def.channel}) v${def.version}`);
    }
  }

  private async upsert(repo: Repository<Template>, def: TemplateDefinition) {
    const existing = await repo.findOne({
      where: {
        eventType: def.eventType,
        channel: def.channel,
        version: def.version,
      },
    });

    if (existing) {
      existing.subject = def.subject;
      existing.body = def.body;
      existing.parametersSchema = def.parametersSchema;

      await repo.save(existing);
      return;
    }

    const entity = repo.create(def);
    await repo.save(entity);
  }
}
