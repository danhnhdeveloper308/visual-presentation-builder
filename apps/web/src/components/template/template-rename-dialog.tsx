"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { TEMPLATE_CATEGORIES, type TemplateDto } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateTemplate } from "@/hooks/mutations/useUpdateTemplate";
import { CATEGORY_LABELS } from "./category-meta";

/** Dialog đổi tên / đổi category cho 1 template riêng (My Templates). */
export function TemplateRenameDialog({
  template,
  onClose,
}: {
  template: TemplateDto;
  onClose: () => void;
}) {
  const updateTemplate = useUpdateTemplate();
  const [title, setTitle] = useState(template.title);
  const [category, setCategory] = useState(
    template.category as (typeof TEMPLATE_CATEGORIES)[number],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateTemplate.mutateAsync({ id: template.id, input: { title, category } });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div role="none" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="bg-background relative flex w-full max-w-sm flex-col gap-4 rounded-lg border p-5 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Sửa template</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="hover:bg-accent rounded p-1">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-xs">Tên template</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-xs">Danh mục</Label>
          <select
            className="border-input bg-transparent dark:bg-input/30 h-9 rounded-md border px-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as (typeof TEMPLATE_CATEGORIES)[number])}
          >
            {TEMPLATE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c] ?? c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 border-t pt-3">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" size="sm" disabled={updateTemplate.isPending}>
            {updateTemplate.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
