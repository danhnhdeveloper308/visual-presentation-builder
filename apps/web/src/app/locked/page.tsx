import Link from "next/link";
import type { Metadata } from "next";
import { Lock, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Tài khoản bị khóa" };

/**
 * Trang thông báo tài khoản bị khóa — đích redirect của Google OAuth callback khi
 * user bị admin khóa (đăng nhập bằng mật khẩu thì lỗi hiện inline ngay trong form).
 * Route public (KHÔNG nằm trong proxy matcher) — user bị khóa không có session.
 */
export default function LockedPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-linear-to-br from-white via-red-50 to-orange-50 px-6 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-red-100">
        <Lock className="size-9 text-red-600" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Tài khoản đã bị khóa</h1>
        <p className="max-w-md text-sm text-gray-600">
          Tài khoản của bạn đã bị quản trị viên tạm khóa nên không thể đăng nhập. Nếu bạn cho rằng
          đây là nhầm lẫn, hãy liên hệ quản trị viên để được mở khóa.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <a
          href="mailto:danhnh.developer@gmail.com?subject=Y%C3%AAu%20c%E1%BA%A7u%20m%E1%BB%9F%20kh%C3%B3a%20t%C3%A0i%20kho%E1%BA%A3n"
          className={buttonVariants()}
        >
          <Mail className="size-4" /> Liên hệ quản trị viên
        </a>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Về trang đăng nhập
        </Link>
      </div>
    </main>
  );
}
