import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-0 -left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-1/4 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="w-full max-w-sm relative z-10">
        {/* Suspense bắt buộc vì LoginForm dùng useSearchParams (?next=) */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
