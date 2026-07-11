"use client";

import { toast } from "sonner";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Download,
  Loader2,
  Palette,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { themeConfigSchema, type ThemeConfig, type ThemeDto } from "@repo/shared";
import { useThemes } from "@/hooks/queries/useThemes";
import { useCloneTheme } from "@/hooks/mutations/useCloneTheme";
import { useDeleteTheme } from "@/hooks/mutations/useDeleteTheme";
import { useCreateTheme } from "@/hooks/mutations/useCreateTheme";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonCardGrid } from "@/components/ui/skeleton";
import { ThemeEditorDialog } from "@/components/theme/theme-editor-dialog";

type Tab = "system" | "mine";

function swatchColors(config: ThemeConfig): string[] {
  const bg = config.colors.background.includes("gradient(") ? "#94a3b8" : config.colors.background;
  return [bg, config.colors.heading, config.colors.body, config.colors.accent];
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ThemeCard({
  theme,
  onEdit,
}: {
  theme: ThemeDto;
  onEdit: (theme: ThemeDto) => void;
}) {
  const clone = useCloneTheme();
  const remove = useDeleteTheme();
  const confirm = useConfirm();
  const isMine = !theme.isSystemTheme;

  async function handleDelete() {
    const ok = await confirm({
      title: `Xóa theme "${theme.name}"?`,
      description: "Không ảnh hưởng slide đã áp theme này.",
      destructive: true,
      confirmText: "Xóa",
    });
    if (ok) remove.mutate(theme.id);
  }

  return (
    <Card className="gap-0 overflow-hidden border-2 border-gray-200">
      <div
        className="flex aspect-video items-center justify-center gap-2 p-4"
        style={{
          background: theme.config.colors.background.includes("gradient(")
            ? theme.config.colors.background
            : theme.config.colors.background,
        }}
      >
        <span
          className="rounded px-2 py-1 text-lg font-bold"
          style={{ color: theme.config.colors.heading, fontFamily: theme.config.fontHeading }}
        >
          Aa
        </span>
        <span className="text-xs" style={{ color: theme.config.colors.body, fontFamily: theme.config.fontBody }}>
          Nội dung mẫu
        </span>
      </div>
      <CardContent className="flex flex-col gap-3 bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{theme.name}</p>
          <span className="flex shrink-0 gap-1">
            {swatchColors(theme.config).map((c, i) => (
              <span key={i} className="size-3.5 rounded-full border" style={{ backgroundColor: c }} />
            ))}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={clone.isPending}
            onClick={() => clone.mutate(theme.id)}
          >
            {clone.isPending ? <Loader2 className="animate-spin" /> : <Copy />}
            Nhân bản
          </Button>
          <Button size="sm" variant="ghost" onClick={() => downloadJson(`${theme.name}.json`, { name: theme.name, config: theme.config })} aria-label="Xuất JSON">
            <Download />
          </Button>
          {isMine && (
            <>
              <Button size="sm" variant="ghost" onClick={() => onEdit(theme)} aria-label="Sửa theme">
                <Pencil />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-red-50"
                disabled={remove.isPending}
                onClick={handleDelete}
                aria-label="Xóa theme"
              >
                {remove.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ThemesPage() {
  const themes = useThemes();
  const createTheme = useCreateTheme();
  const [tab, setTab] = useState<Tab>("system");
  const [editing, setEditing] = useState<ThemeDto | "new" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = (themes.data ?? []).filter((t) =>
    tab === "system" ? t.isSystemTheme : !t.isSystemTheme,
  );

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const rawConfig =
        typeof parsed === "object" && parsed !== null && "config" in parsed
          ? (parsed as { config: unknown }).config
          : parsed;
      const result = themeConfigSchema.safeParse(rawConfig);
      if (!result.success) {
        toast.error("File JSON không đúng định dạng theme.");
        return;
      }
      const name =
        typeof parsed === "object" && parsed !== null && "name" in parsed
          ? String((parsed as { name: unknown }).name)
          : file.name.replace(/\.json$/i, "");
      await createTheme.mutateAsync({ name: name || "Theme nhập", config: result.data });
      setTab("mine");
    } catch {
      toast.error("Không đọc được file JSON — kiểm tra lại định dạng.");
    }
  }

  return (
    <main className="min-h-dvh bg-linear-to-br from-white via-blue-50 to-indigo-100">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="size-4" /> Quay lại
            </Link>
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold">
                <Palette className="size-5" /> Theme
              </h1>
              <p className="text-xs text-gray-600">Chủ đề màu sắc & font cho presentation.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload /> Nhập JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImportFile(file);
                e.target.value = "";
              }}
            />
            <Button size="sm" onClick={() => setEditing("new")}>
              <Plus /> Tạo theme
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-6 flex gap-2">
          {(
            [
              { id: "system", label: "Theme hệ thống" },
              { id: "mine", label: "Theme của tôi" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                "rounded-full border px-4 py-1.5 text-sm " +
                (tab === t.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-gray-300 bg-white text-gray-600 hover:border-gray-400")
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {themes.isPending ? (
          <SkeletonCardGrid count={8} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 py-20">
            <div className="rounded-full bg-gray-100 p-3">
              <Palette className="size-8 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="mb-1 font-medium text-gray-700">Chưa có theme nào ở đây</p>
              <p className="mb-4 text-sm text-gray-500">
                Nhân bản 1 theme hệ thống hoặc tạo theme mới để bắt đầu.
              </p>
              <Button size="sm" onClick={() => setEditing("new")}>
                <Plus /> Tạo theme
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filtered.map((t) => (
              <ThemeCard key={t.id} theme={t} onEdit={setEditing} />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <ThemeEditorDialog
          initial={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}
