import { forwardRef, Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { EmailsModule } from '../emails/emails.module';
import { AIModule } from '../ai/ai.module';
import { SlackModule } from '../slack/slack.module';

@Module({
  imports: [forwardRef(() => EmailsModule), AIModule, SlackModule],
  providers: [GmailService],
  exports: [GmailService],
})
export class GmailModule {}
