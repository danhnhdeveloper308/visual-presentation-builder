import Link from "next/link";
import { Presentation, Sparkles, Zap, Layers, Share2, Palette } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
              <Presentation className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:inline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Visual Builder
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Đăng nhập
            </Link>
            <Link href="/register" className={buttonVariants({ size: "sm" })}>
              Bắt đầu miễn phí
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero Section with vibrant background */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-100 min-h-dvh flex items-center">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/3 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
            <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse animation-delay-4000" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block mb-6 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
                  <span className="text-sm font-semibold text-primary">Công cụ thiết kế hàng đầu</span>
                </div>
                <h1 className="text-6xl sm:text-7xl font-bold mb-6 leading-tight">
                  Tạo slide
                  <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    tuyệt vời ngay bây giờ
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Công cụ kéo-thả toàn diện với hàng trăm template chuyên nghiệp. Không cần kỹ năng thiết kế để tạo slide ấn tượng.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
                    <Sparkles className="w-5 h-5" />
                    Tạo slide miễn phí
                  </Link>
                  <button className="px-8 py-3 border-2 border-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Xem demo
                  </button>
                </div>
                <div className="mt-8 flex gap-8">
                  <div>
                    <div className="text-3xl font-bold text-primary">10K+</div>
                    <div className="text-sm text-gray-600">Người dùng hoạt động</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-secondary">500+</div>
                    <div className="text-sm text-gray-600">Template sẵn có</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-accent">4.9⭐</div>
                    <div className="text-sm text-gray-600">Đánh giá trung bình</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border border-primary/20">
                  <div className="bg-white rounded-xl p-6 shadow-2xl">
                    <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                      <Presentation className="w-24 h-24 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4">Tính năng mạnh mẽ</h2>
              <p className="text-xl text-gray-600">Tất cả những gì bạn cần để tạo slide chuyên nghiệp</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Zap, title: "Nhanh Chóng", desc: "Tạo slide trong vài phút" },
                { icon: Palette, title: "Đẹp Mắt", desc: "Template thiết kế chuyên nghiệp" },
                { icon: Layers, title: "Linh Hoạt", desc: "Tùy chỉnh từng chi tiết" },
                { icon: Share2, title: "Chia Sẻ", desc: "Xuất & chia sẻ dễ dàng" },
              ].map((feature, i) => (
                <div key={i} className="p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-xl transition-all duration-300 group">
                  <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary via-secondary to-accent">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-white mb-6">Sẵn sàng bắt đầu?</h2>
            <p className="text-xl text-white/90 mb-8">Tạo slide chuyên nghiệp hoàn toàn miễn phí. Không cần thẻ tín dụng.</p>
            <Link href="/register" className="inline-block px-8 py-4 bg-white text-primary font-bold rounded-lg hover:shadow-2xl transition-all">
              Bắt đầu ngay bây giờ
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                  <Presentation className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">Visual Builder</span>
              </div>
              <p className="text-gray-400">Công cụ thiết kế slide hiện đại</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Tính năng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bảng giá</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Template</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Công ty</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Pháp lý</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white transition-colors">Điều khoản</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Riêng tư</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Visual Presentation Builder. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
