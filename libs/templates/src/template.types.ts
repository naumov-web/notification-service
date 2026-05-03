import { TemplateChannel } from '@app/database/entities/template.entity';

export type TemplateDefinition = {
  eventType: string;
  channel: TemplateChannel;
  subject?: string;
  body: string;
  parametersSchema: Record<string, any>;
  version: number;
};
