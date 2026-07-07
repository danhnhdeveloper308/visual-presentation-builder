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
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Đăng ký</CardTitle>
        <CardDescription>Tạo tài khoản Visual Presentation Builder</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Tên</Label>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...form.register("name")}
            />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...form.register("email")}
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...form.register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            )}
          </div>
          {errors.root && <p className="text-destructive text-sm">{errors.root.message}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="animate-spin" />}
            Đăng ký
          </Button>
        </form>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-card text-muted-foreground relative z-10 px-2">hoặc</span>
        </div>
        <GoogleButton label="Đăng ký với Google" />
        <p className="text-muted-foreground text-center text-sm">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Đăng nhập
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
