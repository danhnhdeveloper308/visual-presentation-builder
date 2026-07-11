"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { TEMPLATE_CATEGORIES } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_LABELS } from "@/components/template/category-meta";
import { useSaveAsTemplate } from "@/hooks/mutations/useSaveAsTemplate";

/** Dialog "Lưu làm template" — snapshot content project hiện tại thành 1 template riêng. */
export function SaveAsTemplateDialog({
  projectId,
  defaultTitle,
  onClose,
}: {
  projectId: string;
  defaultTitle: string;
  onClose: () => void;
}) {
  const saveAsTemplate = useSaveAsTemplate();
  const [title, setTitle] = useState(defaultTitle);
  const [category, setCategory] = useState<(typeof TEMPLATE_CATEGORIES)[number]>("business");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await saveAsTemplate.mutateAsync({ projectId, input: { title, category } });
    setDone(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div role="none" className="absolute inset-0 bg-black/40" onClick={onClose} />
      {done ? (
        <div className="bg-background relative flex w-full max-w-sm flex-col gap-4 rounded-lg border p-5 shadow-lg">
          <p className="text-sm">
            Đã lưu vào <span className="font-medium">Template của tôi</span>.
          </p>
          <div className="flex justify-end gap-2">
            <a href="/templates" target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline">
              Mở kho template →
            </a>
            <Button size="sm" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-background relative flex w-full max-w-sm flex-col gap-4 rounded-lg border p-5 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Lưu làm template</h2>
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
            <Button type="submit" size="sm" disabled={saveAsTemplate.isPending}>
              {saveAsTemplate.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
