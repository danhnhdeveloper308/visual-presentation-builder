import Link from "next/link";
import { Presentation } from "lucide-react";

export const metadata = {
  title: "Chính sách bảo mật",
};

export default function PrivacyPage() {
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
          <h1 className="text-5xl font-bold mb-8">Chính sách bảo mật</h1>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Giới thiệu</h2>
              <p>
                Visual Presentation Builder chúng tôi cam kết bảo vệ quyền riêng tư của bạn.
                Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, tiết lộ và bảo vệ thông tin của bạn.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Thông tin chúng tôi thu thập</h2>
              <p>Chúng tôi có thể thu thập các loại thông tin sau:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Thông tin cá nhân:</strong> Tên, email, mật khẩu, hồ sơ người dùng</li>
                <li><strong>Dữ liệu sử dụng:</strong> Cách bạn sử dụng Dịch vụ, tính năng bạn truy cập, nội dung bạn tạo</li>
                <li><strong>Thông tin thiết bị:</strong> Loại trình duyệt, địa chỉ IP, hệ điều hành</li>
                <li><strong>Cookie và dữ liệu tương tự:</strong> Các bộ nhớ cache nhỏ lưu trữ trên thiết bị của bạn</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Cách chúng tôi sử dụng thông tin của bạn</h2>
              <p>Chúng tôi sử dụng thông tin bạn cung cấp để:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cung cấp, bảo trì và cải thiện Dịch vụ</li>
                <li>Tạo và quản lý tài khoản của bạn</li>
                <li>Gửi thông báo quan trọng và cập nhật</li>
                <li>Phản hồi các yêu cầu và câu hỏi của bạn</li>
                <li>Phân tích xu hướng sử dụng để cải thiện Dịch vụ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Chia sẻ thông tin của bạn</h2>
              <p>
                Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba cho mục đích tiếp thị.
                Tuy nhiên, chúng tôi có thể chia sẻ thông tin:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Với các nhà cung cấp dịch vụ giúp chúng tôi vận hành Dịch vụ</li>
                <li>Khi được yêu cầu bởi luật pháp hoặc lệnh của tòa án</li>
                <li>Để bảo vệ quyền, quyền riêng tư, an toàn của chúng tôi hoặc người khác</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Bảo mật dữ liệu</h2>
              <p>
                Chúng tôi triển khai các biện pháp bảo mật thích hợp để bảo vệ thông tin cá nhân của bạn khỏi truy cập, 
                thay đổi, tiết lộ hoặc phá hủy trái phép. Điều này bao gồm mã hóa SSL/TLS và các tường lửa an toàn.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Quyền của bạn</h2>
              <p>
                Bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình.
                Bạn cũng có thể rút lại sự đồng ý cho các hoạt động xử lý dữ liệu cụ thể.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Cookie</h2>
              <p>
                Chúng tôi sử dụng cookie để cải thiện trải nghiệm của bạn. Bạn có thể tắt cookie trong cài đặt trình duyệt,
                nhưng một số tính năng của Dịch vụ có thể không hoạt động bình thường.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Liên hệ</h2>
              <p>
                Nếu bạn có bất kỳ câu hỏi nào về Chính sách bảo mật này, vui lòng liên hệ với chúng tôi tại:
                <br />
                Email: privacy@visualbuilder.com
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
