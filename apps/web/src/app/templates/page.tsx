"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
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

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  business: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  education: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  creative: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  minimal: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
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
    <Card className="group gap-0 overflow-hidden border-2 border-gray-200 transition-all hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
        {firstSlide && (
          <SlidePreview 
            slide={firstSlide} 
            className="border-0 group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <CardContent className="flex flex-col gap-3 px-5 py-4 bg-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{template.title}</p>
          <p className="text-gray-500 text-xs mt-1">{template.content.slides.length} slide</p>
        </div>
        <Button 
          size="sm" 
          onClick={handleUse} 
          disabled={creating}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 transition-all text-white font-medium"
        >
          {creating && <Loader2 className="animate-spin mr-2 size-4" />}
          {creating ? "Đang tạo..." : "Sử dụng template"}
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
    <main className="min-h-dvh bg-gradient-to-br from-white via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="mx-auto flex items-center justify-between px-6 lg:px-8 py-5 max-w-7xl">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-foreground flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="size-4" />
              Quay lại
            </Link>
            <span className="text-gray-300">|</span>
            <div>
              <h1 className="text-2xl font-bold">Kho Template</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {templates.data?.length || 0} template sẵn có
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        {templates.isPending ? (
          <div className="flex justify-center py-24">
            <Loader2 className="text-primary size-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-16">
            {[...byCategory.entries()].map(([category, list]) => {
              const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.business;
              return (
                <section key={category} className="flex flex-col gap-6">
                  {/* Category Header */}
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-lg border-2 ${colors.bg} ${colors.border}`}>
                      <h2 className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>
                        {CATEGORY_LABELS[category] ?? category}
                      </h2>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {list.length} {list.length === 1 ? "template" : "templates"}
                    </p>
                  </div>

                  {/* Template Grid */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {list.map((t) => (
                      <TemplateCard key={t.id} template={t} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
