import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { GetEmailsDto } from './dto/get-emails.dto';
import { UpdateEmailDto } from './dto/update-email.dto';

@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Get()
  findAll(@Query() dto: GetEmailsDto) {
    return this.emailsService.findAll(dto);
  }

  @Get('pending-count')
  countPending() {
    return this.emailsService.countPending();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emailsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmailDto) {
    return this.emailsService.update(id, dto);
  }
}
