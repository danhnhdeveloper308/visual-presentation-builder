import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      {/* Suspense bắt buộc vì LoginForm dùng useSearchParams (?next=) */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
