export interface EventHandlerStrategy {
  supports(eventType: string): boolean;
  handle(payload: any): Promise<void>;
}
