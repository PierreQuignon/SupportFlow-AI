import { forwardRef, Module } from '@nestjs/common';
import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { AIModule } from '../ai/ai.module';
import { GmailModule } from '../gmail/gmail.module';

@Module({
  imports: [AIModule, forwardRef(() => GmailModule)],
  controllers: [EmailsController],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
