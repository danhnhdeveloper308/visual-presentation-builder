"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Lock,
  LockOpen,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { LIMITS, SUPERADMIN_EMAIL, type AdminUserSummary } from "@repo/shared";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/format";
import { useMe } from "@/hooks/queries/useMe";
import { useAdminUsers } from "@/hooks/queries/useAdminUsers";
import { useSetUserLock, useSetUserQuota } from "@/hooks/mutations/useAdminUserMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ui/confirm-dialog";

const MB = 1024 * 1024;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN");
}

/** 1 hàng user: thông tin + usage/quota (sửa được) + khóa/mở khóa. */
function UserRow({ user, myId }: { user: AdminUserSummary; myId: string | undefined }) {
  const confirm = useConfirm();
  const setLock = useSetUserLock();
  const setQuota = useSetUserQuota();
  const [editingQuota, setEditingQuota] = useState(false);
  const [quotaMb, setQuotaMb] = useState(Math.round(user.storageQuotaBytes / MB));

  const isSuperadmin = user.email === SUPERADMIN_EMAIL;
  const isSelf = user.id === myId;
  const locked = user.lockedAt != null;
  const ratio =
    user.storageQuotaBytes > 0
      ? Math.min(user.usedStorageBytes / user.storageQuotaBytes, 1)
      : 0;

  async function handleToggleLock() {
    if (locked) {
      setLock.mutate({ userId: user.id, locked: false });
      return;
    }
    const ok = await confirm({
      title: `Khóa tài khoản "${user.name}"?`,
      description: `${user.email} sẽ bị đăng xuất khỏi mọi thiết bị ngay lập tức và không thể đăng nhập cho tới khi mở khóa.`,
      destructive: true,
      confirmText: "Khóa",
    });
    if (ok) setLock.mutate({ userId: user.id, locked: true });
  }

  function commitQuota() {
    setEditingQuota(false);
    const bytes = Math.round(quotaMb * MB);
    if (
      !Number.isFinite(bytes) ||
      bytes < 0 ||
      bytes > LIMITS.USER_STORAGE_QUOTA_MAX_BYTES ||
      bytes === user.storageQuotaBytes
    ) {
      setQuotaMb(Math.round(user.storageQuotaBytes / MB));
      return;
    }
    setQuota.mutate({ userId: user.id, storageQuotaBytes: bytes });
  }

  return (
    <tr className={cn("border-b border-gray-100 last:border-0", locked && "bg-red-50/50")}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserRound className="size-4 text-gray-400" />
            )}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium">
              {user.name}
              {isSuperadmin && (
                <span title="SUPERADMIN">
                  <ShieldCheck className="size-3.5 shrink-0 text-indigo-500" />
                </span>
              )}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium",
            user.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600",
          )}
        >
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3 text-center text-sm tabular-nums">{user.projectCount}</td>
      <td className="min-w-52 px-4 py-3">
        <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
          <span className="tabular-nums">
            {formatBytes(user.usedStorageBytes)} /{" "}
            {editingQuota ? (
              <span className="inline-flex items-center gap-1">
                <Input
                  autoFocus
                  type="number"
                  min={0}
                  max={LIMITS.USER_STORAGE_QUOTA_MAX_BYTES / MB}
                  value={quotaMb}
                  onChange={(e) => setQuotaMb(Number(e.target.value))}
                  onBlur={commitQuota}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") {
                      setQuotaMb(Math.round(user.storageQuotaBytes / MB));
                      setEditingQuota(false);
                    }
                  }}
                  className="h-6 w-20 px-1.5 text-xs"
                />
                MB
              </span>
            ) : (
              formatBytes(user.storageQuotaBytes)
            )}
          </span>
          {!editingQuota && (
            <button
              type="button"
              title="Chỉnh quota"
              aria-label="Chỉnh quota"
              onClick={() => setEditingQuota(true)}
              className="text-gray-400 hover:text-gray-700"
              disabled={setQuota.isPending}
            >
              {setQuota.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Pencil className="size-3.5" />
              )}
            </button>
          )}
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn(
              "h-full rounded-full",
              ratio > 0.9 ? "bg-red-500" : ratio > 0.7 ? "bg-amber-500" : "bg-primary",
            )}
            style={{ width: `${Math.max(ratio * 100, 2)}%` }}
          />
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(user.createdAt)}</td>
      <td className="px-4 py-3">
        {locked ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
            Đã khóa
          </span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            Hoạt động
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant={locked ? "outline" : "ghost"}
          size="sm"
          disabled={setLock.isPending || isSuperadmin || isSelf}
          title={
            isSuperadmin
              ? "Không thể khóa SUPERADMIN"
              : isSelf
                ? "Không thể tự khóa chính mình"
                : undefined
          }
          onClick={handleToggleLock}
          className={cn(!locked && "text-red-600 hover:bg-red-50 hover:text-red-700")}
        >
          {setLock.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : locked ? (
            <>
              <LockOpen className="size-4" /> Mở khóa
            </>
          ) : (
            <>
              <Lock className="size-4" /> Khóa
            </>
          )}
        </Button>
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const me = useMe();
  const users = useAdminUsers();

  if (me.isPending) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Loader2 className="text-primary size-8 animate-spin" />
      </main>
    );
  }

  // Proxy chỉ check cookie — chặn thêm ở FE cho user thường (BE vẫn là chốt cuối 403)
  if (me.data && me.data.role !== "admin") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3">
        <ShieldCheck className="size-10 text-gray-300" />
        <p className="text-sm text-gray-600">Bạn không có quyền truy cập trang quản trị.</p>
        <Link href="/dashboard" className="text-primary text-sm hover:underline">
          ← Về Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-linear-to-br from-white via-blue-50 to-indigo-100">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="size-4" /> Dashboard
          </Link>
          <div className="mx-1 h-5 w-px bg-gray-200" />
          <ShieldCheck className="text-primary size-5" />
          <h1 className="text-lg font-bold">Quản trị người dùng</h1>
          <span className="text-sm text-gray-500">{users.data?.length ?? 0} user</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {users.isPending ? (
          <div className="flex justify-center py-20">
            <Loader2 className="text-primary size-8 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-3xl text-left">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 font-medium">Người dùng</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 text-center font-medium">Projects</th>
                  <th className="px-4 py-3 font-medium">Lưu trữ (đã dùng / quota)</th>
                  <th className="px-4 py-3 font-medium">Tham gia</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.data?.map((u) => <UserRow key={u.id} user={u} myId={me.data?.id} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
