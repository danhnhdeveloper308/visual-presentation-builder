import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  MousePointerClick,
  Palette,
  Play,
  Presentation,
  Share2,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";

const FEATURES = [
  { icon: MousePointerClick, title: "Kéo-thả trực quan", desc: "Sắp xếp mọi phần tử bằng chuột, canh lề thông minh như Canva." },
  { icon: LayoutTemplate, title: "500+ template", desc: "Bắt đầu từ mẫu đẹp sẵn có cho mọi chủ đề, chỉnh vài phút là xong." },
  { icon: Palette, title: "Theme & màu sắc", desc: "Đổi bộ màu, font toàn bộ slide chỉ với một cú nhấp." },
  { icon: Wand2, title: "Hiệu ứng động", desc: "21+ hiệu ứng trình chiếu theo phong cách PowerPoint." },
  { icon: Layers, title: "Biểu đồ & bảng", desc: "Chèn chart, bảng, media sống động ngay trong slide." },
  { icon: Share2, title: "Chia sẻ & xuất", desc: "Xuất PDF/PPTX/PNG hoặc chia sẻ link cho cả nhóm." },
];

const STEPS = [
  { n: "01", title: "Chọn template", desc: "Bắt đầu từ mẫu có sẵn hoặc trang trắng." },
  { n: "02", title: "Tùy chỉnh nội dung", desc: "Kéo-thả, đổi màu, thêm biểu đồ và hiệu ứng." },
  { n: "03", title: "Trình chiếu & chia sẻ", desc: "Present toàn màn hình hoặc xuất/chia sẻ ngay." },
];

