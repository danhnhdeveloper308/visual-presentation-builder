import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-100">
      {/* Vibrant animated background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Suspense bắt buộc vì LoginForm dùng useSearchParams (?next=) */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
