import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Đăng ký" };

export default function RegisterPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <RegisterForm />
    </main>
  );
}
