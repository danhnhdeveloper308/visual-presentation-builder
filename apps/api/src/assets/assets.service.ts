import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Asset } from '@prisma/client';
import {
  LIMITS,
  type AssetDto,
  type ConfirmAssetInput,
  type PresignAssetInput,
  type PresignAssetResult,
} from '@repo/shared';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from './r2.service';

const MIME_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
};

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2Service,
  ) {}

  async presign(ownerId: string, input: PresignAssetInput): Promise<PresignAssetResult> {
    const ext = MIME_EXT[input.mimeType];
    if (!ext) throw new BadRequestException('Định dạng file không được hỗ trợ');

    let key: string;
    if (input.purpose === 'thumbnail') {
      if (!input.projectId) throw new BadRequestException('Thiếu projectId cho thumbnail');
      if (input.mimeType !== 'image/png') {
        throw new BadRequestException('Thumbnail phải là PNG');
      }
      key = `${ownerId}/thumbnails/${input.projectId}.png`;
    } else {
      key = `${ownerId}/${randomUUID()}.${ext}`;
    }

    const uploadUrl = await this.r2.presignPut(key, input.mimeType, input.sizeBytes);
    return { key, uploadUrl };
  }

  async confirm(ownerId: string, input: ConfirmAssetInput): Promise<AssetDto> {
    // Key luôn có prefix userId — không confirm được file của người khác
    if (!input.key.startsWith(`${ownerId}/`)) {
      throw new ForbiddenException('Key không hợp lệ');
    }

    // Verify object thật sự tồn tại trên R2 + lấy size/mime thật (không tin client)
    const head = await this.r2.head(input.key);
    if (!head) throw new BadRequestException('File chưa được upload');
    if (head.sizeBytes > LIMITS.ASSET_MAX_BYTES) {
      await this.r2.delete(input.key);
      throw new BadRequestException('File vượt quá giới hạn cho phép');
    }

    // Upsert theo key — thumbnail ghi đè cùng key nhiều lần, cập nhật metadata mới
    const asset = await this.prisma.asset.upsert({
      where: { key: input.key },
      update: {
        mimeType: head.mimeType,
        sizeBytes: head.sizeBytes,
        width: input.width,
        height: input.height,
      },
      create: {
        ownerId,
        key: input.key,
        url: this.r2.publicUrl(input.key),
        mimeType: head.mimeType,
        sizeBytes: head.sizeBytes,
        width: input.width,
        height: input.height,
      },
    });
    return this.toDto(asset);
  }

  async list(ownerId: string): Promise<AssetDto[]> {
    const assets = await this.prisma.asset.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
    return assets.map((a) => this.toDto(a));
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const asset = await this.prisma.asset.findFirst({ where: { id, ownerId } });
    if (!asset) throw new NotFoundException('Không tìm thấy asset');

    await this.r2.delete(asset.key);
    await this.prisma.asset.delete({ where: { id: asset.id } });
  }

  private toDto(a: Asset): AssetDto {
    return {
      id: a.id,
      key: a.key,
      url: a.url,
      mimeType: a.mimeType,
      sizeBytes: a.sizeBytes,
      width: a.width,
      height: a.height,
      createdAt: a.createdAt.toISOString(),
    };
  }
}
