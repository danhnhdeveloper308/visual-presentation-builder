import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Env } from '../config/env.validation';

const PRESIGN_EXPIRES_SECONDS = 300;

@Injectable()
export class R2Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(config: ConfigService<Env, true>) {
    this.bucket = config.get('CLOUDFLARE_R2_BUCKET_NAME', { infer: true });
    this.publicBaseUrl = config.get('CLOUDFLARE_R2_PUBLIC_URL', { infer: true });
    this.client = new S3Client({
      region: 'auto',
      endpoint: config.get('CLOUDFLARE_R2_S3_URL', { infer: true }),
      credentials: {
        accessKeyId: config.get('CLOUDFLARE_R2_ACCESS_KEY_ID', { infer: true }),
        secretAccessKey: config.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY', { infer: true }),
      },
    });
  }

  /** Presigned PUT — client upload thẳng lên R2, file không đi qua API. */
  presignPut(key: string, mimeType: string, sizeBytes: number): Promise<string> {
    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: mimeType,
        ContentLength: sizeBytes,
      }),
      { expiresIn: PRESIGN_EXPIRES_SECONDS },
    );
  }

  /** Metadata object đã upload — null nếu chưa tồn tại. */
  async head(key: string): Promise<{ sizeBytes: number; mimeType: string } | null> {
    try {
      const res = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        sizeBytes: res.ContentLength ?? 0,
        mimeType: res.ContentType ?? 'application/octet-stream',
      };
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  publicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }
}