/** Mockup editor thu nhỏ — dựng bằng DOM thật để hero sống động hơn ô xám. */
function EditorMockup() {
  return (
    <div className="animate-float rounded-2xl border border-white/60 bg-white/70 p-3 shadow-2xl shadow-primary/20 backdrop-blur-xl">
      {/* thanh cửa sổ */}
      <div className="mb-3 flex items-center gap-1.5 px-1">
        <span className="size-3 rounded-full bg-red-400" />
        <span className="size-3 rounded-full bg-amber-400" />
        <span className="size-3 rounded-full bg-green-400" />
        <span className="ml-3 h-4 flex-1 rounded bg-gray-200/70" />
      </div>
      <div className="flex gap-3">
        {/* sidebar slide */}
        <div className="hidden w-16 shrink-0 flex-col gap-2 sm:flex">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`aspect-video rounded-md border-2 ${i === 0 ? "border-primary bg-primary/10" : "border-gray-200 bg-gray-100"}`}
            />
          ))}
        </div>
        {/* canvas */}
        <div className="relative flex-1 overflow-hidden rounded-xl bg-linear-to-br from-indigo-500 via-primary to-secondary p-6 text-white">
          <div className="mb-3 h-2.5 w-16 rounded-full bg-white/50" />
          <div className="mb-2 h-6 w-4/5 rounded-md bg-white/90" />
          <div className="mb-5 h-6 w-3/5 rounded-md bg-white/60" />
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-2 w-full rounded-full bg-white/40" />
              <div className="h-2 w-5/6 rounded-full bg-white/40" />
              <div className="h-2 w-4/6 rounded-full bg-white/40" />
            </div>
            {/* mini bar chart */}
            <div className="flex items-end gap-1.5">
              {[10, 22, 16, 28].map((h, i) => (
                <div key={i} className="w-3 rounded-t bg-white/80" style={{ height: h + 12 }} />
              ))}
            </div>
          </div>
          <div className="absolute right-4 bottom-4 flex size-9 items-center justify-center rounded-full bg-white/25 backdrop-blur">
            <Sparkles className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  // Check nhanh như proxy.ts: có cookie access_token = đang có session (xác thực thật vẫn ở BE)
  const hasSession = (await cookies()).has("access_token");

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="from-primary to-secondary rounded-xl bg-linear-to-br p-2 shadow-md shadow-primary/30">
              <Presentation className="size-5 text-white" />
            </div>
            <span className="from-primary to-secondary hidden bg-linear-to-r bg-clip-text text-xl font-bold text-transparent sm:inline">
              Visual Builder
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {hasSession ? (
              <>
                <Link href="/dashboard" className={buttonVariants({ variant: "gradient" })}>
                  <LayoutDashboard className="size-4" /> Vào Dashboard
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-primary text-sm font-medium text-foreground transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link href="/register" className={buttonVariants({ variant: "gradient" })}>
                  Bắt đầu miễn phí
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden bg-linear-to-br from-white via-blue-50 to-indigo-100">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="animate-blob bg-primary/30 absolute -top-10 left-10 size-72 rounded-full blur-3xl" />
            <div className="animate-blob animation-delay-2000 bg-secondary/25 absolute top-1/4 right-10 size-96 rounded-full blur-3xl" />
            <div className="animate-blob animation-delay-4000 bg-accent/25 absolute -bottom-24 left-1/3 size-80 rounded-full blur-3xl" />
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-28 lg:px-8">
            <div>
              <div className="border-primary/30 bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold">
                <Sparkles className="size-4" /> Công cụ thiết kế slide thế hệ mới
              </div>
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
                Tạo slide
                <span className="from-primary via-secondary to-accent block bg-linear-to-r bg-clip-text text-transparent">
                  tuyệt vời ngay bây giờ
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
                Công cụ kéo-thả toàn diện với hàng trăm template chuyên nghiệp, biểu đồ, hiệu ứng
                động. Không cần kỹ năng thiết kế để tạo bài trình chiếu ấn tượng.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={hasSession ? "/dashboard" : "/register"}
                  className={buttonVariants({ variant: "gradient", size: "lg" })}
                >
                  <Sparkles className="size-5" /> Tạo slide miễn phí
                </Link>
                <Link
                  href="/templates"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  <Play className="size-5" /> Xem template
                </Link>
              </div>
              <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
                {[
                  { v: "10K+", l: "Người dùng", c: "text-primary" },
                  { v: "500+", l: "Template", c: "text-secondary" },
                  { v: "4.9★", l: "Đánh giá", c: "text-accent" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className={`text-3xl font-bold ${s.c}`}>{s.v}</div>
                    <div className="text-sm text-gray-600">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <EditorMockup />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-dot-grid relative bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Mọi thứ bạn cần trong một công cụ
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Từ ý tưởng đến bài trình chiếu hoàn chỉnh — nhanh, đẹp và chuyên nghiệp.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group hover:border-primary/40 hover:shadow-primary/10 relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="from-primary to-secondary mb-5 flex size-12 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-110">
                    <f.icon className="size-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
                  <p className="leading-relaxed text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-linear-to-b from-white to-indigo-50/60 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Chỉ 3 bước đơn giản</h2>
              <p className="mt-4 text-lg text-gray-600">Bắt đầu tạo slide chuyên nghiệp trong vài phút.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.n} className="relative">
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                    <div className="from-primary to-secondary mb-4 bg-linear-to-r bg-clip-text text-5xl font-black text-transparent">
                      {s.n}
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{s.title}</h3>
                    <p className="text-gray-600">{s.desc}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="text-primary/40 absolute top-1/2 -right-6 hidden size-8 -translate-y-1/2 md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="from-primary via-secondary to-accent relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-linear-to-r px-8 py-16 text-center shadow-2xl shadow-primary/30">
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute -top-10 -left-10 size-52 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute -right-10 -bottom-10 size-52 rounded-full bg-white/30 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-4xl font-bold text-white sm:text-5xl">Sẵn sàng bắt đầu?</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
                Tạo slide chuyên nghiệp hoàn toàn miễn phí. Không cần thẻ tín dụng.
              </p>
              <Link
                href={hasSession ? "/dashboard" : "/register"}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-primary shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
              >
                <Zap className="size-5" /> Bắt đầu ngay bây giờ
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4 flex items-center gap-2">
                <div className="from-primary to-secondary rounded-lg bg-linear-to-br p-2">
                  <Presentation className="size-5 text-white" />
                </div>
                <span className="font-bold">Visual Builder</span>
              </div>
              <p className="max-w-xs text-sm text-gray-400">
                Công cụ thiết kế slide hiện đại, kéo-thả trực quan cho mọi người.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Sản phẩm</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link href="/templates" className="hover:text-white transition-colors">Template</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Bắt đầu</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Công ty</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><span className="cursor-default">Về chúng tôi</span></li>
                <li><span className="cursor-default">Blog</span></li>
                <li><span className="cursor-default">Liên hệ</span></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Pháp lý</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-white transition-colors">Điều khoản</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Riêng tư</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 Visual Presentation Builder. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
