import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Đặt lại mật khẩu" };

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-linear-to-br from-white via-blue-50 to-indigo-100 p-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-blob bg-primary/20 absolute top-0 left-0 size-96 rounded-full blur-3xl" />
        <div className="animate-blob animation-delay-2000 bg-secondary/20 absolute top-1/4 right-0 size-80 rounded-full blur-3xl" />
        <div className="animate-blob animation-delay-4000 bg-accent/20 absolute bottom-0 left-1/3 size-96 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        {/* Suspense bắt buộc vì form dùng useSearchParams (?token=) */}
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
