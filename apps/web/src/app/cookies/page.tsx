import Link from "next/link";
import { Presentation } from "lucide-react";

export const metadata = {
  title: "Chính sách Cookie",
};

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
              <Presentation className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:inline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Visual Builder
            </span>
          </Link>
          <Link href="/" className="text-sm font-medium text-primary hover:text-secondary transition-colors">
            Quay lại
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-8">Chính sách Cookie</h1>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Cookie là gì?</h2>
              <p>
                Cookie là những tệp nhỏ được lưu trữ trên thiết bị của bạn (máy tính, điện thoại thông minh, máy tính bảng).
                Chúng chứa thông tin nhỏ mà các trang web sử dụng để nhớ thông tin về bạn và sở thích của bạn.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Những loại cookie mà chúng tôi sử dụng</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Cookie cần thiết</h3>
                  <p>
                    Những cookie này cần thiết để hoạt động cơ bản của Dịch vụ, chẳng hạn như xác thực người dùng 
                    và quản lý phiên.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Cookie hiệu suất</h3>
                  <p>
                    Những cookie này giúp chúng tôi hiểu cách bạn sử dụng Dịch vụ để cải thiện hiệu suất và trải nghiệm người dùng.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Cookie chức năng</h3>
                  <p>
                    Những cookie này cho phép chúng tôi ghi nhớ sở thích của bạn, chẳng hạn như ngôn ngữ hoặc cài đặt hiển thị.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Cookie quảng cáo/tiếp thị</h3>
                  <p>
                    Những cookie này được sử dụng để cung cấp quảng cáo có liên quan hơn cho bạn.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Cookie của bên thứ ba</h2>
              <p>
                Chúng tôi cũng sử dụng cookie từ các dịch vụ bên thứ ba như Google Analytics để phân tích sử dụng.
                Những công ty này có thể sử dụng cookie của họ để theo dõi hoạt động trực tuyến của bạn trên các trang web khác.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Kiểm soát Cookie</h2>
              <p>
                Bạn có thể kiểm soát và xóa cookie theo cách sau:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hầu hết các trình duyệt web cho phép bạn kiểm soát cài đặt cookie thông qua cài đặt trình duyệt</li>
                <li>Bạn có thể xóa cookie đã lưu từ máy tính của mình bất kỳ lúc nào</li>
                <li>Bạn có thể tắt cookie, nhưng điều này có thể ảnh hưởng đến chức năng của Dịch vụ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Do Not Track (DNT)</h2>
              <p>
                Nếu trình duyệt của bạn hỗ trợ tính năng Do Not Track và bạn đã bật nó,
                chúng tôi sẽ tôn trọng sở thích của bạn khi có thể.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Cập nhật Chính sách</h2>
              <p>
                Chúng tôi có thể cập nhật Chính sách Cookie này theo thời gian.
                Bất kỳ thay đổi nào sẽ được đăng trên trang này với ngày cập nhật mới.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Liên hệ</h2>
              <p>
                Nếu bạn có bất kỳ câu hỏi nào về Chính sách Cookie này, vui lòng liên hệ với chúng tôi tại:
                <br />
                Email: cookies@visualbuilder.com
              </p>
            </section>
          </div>

          <div className="mt-12 p-6 bg-blue-50 border border-primary/20 rounded-lg">
            <p className="text-sm text-gray-600">
              Lần cập nhật cuối cùng: {new Date().toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
