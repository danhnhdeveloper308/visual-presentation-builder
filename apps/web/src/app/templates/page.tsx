"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { TemplateDto } from "@repo/shared";
import { useTemplates } from "@/hooks/queries/useTemplates";
import { useCreateProject } from "@/hooks/mutations/useCreateProject";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SlidePreview } from "@/components/template/slide-preview";

const CATEGORY_LABELS: Record<string, string> = {
  business: "Kinh doanh",
  education: "Giáo dục",
  creative: "Sáng tạo",
  minimal: "Tối giản",
};

function TemplateCard({ template }: { template: TemplateDto }) {
  const router = useRouter();
  const createProject = useCreateProject();
  const [creating, setCreating] = useState(false);
  const firstSlide = template.content.slides[0];

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
      window.alert("Tạo project từ template thất bại — thử lại.");
    }
  }

  return (
    <Card className="group gap-0 overflow-hidden py-0 transition-shadow hover:shadow-lg">
      {firstSlide && <SlidePreview slide={firstSlide} className="border-b" />}
      <CardContent className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{template.title}</p>
          <p className="text-muted-foreground text-xs">
            {template.content.slides.length} slide
          </p>
        </div>
        <Button size="sm" onClick={handleUse} disabled={creating}>
          {creating && <Loader2 className="animate-spin" />}
          Dùng
        </Button>
      </CardContent>
    </Card>
  );
}

export default function TemplatesPage() {
  const templates = useTemplates();

  const byCategory = new Map<string, TemplateDto[]>();
  for (const t of templates.data ?? []) {
    const list = byCategory.get(t.category) ?? [];
    list.push(t);
    byCategory.set(t.category, list);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 p-6">
      <header className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" /> Dashboard
        </Link>
        <h1 className="text-xl font-semibold">Kho template</h1>
      </header>

      {templates.isPending ? (
        <div className="flex justify-center py-16">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      ) : (
        [...byCategory.entries()].map(([category, list]) => (
          <section key={category} className="flex flex-col gap-3">
            <h2 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
              {CATEGORY_LABELS[category] ?? category}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
