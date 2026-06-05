import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmAvatarUploadDto {
  @ApiProperty({
    example: 'avatars/550e8400-e29b-41d4-a716-446655440000.png',
    description: 'A key do arquivo no S3, retornada no endpoint de upload-url',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
