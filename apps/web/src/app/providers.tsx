"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { setUnauthorizedHandler } from "@/lib/api";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";

/**
 * Meta quy ước cho mutation (đọc ở MutationCache):
 * - successMessage: toast thành công sau khi mutation xong;
 * - silentError: KHÔNG toast lỗi (form/dialog đã hiển thị lỗi inline riêng).
 */
type MutationMeta = { successMessage?: string; silentError?: boolean };

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Toast tập trung 1 chỗ cho MỌI mutation — hook chỉ khai báo meta
        mutationCache: new MutationCache({
          onSuccess: (_data, _vars, _ctx, mutation) => {
            const meta = mutation.meta as MutationMeta | undefined;
            if (meta?.successMessage) toast.success(meta.successMessage);
          },
          onError: (error, _vars, _ctx, mutation) => {
            const meta = mutation.meta as MutationMeta | undefined;
            if (meta?.silentError) return;
            toast.error(error instanceof Error && error.message ? error.message : "Có lỗi xảy ra — thử lại.");
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      // Session hết hạn hẳn (refresh cũng fail) → về trang login
      window.location.href = "/login";
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
      <Toaster richColors closeButton position="top-center" />
    </QueryClientProvider>
  );
}
