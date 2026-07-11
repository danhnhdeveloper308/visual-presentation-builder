"use client";

import { useMemo, useState } from "react";
import { LayoutTemplate, Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { SlidePreview } from "@/components/template/slide-preview";
import { LAYOUT_GROUPS, LAYOUT_MAP, type LayoutDef } from "@/lib/editor/layouts";
import { useEditorStore } from "@/stores/useEditorStore";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useEditorUiStore } from "@/stores/useEditorUiStore";

/** MIME kéo layout từ panel thả vào canvas. */
export const LAYOUT_DRAG_MIME = "application/x-layout-id";

function LayoutCard({ def }: { def: LayoutDef }) {
  const applyLayoutToSlide = useEditorStore((s) => s.applyLayoutToSlide);
  const addSlideFromLayout = useEditorStore((s) => s.addSlideFromLayout);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);

  // build 1 lần để render thumbnail; khi áp thật sẽ build lại (id mới) ở handler
  const preview = useMemo(() => def.build(), [def]);

  return (
    <div className="group relative">
      <button
        type="button"
        title={`${def.label} — bấm để áp vào slide hiện tại, kéo thả để thêm slide`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(LAYOUT_DRAG_MIME, def.id);
          e.dataTransfer.effectAllowed = "copy";
        }}
        onClick={() => {
          if (activeSlideId) applyLayoutToSlide(activeSlideId, def.build());
        }}
        className="hover:border-primary block w-full overflow-hidden rounded-md border-2 border-transparent bg-white shadow-sm transition-colors"
      >
        <SlidePreview slide={preview} className="pointer-events-none" />
      </button>
      <button
        type="button"
        title="Thêm thành slide mới"
        onClick={() => addSlideFromLayout(def.build())}
        className="bg-background/90 hover:bg-background absolute top-1 right-1 hidden rounded p-1 shadow-sm group-hover:block"
      >
        <Plus className="size-3.5" />
      </button>
      <p className="text-muted-foreground mt-1 truncate text-center text-[11px]">{def.label}</p>
    </div>
  );
}

export function LayoutPanel() {
  const open = useEditorUiStore((s) => s.layoutPanelOpen);
  const setOpen = useEditorUiStore((s) => s.setLayoutPanelOpen);
  const applyLayoutToAll = useEditorStore((s) => s.applyLayoutToAll);
  const confirm = useConfirm();
  const [query, setQuery] = useState("");
  // mặc định 1 nhóm (không phải "all") để không render đồng thời 151 preview khi mở panel
  const [group, setGroup] = useState<string>(LAYOUT_GROUPS[0]?.id ?? "all");

  const q = query.trim().toLowerCase();
  const visibleGroups = useMemo(() => {
    return LAYOUT_GROUPS.map((g) => ({
      ...g,
      layouts: g.layouts.filter(
        (l) => (group === "all" || g.id === group) && (!q || l.label.toLowerCase().includes(q)),
      ),
    })).filter((g) => g.layouts.length > 0);
  }, [q, group]);

  if (!open) return null;

  const total = LAYOUT_MAP.size;

  return (
    <aside className="bg-muted/20 flex w-96 shrink-0 flex-col border-r">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <LayoutTemplate className="size-4" /> Bố cục ({total})
        </span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Đóng" className="hover:bg-accent rounded p-1">
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2 border-b p-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
          <Input placeholder="Tìm bố cục..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setGroup("all")}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px]",
              group === "all" ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent",
            )}
          >
            Tất cả
          </button>
          {LAYOUT_GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroup(g.id)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px]",
                group === g.id ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-smooth p-3">
        {visibleGroups.map((g) => (
          <div key={g.id} className="mb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-semibold">
                {g.label} · {g.layouts.length}
              </p>
              {group === g.id && (
                <button
                  type="button"
                  onClick={async () => {
                    const first = g.layouts[0];
                    if (!first) return;
                    const ok = await confirm({
                      title: `Áp bố cục "${first.label}" lên MỌI slide?`,
                      description: "Nội dung hiện tại của các slide sẽ bị thay (hoàn tác được bằng Ctrl+Z).",
                      confirmText: "Áp tất cả",
                    });
                    if (ok) applyLayoutToAll(first.build);
                  }}
                  className="text-primary text-[11px] hover:underline"
                >
                  Áp mọi slide
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {g.layouts.map((def) => (
                <LayoutCard key={def.id} def={def} />
              ))}
            </div>
          </div>
        ))}
        {visibleGroups.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-xs">Không tìm thấy bố cục.</p>
        )}
      </div>
    </aside>
  );
}
