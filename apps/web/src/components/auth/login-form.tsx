"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@repo/shared";
import { Presentation } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useLogin } from "@/hooks/mutations/useLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleButton } from "./google-button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      router.replace(searchParams.get("next") ?? "/dashboard");
    } catch (err) {
      form.setError("root", {
        message: err instanceof ApiError ? err.message : "Đăng nhập thất bại, thử lại sau",
      });
    }
  });

  const { errors, isSubmitting } = form.formState;

  return (
    <div className="w-full max-w-md">
      <Card className="border-0 shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 rounded-lg pointer-events-none" />
        <CardHeader className="relative px-8 pt-10 pb-8">
          <div className="from-primary to-secondary mb-4 flex size-12 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg shadow-primary/30">
            <Presentation className="size-6 text-white" />
          </div>
          <CardTitle className="from-primary to-secondary bg-linear-to-r bg-clip-text text-3xl font-bold text-transparent">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-base">
            Tiếp tục khám phá Visual Presentation Builder
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
                aria-invalid={!!errors.email}
                className="h-11 border-2 border-border bg-white/50 backdrop-blur-sm focus:border-primary focus:bg-white transition-all"
                {...form.register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-xs font-medium">{errors.email.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Mật khẩu
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-primary hover:text-secondary text-xs font-medium transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className="h-11 border-2 border-border bg-white/50 backdrop-blur-sm focus:border-primary focus:bg-white transition-all"
                {...form.register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-xs font-medium">{errors.password.message}</p>
              )}
            </div>
            {errors.root && (
              <p className="text-destructive text-xs font-medium bg-destructive/15 border border-destructive/30 p-3 rounded-lg">
                {errors.root.message}
              </p>
            )}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              loading={isSubmitting}
              className="mt-2 w-full font-semibold"
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
          <div className="relative text-center text-xs text-muted-foreground after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="bg-card relative z-10 px-3 font-semibold">hoặc</span>
          </div>
          <GoogleButton label="Đăng nhập với Google" />
          <p className="text-muted-foreground text-center text-sm">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-secondary transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
