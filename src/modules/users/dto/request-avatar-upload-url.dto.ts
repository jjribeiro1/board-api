import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestAvatarUploadUrlDto {
  @ApiProperty({ example: 'avatar.png', description: 'Nome do arquivo a ser enviado (incluindo extensão)' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ example: 'image/png', description: 'Content-Type do arquivo (e.g. image/png, image/jpeg)' })
  @IsString()
  @IsNotEmpty()
  contentType: string;
}
