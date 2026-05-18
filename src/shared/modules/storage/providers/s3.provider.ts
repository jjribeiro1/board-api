import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider, FileUpload } from '../interfaces/storage-provider.interface';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('S3_BUCKET_NAME');

    const endpoint = this.configService.get<string>('AWS_ENDPOINT_URL');
    const region = this.configService.get<string>('AWS_DEFAULT_REGION');
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

  async uploadFile(file: FileUpload, path = ''): Promise<string> {
    try {
      const extension = extname(file.originalname);
      const filename = `${uuidv4()}${extension}`;
      const key = path ? `${path.replace(/^\/|\/$/g, '')}/${filename}` : filename;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const endpoint = await this.s3Client.config.endpoint?.();

      const baseUrl = endpoint
        ? `${endpoint.protocol}//${endpoint.hostname}${endpoint.port ? `:${endpoint.port}` : ''}`
        : `https://${this.bucketName}.s3.amazonaws.com`;

      return `${baseUrl}/${this.bucketName}/${key}`;
    } catch (error) {
      throw new InternalServerErrorException(`Falha ao fazer upload para o S3: ${(error as Error).message}`);
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extrair o "key" da URL do arquivo para que seja removido corretamente
      const urlParts = fileUrl.split('/');

      // Se tiver usando CNAME pro Bucket pode não ter o bucket no path
      let key = urlParts.slice(urlParts.indexOf(this.bucketName) + 1).join('/');

      // Fallback simples se a busca falhar
      if (!key) {
        key = urlParts[urlParts.length - 1];
      }

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
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
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

      const endpoint = await this.s3Client.config.endpoint?.();

      const baseUrl = endpoint
        ? `${endpoint.protocol}//${endpoint.hostname}${endpoint.port ? `:${endpoint.port}` : ''}`
        : `https://${this.bucketName}.s3.amazonaws.com`;

      const publicSiteUrl = `${baseUrl}/${this.bucketName}/${key}`;

      return { uploadUrl, key, publicUrl: publicSiteUrl };
    } catch (error) {
      throw new InternalServerErrorException(`Falha ao gerar URL pré-assinada do S3: ${(error as Error).message}`);
    }
  }
}
