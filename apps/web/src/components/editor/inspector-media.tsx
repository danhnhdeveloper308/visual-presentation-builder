"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import type { MediaElement } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEDIA_FILE_ACCEPT, MEDIA_KIND_LABEL, toEmbedUrl } from "@/lib/editor/media";
import { useUploadMedia } from "@/hooks/useUploadImage";
import { useEditorStore } from "@/stores/useEditorStore";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary size-4"
      />
      {label}
    </label>
  );
}

/** Inspector cho element media: nguồn (URL/upload), autoplay/loop/muted/controls, bo góc. */
export function MediaInspector({
  element,
  slideId,
}: {
  element: MediaElement;
  slideId: string;
}) {
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const updateElement = useEditorStore((s) => s.updateElement);
  const { uploading, uploadFile } = useUploadMedia();
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState(element.props.url);

  // Đổi sang element khác → đồng bộ lại draft URL
  useEffect(() => {
    setUrlDraft(element.props.url);
  }, [element.id, element.props.url]);

  function patch(props: Partial<MediaElement["props"]>, withHistory = true) {
    if (withHistory) pushHistory();
    updateElement(slideId, element.id, (el) =>
      el.type === "media" ? { ...el, props: { ...el.props, ...props } } : el,
    );
  }

  function commitUrl() {
    const raw = urlDraft.trim();
    // Embed: chuẩn hoá link YouTube/Vimeo dạng watch → dạng nhúng trước khi lưu
    const next = raw === "" ? "" : element.props.kind === "embed" ? toEmbedUrl(raw) : raw;
    setUrlDraft(next);
    if (next !== element.props.url) patch({ url: next, assetId: undefined });
  }

  async function handleFile(file: File) {
    const asset = await uploadFile(file);
    if (!asset) return;
    setUrlDraft(asset.url);
    patch({ url: asset.url, assetId: asset.id });
  }

  const p = element.props;
  const isEmbed = p.kind === "embed";

  return (
    <>
      <Field label={`Nguồn ${MEDIA_KIND_LABEL[p.kind]}`}>
        <Input
          placeholder={isEmbed ? "Dán link YouTube/Vimeo..." : "URL file media..."}
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onBlur={commitUrl}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
      </Field>
      {p.kind !== "embed" && (
        <>
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
            {p.url ? "Thay file" : "Tải file lên"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept={MEDIA_FILE_ACCEPT[p.kind]}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
        </>
      )}
      <div className="flex flex-col gap-2">
        <Toggle
          label="Hiện thanh điều khiển"
          checked={p.controls !== false}
          onChange={(v) => patch({ controls: v })}
        />
        <Toggle
          label="Tự phát khi trình chiếu"
          checked={!!p.autoplay}
          onChange={(v) => patch({ autoplay: v })}
        />
        <Toggle label="Lặp lại" checked={!!p.loop} onChange={(v) => patch({ loop: v })} />
        {p.kind === "video" && (
          <Toggle label="Tắt tiếng" checked={!!p.muted} onChange={(v) => patch({ muted: v })} />
        )}
      </div>
      {p.kind !== "audio" && (
        <Field label="Bo góc">
          <Input
            type="number"
            min={0}
            max={200}
            value={p.borderRadius ?? 0}
            onFocus={() => pushHistory()}
            onChange={(e) =>
              patch({ borderRadius: Math.max(0, Number(e.target.value) || 0) }, false)
            }
          />
        </Field>
      )}
      <p className="text-muted-foreground text-[11px] leading-relaxed">
        Media chỉ phát khi Trình chiếu hoặc ở trang xem; trong editor và file xuất
        (PDF/PPTX/PNG) hiển thị khung tĩnh.
      </p>
    </>
  );
}
