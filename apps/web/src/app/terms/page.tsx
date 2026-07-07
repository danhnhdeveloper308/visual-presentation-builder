import Link from "next/link";
import { Presentation } from "lucide-react";

export const metadata = {
  title: "Điều khoản sử dụng",
};

export default function TermsPage() {
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
          <h1 className="text-5xl font-bold mb-8">Điều khoản sử dụng</h1>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Chấp nhận Điều khoản</h2>
              <p>
                Bằng cách truy cập và sử dụng Visual Presentation Builder ("Dịch vụ"), bạn đồng ý bị ràng buộc bởi các Điều khoản sử dụng này.
                Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng ngừng sử dụng Dịch vụ.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Quyền và Trách vụ người dùng</h2>
              <p>
                Bạn đồng ý sử dụng Dịch vụ chỉ cho các mục đích hợp pháp và theo cách không vi phạm các quyền của người khác
                hoặc hạn chế quyền truy cập của bất kỳ người nào vào Dịch vụ.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Không sử dụng Dịch vụ để phát tán thông tin sai lệch hoặc gây hại</li>
                <li>Không cố gắng hack, xâm nhập hoặc phá vỡ bảo mật của Dịch vụ</li>
                <li>Không tải lên nội dung không hợp pháp hoặc có hại</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Nội dung do người dùng tạo</h2>
              <p>
                Bạn giữ lại toàn bộ quyền sở hữu trí tuệ đối với bất kỳ nội dung nào bạn tạo bằng cách sử dụng Dịch vụ.
                Tuy nhiên, bạn cấp cho chúng tôi giấy phép để sử dụng, sao chép và hiển thị nội dung của bạn để cung cấp Dịch vụ.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Từ chối trách nhiệm</h2>
              <p>
                Dịch vụ được cung cấp trên cơ sở "NGUYÊN TRẠNG". Chúng tôi từ chối bất kỳ bảo đảm, rõ ràng hoặc ngụ ý,
                bao gồm nhưng không giới hạn các bảo đảm về khả năng bán hàng, suitability cho một mục đích cụ thể.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Giới hạn trách nhiệm</h2>
              <p>
                Trong bất kỳ trường hợp nào, Visual Builder không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp, 
                trực tiếp, đặc biệt hoặc phí do sử dụng hoặc không thể sử dụng Dịch vụ.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Thay đổi Dịch vụ</h2>
              <p>
                Chúng tôi có quyền sửa đổi hoặc ngừng Dịch vụ bất cứ lúc nào mà không cần thông báo trước.
                Chúng tôi sẽ cố gắng thông báo cho bạn về bất kỳ thay đổi lớn nào.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Liên hệ</h2>
              <p>
                Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng này, vui lòng liên hệ với chúng tôi tại:
                <br />
                Email: support@visualbuilder.com
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
