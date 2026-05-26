import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Email, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetEmailsDto } from './dto/get-emails.dto';
import { UpdateEmailDto } from './dto/update-email.dto';

export interface PaginatedEmails {
  data: Omit<Email, 'bodyHtml' | 'sentReply'>[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: GetEmailsDto): Promise<PaginatedEmails> {
    const { status, priority, category, page = 1, limit = 20 } = dto;

    const where: Prisma.EmailWhereInput = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(category && { category }),
    };

    const [data, total] = await Promise.all([
      this.prisma.email.findMany({
        where,
        orderBy: { receivedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        omit: { bodyHtml: true, sentReply: true },
      }),
      this.prisma.email.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const email = await this.prisma.email.findUnique({
      where: { id },
      include: { messages: { orderBy: { sentAt: 'asc' } } },
    });

    if (!email) throw new NotFoundException(`Email ${id} not found`);

    return email;
  }

  async create(data: Prisma.EmailCreateInput): Promise<Email> {
    return this.prisma.email.create({ data });
  }

  async update(id: string, dto: UpdateEmailDto): Promise<Email> {
    await this.findOne(id);

    return this.prisma.email.update({
      where: { id },
      data: dto,
    });
  }

  async countPending(): Promise<number> {
    return this.prisma.email.count({ where: { status: 'PENDING' } });
  }

  async existsByGmailId(gmailId: string): Promise<boolean> {
    const count = await this.prisma.email.count({ where: { gmailId } });
    return count > 0;
  }
}
