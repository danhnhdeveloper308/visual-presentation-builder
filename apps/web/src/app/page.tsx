import Link from "next/link";
import { Presentation, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-8">
      <div className="flex items-center gap-3">
        <Presentation className="size-10 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">
          Visual Presentation Builder
        </h1>
      </div>
      <p className="max-w-md text-center text-muted-foreground">
        Nền tảng tạo slide hiện đại — kéo-thả trực quan, kho template phong phú.
      </p>
      <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
        <Sparkles />
        Bắt đầu tạo slide
      </Link>
    </main>
  );
}
