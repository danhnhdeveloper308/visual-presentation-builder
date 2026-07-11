import { z } from "zod";
import { LIMITS } from "../constants/limits";

/** Media (video/audio) có giới hạn dung lượng riêng, lớn hơn ảnh. */
export function isMediaMime(mimeType: string): boolean {
  return (LIMITS.MEDIA_ALLOWED_MIME as readonly string[]).includes(mimeType);
}

export function maxBytesForMime(mimeType: string): number {
  return isMediaMime(mimeType) ? LIMITS.MEDIA_MAX_BYTES : LIMITS.ASSET_MAX_BYTES;
}

export const presignAssetSchema = z
  .object({
    mimeType: z
      .string()
      .refine(
        (m) =>
          (LIMITS.ASSET_ALLOWED_MIME as readonly string[]).includes(m) || isMediaMime(m),
        { message: "Định dạng file không được hỗ trợ" },
      ),
    sizeBytes: z.number().int().positive(),
    /**
     * "thumbnail": key cố định `{userId}/thumbnails/{projectId}.png` — lưu lại là
     * ghi đè object cũ, không sinh rác trên R2. Mặc định "asset" (key random).
     */
    purpose: z.enum(["asset", "thumbnail"]).default("asset"),
    projectId: z.string().optional(),
  })
  .refine((input) => input.sizeBytes <= maxBytesForMime(input.mimeType), {
    message: "File vượt quá dung lượng cho phép",
    path: ["sizeBytes"],
  });

export const confirmAssetSchema = z.object({
  key: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export type PresignAssetInput = z.infer<typeof presignAssetSchema>;
export type ConfirmAssetInput = z.infer<typeof confirmAssetSchema>;

export type PresignAssetResult = {
  key: string;
  uploadUrl: string;
};

export type AssetDto = {
  id: string;
  key: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
};
