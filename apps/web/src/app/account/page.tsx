"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  KeyRound,
  Loader2,
  LogOut,
  MonitorSmartphone,
  User as UserIcon,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import { useMe } from "@/hooks/queries/useMe";
import { useSessions } from "@/hooks/queries/useSessions";
import {
  useChangePassword,
  useRevokeOtherSessions,
  useRevokeSession,
  useUpdateProfile,
} from "@/hooks/mutations/useAccountMutations";
import { useUploadImage } from "@/hooks/useUploadImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Đoán nhanh trình duyệt + hệ điều hành từ user-agent — chỉ để hiển thị. */
function describeAgent(ua: string | null): string {
  if (!ua) return "Thiết bị không xác định";
  const browser = /edg/i.test(ua)
    ? "Edge"
    : /firefox/i.test(ua)
      ? "Firefox"
      : /chrome|crios/i.test(ua)
        ? "Chrome"
        : /safari/i.test(ua)
          ? "Safari"
          : ua.slice(0, 24);
  const os = /windows/i.test(ua)
    ? "Windows"
    : /mac os|macintosh/i.test(ua)
      ? "macOS"
      : /android/i.test(ua)
        ? "Android"
        : /iphone|ipad|ios/i.test(ua)
          ? "iOS"
          : /linux/i.test(ua)
            ? "Linux"
            : "";
  return os ? `${browser} · ${os}` : browser;
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border-2 border-gray-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ProfileSection() {
  const me = useMe();
  const updateProfile = useUpdateProfile();
  const { uploading, uploadFile } = useUploadImage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null); // null = chưa sửa, hiển thị giá trị server
  const [saved, setSaved] = useState(false);

  if (!me.data) return null;
  const displayName = name ?? me.data.name;

  async function handleAvatar(file: File) {
    const res = await uploadFile(file);
    if (res) updateProfile.mutate({ avatarUrl: res.asset.url });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const next = displayName.trim();
    if (!next || next === me.data?.name) return;
    updateProfile.mutate(
      { name: next },
      {
        onSuccess: () => {
          setName(null);
          setSaved(true);
          setTimeout(() => setSaved(false), 1600);
        },
      },
    );
  }

  return (
    <Section icon={<UserIcon className="size-5" />} title="Hồ sơ">
      <div className="flex items-start gap-6">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="group relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100"
          title="Đổi ảnh đại diện"
        >
          {me.data.avatarUrl ? (
            <img src={me.data.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="m-auto size-8 text-gray-400" />
          )}
          <span className="absolute inset-0 hidden items-center justify-center bg-black/40 text-white group-hover:flex">
            {uploading ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleAvatar(f);
            e.target.value = "";
          }}
        />
        <form onSubmit={handleSave} className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs">Tên hiển thị</Label>
            <Input value={displayName} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs">Email (không đổi được)</Label>
            <Input value={me.data.email} disabled />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={updateProfile.isPending || displayName.trim() === me.data.name}
            >
              {updateProfile.isPending ? <Loader2 className="animate-spin" /> : "Lưu hồ sơ"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Check className="size-3.5" /> Đã lưu
              </span>
            )}
          </div>
        </form>
      </div>
    </Section>
  );
}

function PasswordSection() {
  const me = useMe();
  const changePassword = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const hasPassword = me.data?.hasPassword ?? true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (next !== confirm) {
      setMessage({ ok: false, text: "Mật khẩu nhập lại không khớp" });
      return;
    }
    try {
      const res = await changePassword.mutateAsync({
        currentPassword: hasPassword ? current : undefined,
        newPassword: next,
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      setMessage({
        ok: true,
        text:
          res.revokedOtherSessions > 0
            ? `Đã đổi mật khẩu — ${res.revokedOtherSessions} thiết bị khác bị đăng xuất.`
            : "Đã đổi mật khẩu.",
      });
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof ApiError ? err.message : "Đổi mật khẩu thất bại — thử lại.",
      });
    }
  }

  return (
    <Section icon={<KeyRound className="size-5" />} title={hasPassword ? "Đổi mật khẩu" : "Đặt mật khẩu"}>
      {!hasPassword && (
        <p className="mb-4 text-sm text-gray-600">
          Tài khoản của bạn đăng nhập bằng Google — đặt thêm mật khẩu để đăng nhập trực tiếp.
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-3">
        {hasPassword && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs">Mật khẩu hiện tại</Label>
            <Input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-xs">Mật khẩu mới (≥8 ký tự, có chữ và số)</Label>
          <Input type="password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-muted-foreground text-xs">Nhập lại mật khẩu mới</Label>
          <Input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={changePassword.isPending}>
            {changePassword.isPending ? <Loader2 className="animate-spin" /> : hasPassword ? "Đổi mật khẩu" : "Đặt mật khẩu"}
          </Button>
        </div>
        {message && (
          <p className={message.ok ? "text-xs text-green-600" : "text-destructive text-xs"}>{message.text}</p>
        )}
        <p className="text-xs text-gray-500">Đổi mật khẩu sẽ đăng xuất mọi thiết bị khác.</p>
      </form>
    </Section>
  );
}

function SessionsSection() {
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();
  const list = sessions.data ?? [];
  const hasOthers = list.some((s) => !s.current);

  return (
    <Section icon={<MonitorSmartphone className="size-5" />} title="Phiên đăng nhập">
      {sessions.isPending ? (
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg border px-4 py-3">
              <MonitorSmartphone className="size-5 shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {describeAgent(s.userAgent)}
                  {s.current && (
                    <span className="bg-primary/10 text-primary ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                      Phiên này
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {s.ipAddress ?? "IP không rõ"} · đăng nhập{" "}
                  {new Date(s.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              {!s.current && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={revoke.isPending}
                  onClick={() => revoke.mutate(s.id)}
                  className="hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="size-3.5" /> Thu hồi
                </Button>
              )}
            </div>
          ))}
          {hasOthers && (
            <Button
              size="sm"
              variant="outline"
              disabled={revokeOthers.isPending}
              onClick={() => revokeOthers.mutate()}
              className="self-start"
            >
              {revokeOthers.isPending ? <Loader2 className="animate-spin" /> : <LogOut />} Đăng xuất mọi
              thiết bị khác
            </Button>
          )}
        </div>
      )}
    </Section>
  );
}

export default function AccountPage() {
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
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Quay lại
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-2xl font-bold">Tài khoản</h1>
        </div>
      </header>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
        <ProfileSection />
        <PasswordSection />
        <SessionsSection />
      </div>
    </main>
  );
}
