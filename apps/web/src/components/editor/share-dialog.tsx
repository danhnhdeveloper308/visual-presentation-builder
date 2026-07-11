"use client";

import { useState } from "react";
import { Check, Copy, Globe, Loader2, Trash2, UserPlus, X } from "lucide-react";
import type { CollaboratorRole, ProjectDetail } from "@repo/shared";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCollaborators } from "@/hooks/queries/useCollaborators";
import {
  useAddCollaborator,
  useRemoveCollaborator,
  useUpdateCollaborator,
} from "@/hooks/mutations/useCollaboratorMutations";
import { useShareLink } from "@/hooks/mutations/useShareLink";

const ROLE_LABELS: Record<CollaboratorRole, string> = {
  editor: "Chỉnh sửa",
  viewer: "Chỉ xem",
};

/** Dialog chia sẻ project (chỉ owner mở được): share với user theo email + link public. */
export function ShareDialog({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const project = queryClient.getQueryData<ProjectDetail>(["project", projectId]);
  const collaborators = useCollaborators(projectId);
  const addCollaborator = useAddCollaborator(projectId);
  const updateCollaborator = useUpdateCollaborator(projectId);
  const removeCollaborator = useRemoveCollaborator(projectId);
  const shareLink = useShareLink(projectId);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaboratorRole>("viewer");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareToken = project?.shareToken ?? null;
  const publicUrl = shareToken ? `${window.location.origin}/p/${shareToken}` : null;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await addCollaborator.mutateAsync({ email: email.trim().toLowerCase(), role });
      setEmail("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Thêm thất bại — thử lại.");
    }
  }

  async function copyLink() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div role="none" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-background relative flex max-h-[85vh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-lg border p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Chia sẻ project</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="hover:bg-accent rounded p-1">
            <X className="size-4" />
          </button>
        </div>

        {/* ---- Share với user theo email ---- */}
        <form onSubmit={handleAdd} className="flex flex-col gap-2">
          <Label className="text-muted-foreground text-xs">Chia sẻ với người dùng (theo email)</Label>
          <div className="flex gap-2">
            <Input
              type="email"
              required
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <select
              className="border-input bg-transparent dark:bg-input/30 h-9 rounded-md border px-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as CollaboratorRole)}
            >
              <option value="viewer">Chỉ xem</option>
              <option value="editor">Chỉnh sửa</option>
            </select>
            <Button type="submit" size="sm" disabled={addCollaborator.isPending} aria-label="Thêm">
              {addCollaborator.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
            </Button>
          </div>
          {error && <p className="text-destructive text-xs">{error}</p>}
        </form>

        <div className="flex flex-col gap-1.5">
          {collaborators.isPending ? (
            <Loader2 className="text-muted-foreground size-4 animate-spin" />
          ) : (collaborators.data ?? []).length === 0 ? (
            <p className="text-muted-foreground text-xs">Chưa chia sẻ với ai.</p>
          ) : (
            (collaborators.data ?? []).map((c) => (
              <div key={c.userId} className="flex items-center gap-2 rounded-md border px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-muted-foreground truncate text-xs">{c.email}</p>
                </div>
                <select
                  className="border-input bg-transparent dark:bg-input/30 h-8 rounded-md border px-2 text-xs"
                  value={c.role}
                  onChange={(e) =>
                    updateCollaborator.mutate({ userId: c.userId, role: e.target.value as CollaboratorRole })
                  }
                >
                  {(Object.keys(ROLE_LABELS) as CollaboratorRole[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label={`Gỡ ${c.email}`}
                  disabled={removeCollaborator.isPending}
                  onClick={() => removeCollaborator.mutate(c.userId)}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* ---- Share public bằng link ---- */}
        <div className="flex flex-col gap-2 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-xs">
              <Globe className="size-3.5" /> Link công khai (ai có link đều xem được)
            </Label>
            <Button
              size="sm"
              variant={shareToken ? "outline" : "default"}
              disabled={shareLink.isPending}
              onClick={() => shareLink.mutate(!shareToken)}
            >
              {shareLink.isPending ? <Loader2 className="animate-spin" /> : shareToken ? "Tắt chia sẻ" : "Bật chia sẻ"}
            </Button>
          </div>
          {publicUrl ? (
            <div className="flex items-center gap-2">
              <Input readOnly value={publicUrl} className="flex-1 text-xs" onFocus={(e) => e.target.select()} />
              <Button size="sm" variant="outline" onClick={copyLink} aria-label="Copy link">
                {copied ? <Check className="text-green-600" /> : <Copy />}
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              Đang tắt — bật để lấy link xem công khai (không cần đăng nhập). Tắt lại thì link cũ hết
              hiệu lực ngay.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
