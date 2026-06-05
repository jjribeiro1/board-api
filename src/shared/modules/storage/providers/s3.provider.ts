import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider } from '../interfaces/storage-provider.interface';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');

    const endpoint = this.configService.getOrThrow<string>('AWS_ENDPOINT_URL');
    const region = this.configService.getOrThrow<string>('AWS_DEFAULT_REGION');
    const accessKeyId = this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY');

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      throw new InternalServerErrorException(`Falha ao deletar arquivo do S3: ${(error as Error).message}`);
    }
  }

  async generatePreSignedUrl(
    filename: string,
    contentType?: string,
    path = '',
  ): Promise<{ uploadUrl: string; key: string }> {
    try {
      const extension = extname(filename);
      const uniqueFilename = `${uuidv4()}${extension}`;
      const key = path ? `${path.replace(/^\/|\/$/g, '')}/${uniqueFilename}` : uniqueFilename;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ...(contentType && { ContentType: contentType }),
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

      return { uploadUrl, key };
    } catch (error) {
      throw new InternalServerErrorException(`Falha ao gerar URL pré-assinada do S3: ${(error as Error).message}`);
    }
  }

  async generatePreSignedGetUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      throw new InternalServerErrorException(
        `Falha ao gerar URL pré-assinada de leitura do S3: ${(error as Error).message}`,
      );
    }
  }
}
