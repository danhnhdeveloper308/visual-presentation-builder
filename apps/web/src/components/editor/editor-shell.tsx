"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import type { AssetDto, PresignAssetResult } from "@repo/shared";
import { api } from "@/lib/api";
import { useProject } from "@/hooks/queries/useProject";
import { useSavePresentation } from "@/hooks/useSavePresentation";
import { useUpdateProjectMeta } from "@/hooks/mutations/useUpdateProjectMeta";
import { Button } from "@/components/ui/button";
import { SlidePreview } from "@/components/template/slide-preview";
import { useEditorStore } from "@/stores/useEditorStore";
import { useEditorUiStore } from "@/stores/useEditorUiStore";
import { Toolbar } from "./toolbar";
import { SlidePanel } from "./slide-panel";
import { LayoutPanel } from "./layout-panel";
import { AnimationPanel } from "./animation-panel";
import { Canvas } from "./canvas";
import { Inspector } from "./inspector";
import { Presenter } from "./presenter";

export function EditorShell({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const project = useProject(projectId);
  const updateMeta = useUpdateProjectMeta(projectId);
  const thumbRef = useRef<HTMLDivElement>(null);

  // Thumbnail: chụp slide đầu (bản render ẩn 480px) → PUT lên R2 key cố định
  // theo project → PATCH thumbnailUrl kèm ?v= bust cache. Tính năng phụ — fail im lặng.
  const generateThumbnail = useCallback(async () => {
    const node = thumbRef.current;
    if (!node) return;
    try {
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(node, { pixelRatio: 1 });
      if (!blob) return;
      const presign = await api.post<PresignAssetResult>("/assets/presign", {
        mimeType: "image/png",
        sizeBytes: blob.size,
        purpose: "thumbnail",
        projectId,
      });
      const put = await fetch(presign.uploadUrl, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": "image/png" },
      });
      if (!put.ok) return;
      const asset = await api.post<AssetDto>("/assets/confirm", {
        key: presign.key,
        width: 480,
        height: 270,
      });
      updateMeta.mutate({ thumbnailUrl: `${asset.url}?v=${Date.now()}` });
    } catch {
      // thumbnail lỗi không được chặn luồng lưu
    }
  }, [projectId, updateMeta]);

  const save = useSavePresentation(projectId, () => void generateThumbnail());
  const saveRef = useRef(save);
  saveRef.current = save;

  const presentation = useEditorStore((s) => s.presentation);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const saveState = useEditorStore((s) => s.saveState);
  const loadedProjectId = useEditorStore((s) => s.projectId);
  const presenting = useEditorUiStore((s) => s.presenting);
  const setPresenting = useEditorUiStore((s) => s.setPresenting);

  // Collaborator role viewer không dùng editor — chuyển sang trang xem read-only
  const router = useRouter();
  useEffect(() => {
    if (project.data?.myRole === "viewer") router.replace(`/view/${projectId}`);
  }, [project.data?.myRole, projectId, router]);

  // Nạp working copy vào store 1 lần khi mở editor (staleTime Infinity — không bị refetch đè)
  useEffect(() => {
    if (project.data && project.data.myRole !== "viewer" && loadedProjectId !== projectId) {
      useEditorStore
        .getState()
        .load(projectId, structuredClone(project.data.content), project.data.revision);
    }
  }, [project.data, projectId, loadedProjectId]);

  useEffect(
    () => () => {
      useEditorStore.getState().reset();
      useEditorUiStore.getState().setPresenting(false); // rời editor giữa lúc trình chiếu
    },
    [],
  );

  // Phím tắt: Ctrl+S lưu, Delete xóa, Ctrl+Z/Shift+Z/Y undo-redo,
  // Ctrl+D nhân bản, mũi tên nudge (Shift = 10px), Escape bỏ chọn
  useEffect(() => {
    let lastNudgeAt = 0;

    function onKeyDown(e: KeyboardEvent) {
      // Đang trình chiếu: Presenter tự xử lý phím — không để editor nuốt Delete/mũi tên...
      if (useEditorUiStore.getState().presenting) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
        return;
      }
      const target = e.target as HTMLElement;
      if (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA")
        return;
      const s = useEditorStore.getState();
      const hasSelection = s.selectedElementIds.length > 0;

      if ((e.key === "Delete" || e.key === "Backspace") && hasSelection && s.activeSlideId) {
        e.preventDefault();
        s.removeSelected(s.activeSlideId);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g") {
        // Ctrl+G nhóm, Ctrl+Shift+G bỏ nhóm
        e.preventDefault();
        if (e.shiftKey) s.ungroupSelected();
        else s.groupSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        s.redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        if (!hasSelection || !s.activeSlideId) return;
        e.preventDefault();
        s.duplicateSelected(s.activeSlideId);
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "c" || e.key.toLowerCase() === "x")) {
        // Copy/Cut element vào clipboard nội bộ — dán được sang slide khác
        if (!hasSelection || !s.activeSlideId) return; // không chặn copy text hệ thống
        const slide = s.presentation?.slides.find((sl) => sl.id === s.activeSlideId);
        const selected = slide?.elements.filter((el) => s.selectedElementIds.includes(el.id)) ?? [];
        if (selected.length === 0) return;
        e.preventDefault();
        useEditorUiStore.getState().setElementClipboard(structuredClone(selected));
        if (e.key.toLowerCase() === "x") s.removeSelected(s.activeSlideId);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        const clipboard = useEditorUiStore.getState().elementClipboard;
        if (!clipboard || clipboard.length === 0 || !s.activeSlideId) return;
        e.preventDefault();
        s.pasteElements(s.activeSlideId, clipboard);
      } else if (e.key === "Escape") {
        s.selectElement(null);
      } else if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        hasSelection &&
        s.activeSlideId
      ) {
        e.preventDefault();
        // 1 snapshot undo cho cả chuỗi nhấn liên tiếp (cách nhau < 800ms)
        const now = Date.now();
        if (now - lastNudgeAt > 800) s.pushHistory();
        lastNudgeAt = now;
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        s.moveElements(s.activeSlideId, s.selectedElementIds, dx, dy);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Cảnh báo đóng tab khi còn thay đổi chưa lưu
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      const s = useEditorStore.getState().saveState;
      if (s === "dirty" || s === "saving") e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  async function reloadFromServer() {
    useEditorStore.getState().reset();
    await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
  }

  if (project.isPending || !presentation) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (project.isError) {
    return (
      <div className="text-muted-foreground flex min-h-dvh items-center justify-center text-sm">
        Không tải được project.
      </div>
    );
  }

  const activeSlide = presentation.slides.find((s) => s.id === activeSlideId);

  return (
    <div className="flex h-dvh flex-col">
      <Toolbar
        projectId={projectId}
        title={project.data?.title ?? ""}
        role={project.data?.myRole}
        onSave={save}
      />

      {saveState === "conflict" && (
        <div className="bg-destructive/10 text-destructive flex items-center justify-center gap-3 border-b px-4 py-2 text-sm">
          Project đã được cập nhật ở nơi khác — thay đổi hiện tại không lưu được.
          <Button size="sm" variant="outline" onClick={reloadFromServer}>
            <RefreshCw /> Tải lại phiên bản mới nhất
          </Button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <SlidePanel presentation={presentation} />
        <LayoutPanel />
        {activeSlide && <Canvas slide={activeSlide} />}
        <AnimationPanel />
        <Inspector />
      </div>

      {presenting && (
        <Presenter
          presentation={presentation}
          startSlideId={activeSlideId}
          onExit={() => setPresenting(false)}
        />
      )}

      {/* Bản render ẩn của slide đầu — nguồn chụp thumbnail khi lưu.
          Node chụp (thumbRef) phải position TĨNH — html-to-image clone kèm computed style,
          chụp thẳng wrapper fixed off-screen sẽ ra ảnh trắng. */}
      {presentation.slides[0] && (
        <div aria-hidden className="pointer-events-none fixed top-0 left-[-9999px] w-120">
          <div ref={thumbRef} className="relative">
            <SlidePreview
              slide={presentation.slides[0]}
              headerFooter={presentation.headerFooter}
              slideIndex={0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
