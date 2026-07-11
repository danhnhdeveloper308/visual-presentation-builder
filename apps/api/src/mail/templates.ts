/** Nội dung email — tách riêng để dễ chỉnh, giữ MailService thuần vận chuyển. */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildResetPasswordEmail(
  name: string,
  resetUrl: string,
): { subject: string; html: string; text: string } {
  const safeName = escapeHtml(name);
  const subject = 'Đặt lại mật khẩu — Visual Builder';

  const html = `<!doctype html>
<html lang="vi">
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#6d5cff,#e0448a);padding:28px 32px;">
          <span style="color:#ffffff;font-size:20px;font-weight:700;">Visual Builder</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Đặt lại mật khẩu</h1>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">
            Xin chào ${safeName},<br/>
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn nút bên dưới để tạo mật khẩu mới. Liên kết có hiệu lực trong <strong>1 giờ</strong>.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="border-radius:10px;background:linear-gradient(135deg,#6d5cff,#e0448a);">
              <a href="${resetUrl}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Đặt lại mật khẩu</a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">Hoặc mở liên kết sau:</p>
          <p style="margin:0 0 20px;font-size:12px;word-break:break-all;"><a href="${resetUrl}" style="color:#6d5cff;">${resetUrl}</a></p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">
            Nếu bạn không yêu cầu điều này, hãy bỏ qua email — mật khẩu của bạn không thay đổi.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #eef2f7;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">© Visual Presentation Builder</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Xin chào ${name},

Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
Mở liên kết sau để tạo mật khẩu mới (hiệu lực 1 giờ):

${resetUrl}

Nếu bạn không yêu cầu, hãy bỏ qua email này.

— Visual Builder`;

  return { subject, html, text };
}
