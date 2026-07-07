import Link from "next/link";
import { Presentation, Sparkles, Zap, Layers, Share2, Palette } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-dvh relative overflow-hidden">
      {/* Subtle background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute top-0 -left-1/3 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-accent/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-secondary/8 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-dvh px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <Presentation className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Tạo Slide{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Chuyên Nghiệp
            </span>
            <br />
            Trong Vài Phút
          </h1>

          {/* Subheading */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Visual Presentation Builder — nền tảng thiết kế slide hiện đại với kéo-thả trực quan,
            kho template phong phú, và những hiệu ứng chuyển động tuyệt vời.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
              <Sparkles className="w-5 h-5" />
              Bắt Đầu Tạo Slide
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Tạo Tài Khoản
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Feature 1 */}
          <div className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10 duration-300">
            <div className="p-2 w-fit mb-4 bg-primary/10 rounded-lg">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nhanh Chóng</h3>
            <p className="text-sm text-muted-foreground">
              Tạo slide chuyên nghiệp chỉ trong vài phút với giao diện thân thiện và trực quan
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:border-accent/30 transition-all hover:shadow-lg hover:shadow-accent/10 duration-300">
            <div className="p-2 w-fit mb-4 bg-accent/10 rounded-lg">
              <Palette className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Đẹp Mắt</h3>
            <p className="text-sm text-muted-foreground">
              Hàng trăm template được thiết kế chuyên nghiệp sẵn sàng, tuỳ chỉnh hoàn toàn
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:border-secondary/30 transition-all hover:shadow-lg hover:shadow-secondary/10 duration-300">
            <div className="p-2 w-fit mb-4 bg-secondary/10 rounded-lg">
              <Layers className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Linh Hoạt</h3>
            <p className="text-sm text-muted-foreground">
              Công cụ mạnh mẽ cho phép bạn kiểm soát từng chi tiết của design
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10 duration-300">
            <div className="p-2 w-fit mb-4 bg-primary/10 rounded-lg">
              <Share2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Chia Sẻ Dễ Dàng</h3>
            <p className="text-sm text-muted-foreground">
              Xuất slide dưới nhiều định dạng và chia sẻ với bạn bè, đồng nghiệp ngay lập tức
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Được sử dụng bởi hàng ngàn người sáng tạo trên toàn thế giới
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="px-4 py-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full hover:border-primary/30 transition-colors">
              <span className="text-xs font-semibold text-foreground">Miễn Phí</span>
            </div>
            <div className="px-4 py-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full hover:border-primary/30 transition-colors">
              <span className="text-xs font-semibold text-foreground">Không Cần Tải</span>
            </div>
            <div className="px-4 py-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full hover:border-primary/30 transition-colors">
              <span className="text-xs font-semibold text-foreground">Online 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
