import { IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { EmailStatus, Priority, Category } from '@prisma/client';

export class UpdateEmailDto {
  @IsOptional()
  @IsEnum(EmailStatus)
  status?: EmailStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  aiSummary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  aiReply?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  aiConfidence?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  sentReply?: string;
}
