"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@repo/shared";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useRegister } from "@/hooks/mutations/useRegister";
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

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values);
      router.replace("/dashboard");
    } catch (err) {
      form.setError("root", {
        message: err instanceof ApiError ? err.message : "Đăng ký thất bại, thử lại sau",
      });
    }
  });

  const { errors, isSubmitting } = form.formState;

  return (
    <div className="w-full max-w-md">
      <Card className="border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5 rounded-lg pointer-events-none" />
        <CardHeader className="relative pb-8 pt-10 px-8">
          <div className="mb-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              Đăng ký
            </CardTitle>
          </div>
          <CardDescription className="text-base">
            Bắt đầu tạo slide chuyên nghiệp ngay
          </CardDescription>
        </CardHeader>
        <CardContent className="relative flex flex-col gap-6 px-8 pb-10">
          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-3">
              <Label htmlFor="name" className="text-sm font-semibold">
                Tên
              </Label>
              <Input
                id="name"
                placeholder="Tên của bạn"
                autoComplete="name"
                aria-invalid={!!errors.name}
                className="h-11 border-2 border-border bg-white/50 backdrop-blur-sm focus:border-secondary focus:bg-white transition-all"
                {...form.register("name")}
              />
              {errors.name && (
                <p className="text-destructive text-xs font-medium">{errors.name.message}</p>
              )}
            </div>
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
                className="h-11 border-2 border-border bg-white/50 backdrop-blur-sm focus:border-secondary focus:bg-white transition-all"
                {...form.register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-xs font-medium">{errors.email.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="password" className="text-sm font-semibold">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                className="h-11 border-2 border-border bg-white/50 backdrop-blur-sm focus:border-secondary focus:bg-white transition-all"
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
              disabled={isSubmitting} 
              className="w-full h-11 mt-2 font-semibold bg-gradient-to-r from-secondary to-accent hover:shadow-lg hover:shadow-secondary/30 transition-all text-white"
            >
              {isSubmitting && <Loader2 className="mr-2 animate-spin h-4 w-4" />}
              {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </form>
          <div className="relative text-center text-xs text-muted-foreground after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="bg-card relative z-10 px-3 font-semibold">hoặc</span>
          </div>
          <GoogleButton label="Đăng ký với Google" />
          <p className="text-muted-foreground text-center text-sm">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-semibold text-secondary hover:text-accent transition-colors"
            >
              Đăng nhập
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
