import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Asset } from '@prisma/client';
import {
  maxBytesForMime,
  type AssetDto,
  type StorageUsage,
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
  // media (video/audio) — element media
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
};

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: R2Service,
  ) {}

  /** Dung lượng đã dùng (tổng sizeBytes asset) + quota của user — hiển thị và enforce. */
  async usage(ownerId: string): Promise<StorageUsage> {
    const [agg, user] = await Promise.all([
      this.prisma.asset.aggregate({ where: { ownerId }, _sum: { sizeBytes: true } }),
      this.prisma.user.findUnique({ where: { id: ownerId }, select: { storageQuotaBytes: true } }),
    ]);
    return {
      usedBytes: agg._sum.sizeBytes ?? 0,
      quotaBytes: user?.storageQuotaBytes ?? 0,
    };
  }

  private async assertQuota(ownerId: string, incomingBytes: number): Promise<void> {
    const { usedBytes, quotaBytes } = await this.usage(ownerId);
    if (usedBytes + incomingBytes > quotaBytes) {
      const mb = (n: number) => Math.round(n / 1024 / 1024);
      throw new BadRequestException(
        `Vượt dung lượng lưu trữ (đã dùng ${mb(usedBytes)}MB / ${mb(quotaBytes)}MB) — xóa bớt asset hoặc liên hệ admin tăng quota`,
      );
    }
  }

  async presign(ownerId: string, input: PresignAssetInput): Promise<PresignAssetResult> {
    const ext = MIME_EXT[input.mimeType];
    if (!ext) throw new BadRequestException('Định dạng file không được hỗ trợ');

    // Thumbnail ghi đè key cố định, dung lượng nhỏ — không tính quota để không chặn luồng Lưu
    if (input.purpose !== 'thumbnail') await this.assertQuota(ownerId, input.sizeBytes);

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
    if (head.sizeBytes > maxBytesForMime(head.mimeType)) {
      await this.r2.delete(input.key);
      throw new BadRequestException('File vượt quá giới hạn cho phép');
    }

    // Re-check quota theo size THẬT (client có thể khai gian ở presign);
    // ghi đè cùng key thì trừ đi size bản cũ trước khi cộng bản mới.
    // Thumbnail miễn quota (đồng bộ với presign) — không chặn luồng Lưu.
    if (!input.key.includes('/thumbnails/')) {
      const existing = await this.prisma.asset.findUnique({ where: { key: input.key } });
      const { usedBytes, quotaBytes } = await this.usage(ownerId);
      if (usedBytes - (existing?.sizeBytes ?? 0) + head.sizeBytes > quotaBytes) {
        await this.r2.delete(input.key);
        throw new BadRequestException('Vượt dung lượng lưu trữ — file đã bị hủy');
      }
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
