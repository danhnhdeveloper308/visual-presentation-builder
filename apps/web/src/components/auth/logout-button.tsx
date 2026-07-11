"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useLogout } from "@/hooks/mutations/useLogout";
import { Button } from "@/components/ui/button";

/** Nút đăng xuất dùng ở HomePage — logout xong refresh lại server component để header đổi về trạng thái khách. */
export function LogoutButton() {
  const router = useRouter();
  const logout = useLogout();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={logout.isPending}
      onClick={() =>
        logout.mutate(undefined, {
          // Thành công hay thất bại đều refresh: BE clear cookie kể cả khi session đã hết hạn
          onSettled: () => router.refresh(),
        })
      }
    >
      <LogOut className="size-4" />
      {logout.isPending ? "Đang thoát..." : "Đăng xuất"}
    </Button>
  );
}
