"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { passwordSchema } from "@repo/shared";
import { ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useResetPassword } from "@/hooks/mutations/usePasswordReset";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Xác nhận khớp mật khẩu ngay tại form
const formSchema = z
  .object({ newPassword: passwordSchema, confirm: z.string() })
  .refine((v) => v.newPassword === v.confirm, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirm"],
  });
type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const reset = useResetPassword();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { newPassword: "", confirm: "" },
  });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await reset.mutateAsync({ token, newPassword: values.newPassword });
    } catch (err) {
      form.setError("root", {
        message: err instanceof ApiError ? err.message : "Đặt lại mật khẩu thất bại, thử lại sau",
      });
    }
  });

  // Token thiếu trong URL
  if (!token) {
    return (
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardContent className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            <h1 className="text-xl font-bold">Liên kết không hợp lệ</h1>
            <p className="text-muted-foreground text-sm">
              Thiếu mã đặt lại. Hãy yêu cầu gửi lại liên kết mới.
            </p>
            <Link
              href="/forgot-password"
              className="text-primary text-sm font-semibold hover:underline"
            >
              Yêu cầu liên kết mới
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Đặt lại thành công
  if (reset.isSuccess) {
    return (
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardContent className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <CheckCircle2 className="size-7" />
            </span>
            <h1 className="text-2xl font-bold">Đã đặt lại mật khẩu</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mật khẩu của bạn đã được cập nhật. Mọi thiết bị khác đã bị đăng xuất. Hãy đăng nhập
              lại bằng mật khẩu mới.
            </p>
            <Button variant="gradient" onClick={() => router.replace("/login")} className="mt-2">
              Đăng nhập ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card className="border-0 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-linear-to-br from-primary/5 via-transparent to-secondary/5" />
        <CardHeader className="relative px-8 pt-10 pb-6">
          <div className="from-primary to-secondary mb-4 flex size-12 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg shadow-primary/30">
            <KeyRound className="size-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Đặt mật khẩu mới</CardTitle>
          <CardDescription className="text-base">
            Chọn mật khẩu mới cho tài khoản của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative flex flex-col gap-6 px-8 pb-10">
          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-3">
              <Label htmlFor="newPassword" className="text-sm font-semibold">
                Mật khẩu mới (≥8 ký tự, có chữ và số)
              </Label>
              <PasswordInput
                id="newPassword"
                placeholder="••••••••"
                autoComplete="new-password"
                autoFocus
                aria-invalid={!!errors.newPassword}
                className="border-border h-11 border-2 bg-white/50 backdrop-blur-sm transition-all focus:border-primary focus:bg-white"
                {...form.register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-destructive text-xs font-medium">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="confirm" className="text-sm font-semibold">
                Nhập lại mật khẩu
              </Label>
              <PasswordInput
                id="confirm"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.confirm}
                className="border-border h-11 border-2 bg-white/50 backdrop-blur-sm transition-all focus:border-primary focus:bg-white"
                {...form.register("confirm")}
              />
              {errors.confirm && (
                <p className="text-destructive text-xs font-medium">{errors.confirm.message}</p>
              )}
            </div>
            {errors.root && (
              <p className="text-destructive border-destructive/30 bg-destructive/15 rounded-lg border p-3 text-xs font-medium">
                {errors.root.message}
              </p>
            )}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              loading={isSubmitting}
              className="w-full font-semibold"
            >
              {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </Button>
          </form>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 text-sm"
          >
            <ArrowLeft className="size-4" /> Về trang đăng nhập
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
