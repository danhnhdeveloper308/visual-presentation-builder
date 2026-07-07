"use client";

import { useRouter } from "next/navigation";
import { Loader2, LogOut, Presentation } from "lucide-react";
import { useMe } from "@/hooks/queries/useMe";
import { useLogout } from "@/hooks/mutations/useLogout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const me = useMe();
  const logout = useLogout();

  async function handleLogout() {
    await logout.mutateAsync();
    router.replace("/login");
  }

  if (me.isPending) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Presentation className="text-primary size-6" />
          <span className="font-semibold">Visual Presentation Builder</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} disabled={logout.isPending}>
          {logout.isPending ? <Loader2 className="animate-spin" /> : <LogOut />}
          Đăng xuất
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Xin chào, {me.data?.name}</CardTitle>
          <CardDescription>
            {me.data?.email} — role: {me.data?.role}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Danh sách project sẽ hiển thị ở đây (Phase 1 — Core Editor).
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
