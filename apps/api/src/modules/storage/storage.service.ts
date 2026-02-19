import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private minioClient!: Minio.Client;
  private readonly logger = new Logger(StorageService.name);
  private bucketName!: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const endPoint = this.configService.getOrThrow<string>('MINIO_SERVER_URL').replace(/^https?:\/\//, '');
    const accessKey = this.configService.getOrThrow<string>('MINIO_ROOT_USER');
    const secretKey = this.configService.getOrThrow<string>('MINIO_ROOT_PASSWORD');
    this.bucketName = this.configService.getOrThrow<string>('MINIO_BUCKET_NAME');
    
    // Determine if using SSL based on original URL or another config
    const useSSL = this.configService.getOrThrow<string>('MINIO_SERVER_URL').startsWith('https');

    this.minioClient = new Minio.Client({
      endPoint,
      port: useSSL ? 443 : 9000, 
      useSSL,
      accessKey,
      secretKey,
    });

    await this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1'); // Region is required but often ignored for self-hosted
        this.logger.log(`Bucket ${this.bucketName} created.`);
        
        // Make bucket public for reading
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      }
    } catch (error) {
      this.logger.error(`Error configuring bucket ${this.bucketName}:`, error);
    }
  }

  async uploadFile(file: Buffer, filename: string, mimeType: string): Promise<string> {
    try {
      await this.minioClient.putObject(this.bucketName, filename, file, file.length, {
        'Content-Type': mimeType,
      });

      const serverUrl = this.configService.getOrThrow<string>('MINIO_SERVER_URL');
      // If MinIO is served on a subpath or needs specific formatting, adjust here.
      // Assuming standard path-style access like https://minio.example.com/bucket/file.png
      return `${serverUrl}/${this.bucketName}/${filename}`;
    } catch (error) {
      this.logger.error(`Failed to upload file ${filename}:`, error);
      throw new Error('File upload failed');
    }
  }
}
