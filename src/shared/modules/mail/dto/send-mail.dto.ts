import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class SendMailDto {
  @IsEmail({}, { each: true, message: 'Email de destino inválido' })
  to: string | string[];

  @IsString({ message: 'Assunto inválido' })
  subject: string;

  @IsString({ message: 'Conteúdo HTML inválido' })
  @IsOptional()
  html?: string;

  @IsString({ message: 'Conteúdo de texto inválido' })
  @IsOptional()
  text?: string;

  @IsEmail({}, { message: 'Email de origem inválido' })
  @IsOptional()
  from?: string;

  @IsEmail({}, { message: 'Email de resposta inválido' })
  @IsOptional()
  replyTo?: string;

  @IsArray({ message: 'Anexos devem ser um array' })
  @IsOptional()
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}
