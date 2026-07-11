"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Confirm dialog tùy biến thay cho window.confirm:
 *   const confirm = useConfirm();
 *   if (await confirm({ title: "Xóa project?", description: "...", destructive: true })) ...
 * Provider render đúng 1 dialog toàn app (gắn trong Providers).
 */

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  /** Hành động phá hủy — nút xác nhận màu đỏ + icon cảnh báo. */
  destructive?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm phải dùng bên trong <ConfirmDialogProvider>");
  return confirm;
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current?.(false); // dialog cũ đang mở (hiếm) → coi như hủy
      resolverRef.current = resolve;
      setOptions(opts);
    });
  }, []);

  function close(ok: boolean) {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setOptions(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal
          onKeyDown={(e) => {
            if (e.key === "Escape") close(false);
          }}
        >
          <div role="none" className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => close(false)} />
          <div className="bg-background animate-in fade-in zoom-in-95 relative flex w-full max-w-sm flex-col gap-4 rounded-2xl border p-6 shadow-2xl duration-150">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full",
                  options.destructive ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary",
                )}
              >
                {options.destructive ? <AlertTriangle className="size-5" /> : <HelpCircle className="size-5" />}
              </span>
              <div className="min-w-0">
                <h2 className="font-semibold">{options.title}</h2>
                {options.description && (
                  <p className="text-muted-foreground mt-1 text-sm">{options.description}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => close(false)}>
                {options.cancelText ?? "Hủy"}
              </Button>
              <Button
                size="sm"
                autoFocus
                onClick={() => close(true)}
                className={cn(options.destructive && "bg-red-600 text-white hover:bg-red-700")}
              >
                {options.confirmText ?? "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
