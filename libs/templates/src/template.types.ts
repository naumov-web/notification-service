export type TemplateDefinition = {
    eventType: string;
    channel: 'email' | 'sms' | 'push';
    subject?: string;
    body: string;
    parametersSchema: Record<string, any>;
    version: number;
};