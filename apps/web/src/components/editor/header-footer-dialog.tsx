"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { HeaderFooterConfig } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditorStore } from "@/stores/useEditorStore";

function CheckRow({
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

/** Dialog cấu hình Header/Footer giống PowerPoint (Insert → Header & Footer). */
export function HeaderFooterDialog({ onClose }: { onClose: () => void }) {
  const setHeaderFooter = useEditorStore((s) => s.setHeaderFooter);
  const current = useEditorStore((s) => s.presentation?.headerFooter);

  const [header, setHeader] = useState(current?.header ?? "");
  const [footer, setFooter] = useState(current?.footer ?? "");
  const [showSlideNumber, setShowSlideNumber] = useState(current?.showSlideNumber ?? false);
  const [showDate, setShowDate] = useState(current?.showDate ?? false);
  const [dateText, setDateText] = useState(current?.dateText ?? "");
  const [hideOnFirstSlide, setHideOnFirstSlide] = useState(current?.hideOnFirstSlide ?? false);

  function apply(scope: "all" | "current") {
    const config: HeaderFooterConfig = {
      header: header.trim() || undefined,
      footer: footer.trim() || undefined,
      showSlideNumber: showSlideNumber || undefined,
      showDate: showDate || undefined,
      dateText: dateText.trim() || undefined,
      hideOnFirstSlide: hideOnFirstSlide || undefined,
    };
    setHeaderFooter(config, scope);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div role="none" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-background relative flex w-96 flex-col gap-4 rounded-lg border p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Header / Footer</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="hover:bg-accent rounded p-1">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-xs">Header (trên cùng, giữa)</Label>
          <Input value={header} onChange={(e) => setHeader(e.target.value)} maxLength={200} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-xs">Footer (dưới cùng, giữa)</Label>
          <Input value={footer} onChange={(e) => setFooter(e.target.value)} maxLength={200} />
        </div>

        <div className="flex flex-col gap-2">
          <CheckRow label="Hiện số trang (dưới phải)" checked={showSlideNumber} onChange={setShowSlideNumber} />
          <CheckRow label="Hiện ngày (dưới trái)" checked={showDate} onChange={setShowDate} />
          {showDate && (
            <Input
              value={dateText}
              onChange={(e) => setDateText(e.target.value)}
              maxLength={100}
              placeholder="Để trống = ngày hiện tại"
            />
          )}
          <CheckRow
            label="Không hiện trên slide đầu (title slide)"
            checked={hideOnFirstSlide}
            onChange={setHideOnFirstSlide}
          />
        </div>

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="outline" size="sm" onClick={() => apply("current")}>
            Chỉ slide này
          </Button>
          <Button size="sm" onClick={() => apply("all")}>
            Áp dụng tất cả
          </Button>
        </div>
      </div>
    </div>
  );
}
