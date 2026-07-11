"use client";

import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { ArrowLeft, Copy, Loader2, Pencil, Search, Star, Trash2, X } from "lucide-react";
import type { TemplateDto } from "@repo/shared";
import { cn } from "@/lib/utils";
import { useTemplates } from "@/hooks/queries/useTemplates";
import { useCreateProject } from "@/hooks/mutations/useCreateProject";
import { useDuplicateTemplate } from "@/hooks/mutations/useDuplicateTemplate";
import { useDeleteTemplate } from "@/hooks/mutations/useDeleteTemplate";
import { useFavoriteTemplate } from "@/hooks/mutations/useFavoriteTemplate";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SkeletonCardGrid } from "@/components/ui/skeleton";
import { SlidePreview } from "@/components/template/slide-preview";
import { CATEGORY_COLORS, CATEGORY_LABELS, DEFAULT_CATEGORY_COLOR } from "@/components/template/category-meta";
import { TemplateRenameDialog } from "@/components/template/template-rename-dialog";

type Tab = "system" | "mine" | "favorite";

function TemplateCard({ template, onEdit }: { template: TemplateDto; onEdit: (t: TemplateDto) => void }) {
  const router = useRouter();
  const createProject = useCreateProject();
  const duplicate = useDuplicateTemplate();
  const remove = useDeleteTemplate();
  const confirm = useConfirm();
  const favorite = useFavoriteTemplate();
  const [creating, setCreating] = useState(false);
  const firstSlide = template.content.slides[0];
  const isMine = !template.isPublic;

  async function handleUse() {
    setCreating(true);
    try {
      const project = await createProject.mutateAsync({
        title: template.title,
        templateId: template.id,
      });
      router.push(`/editor/${project.id}`);
    } catch {
      setCreating(false);
      toast.error("Tạo project từ template thất bại — thử lại.");
    }
  }

  async function handleDelete() {
    const ok = await confirm({
      title: `Xóa template "${template.title}"?`,
      destructive: true,
      confirmText: "Xóa",
    });
    if (ok) remove.mutate(template.id);
  }

  return (
    <Card className="group gap-0 overflow-hidden border-2 border-gray-200 transition-all hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {firstSlide && (
          <SlidePreview
            slide={firstSlide}
            className="border-0 transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <button
          type="button"
          onClick={() => favorite.mutate({ id: template.id, favorite: !template.isFavorite })}
          disabled={favorite.isPending}
          aria-label={template.isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
          className="bg-background/90 hover:bg-background absolute top-2 right-2 rounded-full p-1.5 shadow-sm"
        >
          <Star className={cn("size-4", template.isFavorite && "fill-amber-500 text-amber-500")} />
        </button>
      </div>
      <CardContent className="flex flex-col gap-3 bg-white px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{template.title}</p>
          <p className="mt-1 text-xs text-gray-500">{template.content.slides.length} slide</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleUse}
            disabled={creating}
            className="from-primary to-secondary flex-1 bg-gradient-to-r font-medium text-white transition-all hover:shadow-lg hover:shadow-primary/30"
          >
            {creating && <Loader2 className="mr-2 size-4 animate-spin" />}
            {creating ? "Đang tạo..." : "Dùng"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={duplicate.isPending}
            onClick={() => duplicate.mutate(template.id)}
            aria-label="Nhân bản"
            title="Nhân bản vào Template của tôi"
          >
            {duplicate.isPending ? <Loader2 className="animate-spin" /> : <Copy />}
          </Button>
          {isMine && (
            <>
              <Button size="sm" variant="ghost" onClick={() => onEdit(template)} aria-label="Sửa">
                <Pencil />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-red-50"
                disabled={remove.isPending}
                onClick={handleDelete}
                aria-label="Xóa"
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

export default function TemplatesPage() {
  const templates = useTemplates();
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState<Tab>("system");
  const [editing, setEditing] = useState<TemplateDto | null>(null);

  const filteredTemplates = useMemo(() => {
    // Tab "Yêu thích" gộp CẢ template hệ thống lẫn của tôi — không giao với 2 tab kia
    let list = (templates.data ?? []).filter((t) =>
      tab === "favorite" ? t.isFavorite : tab === "system" ? t.isPublic : !t.isPublic,
    );
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || CATEGORY_LABELS[t.category]?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [templates.data, tab, searchQuery]);

  const byCategory = new Map<string, TemplateDto[]>();
  for (const t of filteredTemplates) {
    const list = byCategory.get(t.category) ?? [];
    list.push(t);
    byCategory.set(t.category, list);
  }

  const systemCount = (templates.data ?? []).filter((t) => t.isPublic).length;
  const mineCount = (templates.data ?? []).filter((t) => !t.isPublic).length;
  const favoriteCount = (templates.data ?? []).filter((t) => t.isFavorite).length;

  return (
    <main className="min-h-dvh bg-gradient-to-br from-white via-blue-50 to-indigo-100">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Quay lại
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-2xl font-bold">Kho Template</h1>
            </div>
            <p className="text-sm text-gray-600">
              {filteredTemplates.length} / {templates.data?.length ?? 0} template
            </p>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {(
              [
                { id: "system", label: `Hệ thống (${systemCount})` },
                { id: "mine", label: `Của tôi (${mineCount})` },
                { id: "favorite", label: `Yêu thích (${favoriteCount})` },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-4 py-1.5 text-sm",
                  tab === t.id
                    ? t.id === "favorite"
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-primary bg-primary text-primary-foreground"
                    : "border-gray-300 bg-white text-gray-600 hover:border-gray-400",
                )}
              >
                {t.id === "favorite" && (
                  <Star className={cn("size-3.5", tab === "favorite" && "fill-amber-500 text-amber-500")} />
                )}
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:border-primary h-11 border-2 border-gray-200 bg-white/50 pr-10 pl-10 placeholder:text-gray-400 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {templates.isPending ? (
          <SkeletonCardGrid count={10} />
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 py-20">
            <Search className="size-12 text-gray-400" />
            <div className="text-center">
              <p className="mb-1 font-medium text-gray-700">Không tìm thấy template</p>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? `Không có template nào phù hợp với "${searchQuery}"`
                  : tab === "mine"
                    ? 'Nhân bản 1 template hệ thống hoặc "Lưu làm template" từ editor để bắt đầu.'
                    : tab === "favorite"
                      ? "Chưa có template yêu thích — nhấn ⭐ trên template để đánh dấu."
                      : "Không có template nào"}
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-4">
                  Xóa tìm kiếm
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {[...byCategory.entries()].map(([category, list]) => {
              const colors = CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
              return (
                <section key={category} className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg border-2 px-4 py-2 ${colors.bg} ${colors.border}`}>
                      <h2 className={`text-sm font-bold tracking-wider uppercase ${colors.text}`}>
                        {CATEGORY_LABELS[category] ?? category}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600">
                      {list.length} {list.length === 1 ? "template" : "templates"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {list.map((t) => (
                      <TemplateCard key={t.id} template={t} onEdit={setEditing} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {editing && <TemplateRenameDialog template={editing} onClose={() => setEditing(null)} />}
    </main>
  );
}
