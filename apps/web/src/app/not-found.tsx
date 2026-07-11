import Link from "next/link";
import { Compass, Home, Presentation } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/** Trang 404 toàn app — URL không tồn tại. */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-linear-to-br from-white via-blue-50 to-indigo-100 px-6 text-center">
      <div className="relative">
        <p className="from-primary to-secondary bg-linear-to-r bg-clip-text text-[7rem] leading-none font-black text-transparent select-none sm:text-[9rem]">
          404
        </p>
        <Compass
          className="text-primary/30 absolute -top-4 -right-10 size-14 rotate-12"
          aria-hidden
        />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-gray-900">Không tìm thấy trang</h1>
        <p className="max-w-md text-sm text-gray-600">
          Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển. Kiểm tra lại URL hoặc quay về
          trang chính.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/dashboard" className={buttonVariants()}>
          <Presentation className="size-4" /> Vào Dashboard
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          <Home className="size-4" /> Trang chủ
        </Link>
      </div>
    </main>
  );
}
