import { IsArray, IsUUID } from 'class-validator';

export class BulkDeleteEmailsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
