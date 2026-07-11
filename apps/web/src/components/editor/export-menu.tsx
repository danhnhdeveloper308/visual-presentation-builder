"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { Download, FileImage, FileText, Loader2, Presentation as PresentationIcon } from "lucide-react";
import { SLIDE_HEIGHT, SLIDE_WIDTH, type Slide } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { SlideStatic } from "@/components/template/slide-preview";
import { useEditorStore } from "@/stores/useEditorStore";

/**
 * Xuất presentation phía CLIENT (Phase 3) — không cần server:
 * - render ẩn từng slide 1280×720 → chụp PNG 2× bằng html-to-image (cùng pipeline thumbnail);
 * - PDF: jsPDF mỗi slide 1 trang landscape 1280×720;
 * - PPTX: pptxgenjs layout 16:9, mỗi slide 1 ảnh full-slide (fidelity 100%, không sửa được text);
 * - PNG: slide đang chọn. Slide `hidden` bị bỏ qua (nhất quán với trình chiếu).
 * Lưu ý: ảnh R2 cần CORS cho origin FE — bị chặn thì báo lỗi (cùng caveat với thumbnail).
 */
export function ExportMenu({ title }: { title: string }) {
  const presentation = useEditorStore((s) => s.presentation);
  const activeSlideId = useEditorStore((s) => s.activeSlideId);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [rendering, setRendering] = useState<{ slide: Slide; index: number } | null>(null);
  const renderRef = useRef<HTMLDivElement>(null);

  const fileBase = (title || "presentation").replace(/[\\/:*?"<>|]+/g, "_").slice(0, 80);
  const visibleSlides =
    presentation?.slides
      .map((slide, originalIndex) => ({ slide, originalIndex }))
      .filter((s) => !s.slide.hidden) ?? [];

  /**
   * Render ẩn 1 slide rồi chụp PNG dataURL (pixelRatio 2 → 2560×1440).
   * QUAN TRỌNG: node được chụp phải có position TĨNH (relative) — html-to-image clone
   * kèm computed style, chụp thẳng wrapper `fixed left:-99999` sẽ ra ảnh TRẮNG vì nội dung
   * clone bị đẩy ra ngoài khung; wrapper off-screen phải là CHA của node chụp.
   */
  async function captureSlide(slide: Slide, originalIndex: number): Promise<string> {
    flushSync(() => setRendering({ slide, index: originalIndex }));
    const node = renderRef.current;
    if (!node) throw new Error("Không tìm thấy khung render");
    // đợi font + ảnh trong slide tải xong (R2) — html-to-image chỉ serialize DOM hiện tại
    await document.fonts.ready;
    const images = Array.from(node.querySelectorAll("img"));
    await Promise.all(
      images.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((r) => {
              img.onload = img.onerror = () => r();
            }),
      ),
    );
    await new Promise(requestAnimationFrame);
    const { toPng } = await import("html-to-image");
    return toPng(node, {
      pixelRatio: 2,
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      backgroundColor: "#ffffff",
    });
  }

  async function runExport(kind: "pdf" | "pptx" | "png") {
    if (!presentation || progress) return;
    setOpen(false);
    try {
      if (kind === "png") {
        // PNG xuất đúng slide đang xem — kể cả slide ẩn (user đang nhìn nó)
        const originalIndex = Math.max(
          0,
          presentation.slides.findIndex((s) => s.id === activeSlideId),
        );
        const slide = presentation.slides[originalIndex];
        if (!slide) return;
        setProgress("PNG...");
        const dataUrl = await captureSlide(slide, originalIndex);
        downloadDataUrl(dataUrl, `${fileBase}-slide-${originalIndex + 1}.png`);
        return;
      }

      if (visibleSlides.length === 0) {
        toast.error("Mọi slide đều đang ẩn — không có gì để xuất.");
        return;
      }

      if (kind === "pdf") {
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [SLIDE_WIDTH, SLIDE_HEIGHT],
          hotfixes: ["px_scaling"],
        });
        for (let i = 0; i < visibleSlides.length; i++) {
          setProgress(`PDF ${i + 1}/${visibleSlides.length}...`);
          const { slide, originalIndex } = visibleSlides[i]!;
          const dataUrl = await captureSlide(slide, originalIndex);
          if (i > 0) pdf.addPage([SLIDE_WIDTH, SLIDE_HEIGHT], "landscape");
          pdf.addImage(dataUrl, "PNG", 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);
        }
        pdf.save(`${fileBase}.pdf`);
        return;
      }

      const PptxGenJS = (await import("pptxgenjs")).default;
      const pptx = new PptxGenJS();
      pptx.defineLayout({ name: "WIDE_16_9", width: 13.333, height: 7.5 });
      pptx.layout = "WIDE_16_9";
      for (let i = 0; i < visibleSlides.length; i++) {
        setProgress(`PPTX ${i + 1}/${visibleSlides.length}...`);
        const { slide, originalIndex } = visibleSlides[i]!;
        const dataUrl = await captureSlide(slide, originalIndex);
        pptx.addSlide().addImage({ data: dataUrl, x: 0, y: 0, w: 13.333, h: 7.5 });
      }
      await pptx.writeFile({ fileName: `${fileBase}.pptx` });
    } catch {
      toast.error(
        "Xuất thất bại. Nếu slide có ảnh tải lên, kiểm tra CORS của bucket R2 cho origin này.",
      );
    } finally {
      setRendering(null);
      setProgress(null);
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" disabled={!presentation || progress != null} onClick={() => setOpen((o) => !o)}>
        {progress ? <Loader2 className="animate-spin" /> : <Download />}
        {progress ?? "Xuất"}
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" role="none" onClick={() => setOpen(false)} />
          <div className="bg-popover absolute top-full left-0 z-50 mt-1 flex w-56 flex-col gap-0.5 rounded-md border p-1.5 shadow-md">
            <button
              type="button"
              onClick={() => void runExport("pdf")}
              className="hover:bg-accent flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
            >
              <FileText className="text-muted-foreground size-4" /> PDF (mọi slide)
            </button>
            <button
              type="button"
              onClick={() => void runExport("pptx")}
              className="hover:bg-accent flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
            >
              <PresentationIcon className="text-muted-foreground size-4" /> PowerPoint .pptx (mọi slide)
            </button>
            <button
              type="button"
              onClick={() => void runExport("png")}
              className="hover:bg-accent flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm"
            >
              <FileImage className="text-muted-foreground size-4" /> PNG (slide hiện tại)
            </button>
            <p className="text-muted-foreground px-2 pt-1 text-[11px]">
              Slide ẩn được bỏ qua. File xuất là ảnh tĩnh từng slide — hiệu ứng animation chỉ chạy
              khi Trình chiếu trong app, không kèm trong PDF/PPTX.
            </p>
          </div>
        </>
      )}
      {/* Khung render ẩn 1280×720 — wrapper NGOÀI mang fixed/off-screen, node chụp bên trong position relative */}
      {rendering && (
        <div
          aria-hidden
          style={{ position: "fixed", left: -99999, top: 0, zIndex: -1 }}
        >
          <div
            ref={renderRef}
            style={{
              position: "relative",
              width: SLIDE_WIDTH,
              height: SLIDE_HEIGHT,
              overflow: "hidden",
            }}
          >
            <SlideStatic
              slide={rendering.slide}
              scale={1}
              headerFooter={presentation?.headerFooter}
              slideIndex={rendering.index}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
