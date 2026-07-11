"use client";

import { use } from "react";
import Link from "next/link";
import { Loader2, Unlink } from "lucide-react";
import { usePublicPresentation } from "@/hooks/queries/usePublicPresentation";
import { PresentationViewer } from "@/components/viewer/presentation-viewer";

/** Xem presentation qua link share public — KHÔNG cần đăng nhập (route nằm ngoài proxy matcher). */
export default function PublicPresentationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const query = usePublicPresentation(token);

  if (query.isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-950">
        <Loader2 className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-gray-950 text-white">
        <Unlink className="size-10 text-white/40" />
        <p className="font-medium">Link chia sẻ không tồn tại hoặc đã bị tắt</p>
        <Link href="/" className="text-primary text-sm hover:underline">
          Về trang chủ Visual Builder →
        </Link>
      </div>
    );
  }

  return (
    <PresentationViewer
      title={query.data.title}
      presentation={query.data.content}
      subtitle="Bản chia sẻ công khai — chỉ xem"
    />
  );
}
