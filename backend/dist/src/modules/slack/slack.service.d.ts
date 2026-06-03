import { ConfigService } from '@nestjs/config';
interface SlackHighPriorityPayload {
    id: string;
    fromName: string;
    fromEmail: string;
    subject: string;
    category: string;
    aiSummary: string;
}
export declare class SlackService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    notifyHighPriority(email: SlackHighPriorityPayload): Promise<void>;
}
export {};
