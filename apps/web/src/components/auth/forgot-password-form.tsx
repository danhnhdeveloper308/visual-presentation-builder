"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@repo/shared";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import { useForgotPassword } from "@/hooks/mutations/usePasswordReset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const { errors, isSubmitting } = form.formState;
  const submittedEmail = forgot.data ? form.getValues("email") : null;

  const onSubmit = form.handleSubmit(async (values) => {
    // BE luôn trả success — chỉ cần chuyển sang màn "đã gửi"
    await forgot.mutateAsync(values).catch(() => undefined);
  });

  // Màn xác nhận sau khi gửi
  if (forgot.isSuccess) {
    return (
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl">
          <CardContent className="flex flex-col items-center gap-4 px-8 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <MailCheck className="size-7" />
            </span>
            <h1 className="text-2xl font-bold">Kiểm tra email của bạn</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Nếu <span className="font-medium text-foreground">{submittedEmail}</span> tồn tại
              trong hệ thống, chúng tôi đã gửi một liên kết đặt lại mật khẩu (hiệu lực 1 giờ). Kiểm
              tra cả hộp thư spam nếu không thấy.
            </p>
            <Link
              href="/login"
              className="text-primary mt-2 flex items-center gap-1 text-sm font-semibold hover:underline"
            >
              <ArrowLeft className="size-4" /> Về trang đăng nhập
            </Link>
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
          <CardTitle className="text-2xl font-bold">Quên mật khẩu?</CardTitle>
          <CardDescription className="text-base">
            Nhập email đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative flex flex-col gap-6 px-8 pb-10">
          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-3">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                aria-invalid={!!errors.email}
                className="border-border h-11 border-2 bg-white/50 backdrop-blur-sm transition-all focus:border-primary focus:bg-white"
                {...form.register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-xs font-medium">{errors.email.message}</p>
              )}
            </div>
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              loading={isSubmitting}
              className="w-full font-semibold"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi liên kết đặt lại"}
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
