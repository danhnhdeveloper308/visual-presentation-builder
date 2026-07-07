"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@repo/shared";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useLogin } from "@/hooks/mutations/useLogin";
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
    <Card className="w-full max-w-sm border-0 shadow-xl">
      <CardHeader className="pb-6 pt-8 px-8">
        <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
        <CardDescription className="text-sm mt-1">
          Tiếp tục với Visual Presentation Builder
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 px-8 pb-8">
        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className="h-10 border-border/60 focus:border-primary transition-colors"
              {...form.register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-xs font-medium">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Mật khẩu
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              className="h-10 border-border/60 focus:border-primary transition-colors"
              {...form.register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-xs font-medium">{errors.password.message}</p>
            )}
          </div>
          {errors.root && (
            <p className="text-destructive text-xs font-medium bg-destructive/10 p-2.5 rounded-md">
              {errors.root.message}
            </p>
          )}
          <Button type="submit" disabled={isSubmitting} className="w-full h-10 mt-1 font-medium">
            {isSubmitting && <Loader2 className="mr-2 animate-spin h-4 w-4" />}
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>
        <div className="relative text-center text-xs text-muted-foreground after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="bg-card relative z-10 px-2 font-medium">hoặc</span>
        </div>
        <GoogleButton label="Đăng nhập với Google" />
        <p className="text-muted-foreground text-center text-sm">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
          >
            Đăng ký
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
