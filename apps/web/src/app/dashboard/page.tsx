"use client";

import { useRouter } from "next/navigation";
import { Loader2, LogOut, Presentation, Sparkles } from "lucide-react";
import { useMe } from "@/hooks/queries/useMe";
import { useLogout } from "@/hooks/mutations/useLogout";
import { Button } from "@/components/ui/button";
import { ProjectGrid } from "@/components/dashboard/project-grid";

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
      <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-white via-blue-50 to-indigo-100">
        <Loader2 className="text-primary size-8 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-gradient-to-br from-white via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="mx-auto flex items-center justify-between px-6 lg:px-8 py-5 max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
              <Presentation className="text-white size-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Visual Builder</h1>
              <p className="text-xs text-gray-600">Quản lý các slide của bạn</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout} 
            disabled={logout.isPending}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            {logout.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <LogOut size={16} className="mr-2" />}
            Đăng xuất
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-primary size-6" />
            <h2 className="text-4xl font-bold">Xin chào, {me.data?.name}!</h2>
          </div>
          <p className="text-gray-600 text-lg">
            Sẵn sàng tạo những slide tuyệt vời? Chọn một project hoặc bắt đầu từ template.
          </p>
        </div>

        {/* Project Grid */}
        <ProjectGrid />
      </div>
    </main>
  );
}
