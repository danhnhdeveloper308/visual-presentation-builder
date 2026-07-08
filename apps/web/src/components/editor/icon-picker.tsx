"use client";

import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ICON_CATEGORIES, SLIDE_ICONS } from "@/lib/editor/icon-map";

/** MIME type tự đặt cho drag icon từ picker thả vào canvas. */
export const ICON_DRAG_MIME = "application/x-lucide-icon";

const FAVORITES_KEY = "vpb:icon-favorites";
const RECENT_KEY = "vpb:icon-recent";
const RECENT_MAX = 24;

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeList(key: string, list: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // localStorage đầy/bị chặn — bỏ qua, chỉ mất favorite/recent
  }
}

/** Ghi nhận icon vừa dùng — gọi khi chèn icon vào slide. */
export function recordRecentIcon(name: string) {
  writeList(RECENT_KEY, [name, ...readList(RECENT_KEY).filter((n) => n !== name)].slice(0, RECENT_MAX));
}

type TabId = "all" | "favorites" | "recent" | (typeof ICON_CATEGORIES)[number]["id"];

export function IconPicker({
  onPick,
  className,
}: {
  /** Chèn icon (click / double-click / kết thúc kéo-thả thành công). */
  onPick: (name: string) => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabId>("all");
  const [favorites, setFavorites] = useState<string[]>(() => readList(FAVORITES_KEY));
  const recent = useMemo(() => readList(RECENT_KEY), []);

  const allNames = useMemo(() => Object.keys(SLIDE_ICONS), []);

  const names = useMemo(() => {
    let base: string[];
    if (tab === "all") base = allNames;
    else if (tab === "favorites") base = favorites;
    else if (tab === "recent") base = recent;
    else base = ICON_CATEGORIES.find((c) => c.id === tab)?.icons ?? [];
    const q = query.trim().toLowerCase();
    return q ? base.filter((n) => n.includes(q)) : base;
  }, [tab, query, allNames, favorites, recent]);

  function toggleFavorite(name: string) {
    const next = favorites.includes(name)
      ? favorites.filter((n) => n !== name)
      : [name, ...favorites];
    setFavorites(next);
    writeList(FAVORITES_KEY, next);
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: "Tất cả" },
    { id: "favorites", label: "★ Yêu thích" },
    { id: "recent", label: "Gần đây" },
    ...ICON_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
  ];

  return (
    <div className={cn("flex w-80 flex-col gap-2", className)}>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
        <Input
          autoFocus
          placeholder="Tìm icon..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-[11px] whitespace-nowrap",
              tab === t.id ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid max-h-64 grid-cols-8 gap-1 overflow-y-auto">
        {names.length === 0 && (
          <p className="text-muted-foreground col-span-8 py-6 text-center text-xs">
            {tab === "favorites"
              ? "Chưa có icon yêu thích — hover icon rồi bấm ngôi sao."
              : "Không tìm thấy icon."}
          </p>
        )}
        {names.map((name) => {
          const Icon = SLIDE_ICONS[name];
          if (!Icon) return null;
          const isFav = favorites.includes(name);
          return (
            <div key={name} className="group relative">
              <button
                type="button"
                title={`${name} — click chèn, kéo thả vào slide`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(ICON_DRAG_MIME, name);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => onPick(name)}
                onDoubleClick={() => onPick(name)}
                className="hover:bg-accent flex aspect-square w-full items-center justify-center rounded-md border"
              >
                <Icon className="size-4" />
              </button>
              <button
                type="button"
                title={isFav ? "Bỏ yêu thích" : "Yêu thích"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(name);
                }}
                className={cn(
                  "absolute -top-1 -right-1 hidden rounded-full bg-background p-0.5 shadow group-hover:block",
                  isFav && "block text-amber-500",
                )}
              >
                <Star className="size-3" fill={isFav ? "currentColor" : "none"} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
