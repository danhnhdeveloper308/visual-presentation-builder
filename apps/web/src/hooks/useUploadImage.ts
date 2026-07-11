"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AssetDto, PresignAssetResult } from "@repo/shared";
import { api, ApiError } from "@/lib/api";

export type UploadedImage = { asset: AssetDto; width: number; height: number };

function loadImageSize(file: File): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không đọc được ảnh"));
    };
    img.src = url;
  });
}

/**
 * Upload ảnh lên R2: presign → PUT thẳng → confirm. Dùng chung cho toolbar (thêm ảnh mới)
 * và ảnh placeholder trong layout (tải ảnh vào khung có sẵn).
 */
export function useUploadImage() {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  async function uploadFile(file: File): Promise<UploadedImage | null> {
    setUploading(true);
    try {
      const { width, height } = await loadImageSize(file);
      const presign = await api.post<PresignAssetResult>("/assets/presign", {
        mimeType: file.type,
        sizeBytes: file.size,
      });
      // PUT thẳng lên R2 — fetch thô vì đây là URL ngoài, không qua wrapper API
      const put = await fetch(presign.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!put.ok) throw new Error("Upload thất bại");
      const asset = await api.post<AssetDto>("/assets/confirm", {
        key: presign.key,
        width,
        height,
      });
      void queryClient.invalidateQueries({ queryKey: ["storage-usage"] });
      return { asset, width, height };
    } catch (err) {
      // Lỗi có message từ BE (vd vượt quota) hiển thị nguyên văn
      toast.error(err instanceof ApiError ? err.message : "Upload ảnh thất bại — thử lại.");
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { uploading, uploadFile };
}

/**
 * Upload file media (video/audio) lên R2 — cùng pipeline presign → PUT → confirm
 * nhưng không cần đọc kích thước ảnh. Dùng cho element media (Inspector).
 */
export function useUploadMedia() {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  async function uploadFile(file: File): Promise<AssetDto | null> {
    setUploading(true);
    try {
      const presign = await api.post<PresignAssetResult>("/assets/presign", {
        mimeType: file.type,
        sizeBytes: file.size,
      });
      const put = await fetch(presign.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!put.ok) throw new Error("Upload thất bại");
      const asset = await api.post<AssetDto>("/assets/confirm", { key: presign.key });
      void queryClient.invalidateQueries({ queryKey: ["storage-usage"] });
      return asset;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload media thất bại — thử lại.");
      return null;
    } finally {
      setUploading(false);
    }
  }

  return { uploading, uploadFile };
}
