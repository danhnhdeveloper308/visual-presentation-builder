"use client";

import { useCallback } from "react";
import { ApiError } from "@/lib/api";
import { useSaveProject } from "@/hooks/mutations/useSaveProject";
import { useEditorStore } from "@/stores/useEditorStore";

/**
 * Lưu thủ công (button + Ctrl+S). Đọc state mới nhất từ store tại thời điểm
 * gọi — không stale closure. Đang saving / đã saved / đang conflict thì bỏ qua.
 * `onSaved` chạy sau khi lưu thành công (dùng cho sinh thumbnail).
 */
export function useSavePresentation(projectId: string, onSaved?: () => void) {
  const mutation = useSaveProject(projectId);

  return useCallback(() => {
    const s = useEditorStore.getState();
    if (!s.presentation) return;
    if (s.saveState === "saving" || s.saveState === "saved" || s.saveState === "conflict") return;

    s.markSaving();
    mutation.mutate(
      { content: s.presentation, revision: s.revision },
      {
        onSuccess: (result) => {
          useEditorStore.getState().markSaved(result.revision);
          onSaved?.();
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            useEditorStore.getState().markConflict();
          } else {
            useEditorStore.getState().markError();
          }
        },
      },
    );
  }, [mutation, onSaved]);
}
