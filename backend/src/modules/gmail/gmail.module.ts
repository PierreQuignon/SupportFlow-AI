import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [EmailsModule],
  providers: [GmailService],
  exports: [GmailService],
})
export class GmailModule {}
