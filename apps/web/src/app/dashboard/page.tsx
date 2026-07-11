"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  HardDrive,
  LayoutTemplate,
  Loader2,
  LogOut,
  Palette,
  Presentation,
  ShieldCheck,
  Trash,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/format";
import { useMe } from "@/hooks/queries/useMe";
import { useStorageUsage } from "@/hooks/queries/useStorageUsage";
import { useLogout } from "@/hooks/mutations/useLogout";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { SharedGrid } from "@/components/dashboard/shared-grid";

const NAV_LINKS = [
  { href: "/templates", label: "Template", Icon: LayoutTemplate },
  { href: "/themes", label: "Theme", Icon: Palette },
  { href: "/trash", label: "Thùng rác", Icon: Trash },
];

/** Thanh quota lưu trữ trong menu profile — đỏ khi dùng >90%. */
function StorageBar() {
  const usage = useStorageUsage();
  if (!usage.data) return null;
  const { usedBytes, quotaBytes } = usage.data;
  const ratio = quotaBytes > 0 ? Math.min(usedBytes / quotaBytes, 1) : 0;
  return (
    <div className="border-b border-gray-100 px-3 py-2">
      <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <HardDrive className="size-3.5" /> Dung lượng
        </span>
        <span className="tabular-nums">
          {formatBytes(usedBytes)} / {formatBytes(quotaBytes)}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            ratio > 0.9 ? "bg-red-500" : ratio > 0.7 ? "bg-amber-500" : "bg-primary",
          )}
          style={{ width: `${Math.max(ratio * 100, 2)}%` }}
        />
      </div>
    </div>
  );
}

/** Menu tài khoản: avatar + tên gộp chung với đăng xuất trong 1 dropdown. */
function ProfileMenu() {
  const router = useRouter();
  const me = useMe();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function handleLogout() {
    await logout.mutateAsync();
    router.replace("/login");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="hover:bg-accent flex items-center gap-2 rounded-full border border-gray-200 py-1 pr-2 pl-1 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-gray-100">
          {me.data?.avatarUrl ? (
            <img src={me.data.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserRound className="size-4 text-gray-500" />
          )}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-medium sm:block">
          {me.data?.name}
        </span>
        <ChevronDown
          className={`size-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-in fade-in slide-in-from-top-1 absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl duration-150"
        >
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="truncate text-sm font-semibold">{me.data?.name}</p>
            <p className="truncate text-xs text-gray-500">{me.data?.email}</p>
          </div>
          <StorageBar />
          {me.data?.role === "admin" && (
            <Link
              href="/admin"
              role="menuitem"
              className="hover:bg-accent flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              <ShieldCheck className="size-4 text-gray-500" /> Trang quản trị
            </Link>
          )}
          <Link
            href="/account"
            role="menuitem"
            className="hover:bg-accent mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
            onClick={() => setOpen(false)}
          >
            <UserRound className="size-4 text-gray-500" /> Tài khoản của tôi
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            {logout.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const me = useMe();

  if (me.isPending) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-linear-to-br from-white via-blue-50 to-indigo-100">
        <Loader2 className="text-primary size-8 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-linear-to-br from-white via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="from-primary to-secondary rounded-lg bg-linear-to-br p-2">
              <Presentation className="size-5 text-white" />
            </div>
            <span className="text-lg font-bold">Visual Builder</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="hover:bg-accent flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                <Icon className="size-4" /> {label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />
          <ProfileMenu />
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-8 lg:px-8">
        {/* Welcome */}
        <div className="from-primary/90 to-secondary/90 relative overflow-hidden rounded-3xl bg-linear-to-r px-8 py-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold sm:text-3xl">Xin chào, {me.data?.name}! 👋</h2>
          <p className="mt-1 max-w-xl text-sm text-white/85 sm:text-base">
            Sẵn sàng tạo những slide tuyệt vời? Tiếp tục một project bên dưới hoặc bắt đầu từ
            template.
          </p>
          {/* Nav nhanh cho màn hình nhỏ (nav header ẩn) */}
          <div className="mt-4 flex flex-wrap gap-2 md:hidden">
            {NAV_LINKS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur hover:bg-white/25"
              >
                <Icon className="size-3.5" /> {label}
              </Link>
            ))}
          </div>
          <Presentation className="pointer-events-none absolute -right-6 -bottom-8 size-40 text-white/10" />
        </div>

        <ProjectGrid />
        <SharedGrid />
      </div>
    </main>
  );
}
