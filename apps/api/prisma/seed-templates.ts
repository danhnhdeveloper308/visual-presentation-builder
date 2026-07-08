import { randomUUID } from 'node:crypto';
import {
  presentationSchema,
  type Presentation,
  type Slide,
  type SlideElement,
} from '@repo/shared';

/** Helpers dựng element gọn — zIndex gán theo thứ tự khai báo. */

type TextOpts = {
  size?: number;
  weight?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
};

function text(
  x: number,
  y: number,
  w: number,
  h: number,
  content: string,
  opts: TextOpts = {},
): SlideElement {
  return {
    id: randomUUID(),
    type: 'text',
    position: { x, y },
    size: { width: w, height: h },
    rotation: 0,
    zIndex: 0,
    props: {
      content,
      fontFamily: 'Inter, sans-serif',
      fontSize: opts.size ?? 28,
      fontWeight: opts.weight ?? 400,
      color: opts.color ?? '#111827',
      align: opts.align ?? 'left',
      lineHeight: opts.lineHeight ?? 1.35,
    },
  };
}

function rect(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  borderRadius = 0,
): SlideElement {
  return {
    id: randomUUID(),
    type: 'shape',
    position: { x, y },
    size: { width: w, height: h },
    rotation: 0,
    zIndex: 0,
    props: { shape: 'rect', fill, borderRadius },
  };
}

function ellipse(x: number, y: number, w: number, h: number, fill: string): SlideElement {
  return {
    id: randomUUID(),
    type: 'shape',
    position: { x, y },
    size: { width: w, height: h },
    rotation: 0,
    zIndex: 0,
    props: { shape: 'ellipse', fill },
  };
}

function icon(x: number, y: number, size: number, name: string, color: string): SlideElement {
  return {
    id: randomUUID(),
    type: 'icon',
    position: { x, y },
    size: { width: size, height: size },
    rotation: 0,
    zIndex: 0,
    props: { name, color },
  };
}

function slide(
  background: string | { gradient: string },
  elements: SlideElement[],
): Slide {
  return {
    id: randomUUID(),
    background:
      typeof background === 'string'
        ? { type: 'color', value: background }
        : { type: 'gradient', value: background.gradient },
    elements: elements.map((el, i) => ({ ...el, zIndex: i + 1 })),
  };
}

function presentation(slides: Slide[]): Presentation {
  const content: Presentation = { schemaVersion: 1, themeId: null, slides };
  return presentationSchema.parse(content); // fail-fast nếu template sai schema
}

export type SeedTemplate = {
  title: string;
  category: 'business' | 'education' | 'creative' | 'minimal';
  content: Presentation;
};

const INDIGO = '#6366f1';
const DARK = '#0f172a';

export const SEED_TEMPLATES: SeedTemplate[] = [
  {
    title: 'Pitch Deck tối giản',
    category: 'business',
    content: presentation([
      slide(DARK, [
        rect(80, 340, 120, 6, INDIGO, 3),
        text(80, 280, 900, 90, 'Tên sản phẩm của bạn', { size: 64, weight: 800, color: '#ffffff' }),
        text(80, 380, 700, 50, 'Một câu tagline ngắn gọn, đáng nhớ.', {
          size: 26,
          color: '#94a3b8',
        }),
        icon(1120, 80, 56, 'rocket', INDIGO),
      ]),
      slide(DARK, [
        text(80, 70, 500, 60, 'Vấn đề', { size: 44, weight: 700, color: '#ffffff' }),
        rect(80, 140, 64, 5, INDIGO, 2),
        text(80, 220, 1120, 60, '1.  Mô tả vấn đề thứ nhất người dùng đang gặp.', {
          size: 26,
          color: '#e2e8f0',
        }),
        text(80, 310, 1120, 60, '2.  Vấn đề thứ hai — hiện trạng và chi phí.', {
          size: 26,
          color: '#e2e8f0',
        }),
        text(80, 400, 1120, 60, '3.  Vì sao các giải pháp hiện tại chưa đủ tốt.', {
          size: 26,
          color: '#e2e8f0',
        }),
        icon(1140, 70, 48, 'target', INDIGO),
      ]),
      slide(DARK, [
        text(80, 70, 600, 60, 'Con số nói lên tất cả', { size: 44, weight: 700, color: '#ffffff' }),
        rect(80, 140, 64, 5, INDIGO, 2),
        text(100, 280, 320, 80, '10x', { size: 64, weight: 800, color: INDIGO, align: 'center' }),
        text(100, 380, 320, 60, 'Tăng trưởng năm', { size: 22, color: '#94a3b8', align: 'center' }),
        text(480, 280, 320, 80, '5K+', { size: 64, weight: 800, color: INDIGO, align: 'center' }),
        text(480, 380, 320, 60, 'Người dùng', { size: 22, color: '#94a3b8', align: 'center' }),
        text(860, 280, 320, 80, '98%', { size: 64, weight: 800, color: INDIGO, align: 'center' }),
        text(860, 380, 320, 60, 'Hài lòng', { size: 22, color: '#94a3b8', align: 'center' }),
      ]),
    ]),
  },
  {
    title: 'Báo cáo kinh doanh',
    category: 'business',
    content: presentation([
      slide('#ffffff', [
        rect(0, 0, 24, 720, INDIGO),
        text(100, 260, 900, 90, 'Báo cáo quý', { size: 60, weight: 800, color: '#0f172a' }),
        text(100, 360, 700, 50, 'Tổng kết kết quả kinh doanh Q1/2026', {
          size: 24,
          color: '#64748b',
        }),
        text(100, 620, 500, 40, 'Người trình bày — Phòng ban', { size: 18, color: '#94a3b8' }),
      ]),
      slide('#ffffff', [
        text(80, 60, 600, 60, 'Chỉ số chính', { size: 40, weight: 700, color: '#0f172a' }),
        rect(80, 170, 260, 180, '#eef2ff', 16),
        text(110, 200, 200, 70, '2.4 tỷ', { size: 40, weight: 800, color: INDIGO }),
        text(110, 280, 200, 40, 'Doanh thu', { size: 20, color: '#64748b' }),
        rect(380, 170, 260, 180, '#ecfdf5', 16),
        text(410, 200, 200, 70, '+18%', { size: 40, weight: 800, color: '#059669' }),
        text(410, 280, 200, 40, 'Tăng trưởng', { size: 20, color: '#64748b' }),
        rect(680, 170, 260, 180, '#fff7ed', 16),
        text(710, 200, 200, 70, '312', { size: 40, weight: 800, color: '#ea580c' }),
        text(710, 280, 200, 40, 'Khách hàng mới', { size: 20, color: '#64748b' }),
        rect(980, 170, 220, 180, '#fef2f2', 16),
        text(1010, 200, 160, 70, '1.2%', { size: 40, weight: 800, color: '#dc2626' }),
        text(1010, 280, 160, 40, 'Churn', { size: 20, color: '#64748b' }),
        text(80, 420, 1120, 200, 'Ghi chú: điền phân tích chi tiết của bạn ở đây...', {
          size: 22,
          color: '#475569',
        }),
      ]),
    ]),
  },
  {
    title: 'Bài giảng sinh động',
    category: 'education',
    content: presentation([
      slide('#f0f9ff', [
        ellipse(-120, -120, 400, 400, '#bae6fd'),
        ellipse(1040, 480, 380, 380, '#e0f2fe'),
        text(240, 260, 800, 90, 'Tên bài giảng', {
          size: 60,
          weight: 800,
          color: '#0c4a6e',
          align: 'center',
        }),
        text(340, 370, 600, 50, 'Môn học — Lớp — Giáo viên', {
          size: 24,
          color: '#0369a1',
          align: 'center',
        }),
        icon(608, 150, 64, 'lightbulb', '#0284c7'),
      ]),
      slide('#ffffff', [
        text(80, 60, 700, 60, 'Mục tiêu bài học', { size: 40, weight: 700, color: '#0c4a6e' }),
        icon(90, 180, 32, 'check', '#0284c7'),
        text(150, 178, 1000, 50, 'Hiểu được khái niệm chính của bài.', { size: 24 }),
        icon(90, 260, 32, 'check', '#0284c7'),
        text(150, 258, 1000, 50, 'Vận dụng vào bài tập thực hành.', { size: 24 }),
        icon(90, 340, 32, 'check', '#0284c7'),
        text(150, 338, 1000, 50, 'Liên hệ với kiến thức đã học.', { size: 24 }),
      ]),
    ]),
  },
  {
    title: 'Gradient sáng tạo',
    category: 'creative',
    content: presentation([
      slide({ gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }, [
        text(140, 270, 1000, 100, 'Ý tưởng lớn của bạn', {
          size: 68,
          weight: 800,
          color: '#ffffff',
          align: 'center',
        }),
        text(340, 390, 600, 50, 'Phụ đề mô tả ngắn cho ý tưởng', {
          size: 24,
          color: 'rgba(255,255,255,0.85)',
          align: 'center',
        }),
        icon(608, 150, 64, 'sparkles', '#ffffff'),
      ]),
      slide({ gradient: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' }, [
        text(190, 280, 900, 160, '“Trích dẫn truyền cảm hứng của bạn đặt ở đây.”', {
          size: 40,
          weight: 600,
          color: '#ffffff',
          align: 'center',
          lineHeight: 1.5,
        }),
        text(490, 470, 300, 40, '— Tác giả', {
          size: 22,
          color: 'rgba(255,255,255,0.8)',
          align: 'center',
        }),
      ]),
    ]),
  },
  {
    title: 'Trắng tối giản',
    category: 'minimal',
    content: presentation([
      slide('#ffffff', [
        ellipse(80, 80, 20, 20, '#111827'),
        text(80, 430, 1000, 100, 'Tiêu đề tối giản.', { size: 72, weight: 800, color: '#111827' }),
        text(80, 550, 700, 50, 'Ngày — Sự kiện — Người trình bày', {
          size: 22,
          color: '#9ca3af',
        }),
      ]),
      slide('#ffffff', [
        text(80, 80, 500, 200, 'Hai cột nội dung', { size: 44, weight: 700, color: '#111827' }),
        rect(620, 90, 2, 540, '#e5e7eb'),
        text(700, 90, 500, 500,
          'Cột phải để nội dung chi tiết. Giữ chữ ít, khoảng trắng nhiều — đó là tinh thần tối giản.',
          { size: 24, color: '#4b5563', lineHeight: 1.6 },
        ),
      ]),
    ]),
  },
  {
    title: 'Neon Dark',
    category: 'creative',
    content: presentation([
      slide('#09090b', [
        rect(80, 400, 200, 8, '#22d3ee', 4),
        text(80, 280, 1100, 110, 'DARK MODE ENERGY', { size: 66, weight: 800, color: '#f4f4f5' }),
        text(80, 430, 800, 50, 'Template cho những buổi demo chất.', {
          size: 24,
          color: '#a1a1aa',
        }),
        icon(1120, 90, 56, 'zap', '#22d3ee'),
      ]),
      slide('#09090b', [
        text(80, 70, 600, 60, 'Ba điểm nổi bật', { size: 42, weight: 700, color: '#f4f4f5' }),
        icon(140, 220, 56, 'zap', '#22d3ee'),
        text(80, 310, 180 + 120, 50, 'Nhanh', { size: 26, weight: 600, color: '#e4e4e7', align: 'center' }),
        icon(590, 220, 56, 'star', '#a78bfa'),
        text(530, 310, 300, 50, 'Đẹp', { size: 26, weight: 600, color: '#e4e4e7', align: 'center' }),
        icon(1040, 220, 56, 'heart', '#fb7185'),
        text(980, 310, 300, 50, 'Dễ dùng', { size: 26, weight: 600, color: '#e4e4e7', align: 'center' }),
      ]),
    ]),
  },
  {
    title: 'Kế hoạch dự án',
    category: 'business',
    content: presentation([
      slide('#ffffff', [
        rect(80, 90, 56, 56, INDIGO, 14),
        icon(92, 102, 32, 'target', '#ffffff'),
        text(80, 290, 1000, 90, 'Kế hoạch dự án Q3', { size: 58, weight: 800, color: '#0f172a' }),
        text(80, 390, 800, 50, 'Phạm vi — Timeline — Nguồn lực', { size: 24, color: '#64748b' }),
      ]),
      slide('#ffffff', [
        text(80, 60, 600, 60, 'Lộ trình 3 giai đoạn', { size: 40, weight: 700, color: '#0f172a' }),
        rect(80, 200, 1120, 4, '#e2e8f0', 2),
        ellipse(120, 186, 32, 32, INDIGO),
        text(60, 250, 220, 50, 'Tháng 7 — Khởi động', { size: 20, weight: 600, align: 'center' }),
        ellipse(624, 186, 32, 32, INDIGO),
        text(560, 250, 220, 50, 'Tháng 8 — Triển khai', { size: 20, weight: 600, align: 'center' }),
        ellipse(1128, 186, 32, 32, INDIGO),
        text(1040, 250, 220, 50, 'Tháng 9 — Ra mắt', { size: 20, weight: 600, align: 'center' }),
        text(80, 400, 1120, 150, 'Chi tiết từng giai đoạn điền ở đây...', {
          size: 22,
          color: '#475569',
        }),
      ]),
    ]),
  },
  {
    title: 'Giới thiệu công ty',
    category: 'business',
    content: presentation([
      slide('#0f172a', [
        ellipse(1000, -100, 500, 500, '#1e293b'),
        text(80, 290, 800, 90, 'Tên công ty', { size: 62, weight: 800, color: '#ffffff' }),
        text(80, 390, 700, 50, 'Sứ mệnh của chúng tôi trong một câu.', {
          size: 24,
          color: '#94a3b8',
        }),
        icon(1080, 120, 56, 'globe', INDIGO),
      ]),
      slide('#0f172a', [
        text(80, 70, 600, 60, 'Đội ngũ & Giá trị', { size: 42, weight: 700, color: '#ffffff' }),
        icon(120, 220, 48, 'users', INDIGO),
        text(80, 300, 280, 90, 'Con người là trung tâm', {
          size: 22,
          color: '#e2e8f0',
          align: 'center',
        }),
        icon(600, 220, 48, 'trophy', INDIGO),
        text(560, 300, 280, 90, 'Chất lượng hàng đầu', {
          size: 22,
          color: '#e2e8f0',
          align: 'center',
        }),
        icon(1080, 220, 48, 'heart', INDIGO),
        text(1040, 300, 280, 90, 'Tận tâm với khách hàng', {
          size: 22,
          color: '#e2e8f0',
          align: 'center',
        }),
      ]),
    ]),
  },
  {
    title: 'OKR & Mục tiêu',
    category: 'business',
    content: presentation([
      slide('#fafafa', [
        text(80, 280, 1000, 90, 'OKR Quý này', { size: 60, weight: 800, color: '#18181b' }),
        rect(80, 390, 100, 6, '#16a34a', 3),
        text(80, 420, 700, 50, 'Objectives & Key Results', { size: 24, color: '#71717a' }),
      ]),
      slide('#fafafa', [
        text(80, 60, 900, 60, 'Objective 1: Viết mục tiêu ở đây', {
          size: 36,
          weight: 700,
          color: '#18181b',
        }),
        rect(80, 160, 1120, 100, '#ffffff', 12),
        text(110, 190, 60, 40, 'KR1', { size: 22, weight: 800, color: '#16a34a' }),
        text(200, 190, 960, 40, 'Kết quả then chốt thứ nhất — đo được bằng con số.', { size: 22 }),
        rect(80, 290, 1120, 100, '#ffffff', 12),
        text(110, 320, 60, 40, 'KR2', { size: 22, weight: 800, color: '#16a34a' }),
        text(200, 320, 960, 40, 'Kết quả then chốt thứ hai.', { size: 22 }),
        rect(80, 420, 1120, 100, '#ffffff', 12),
        text(110, 450, 60, 40, 'KR3', { size: 22, weight: 800, color: '#16a34a' }),
        text(200, 450, 960, 40, 'Kết quả then chốt thứ ba.', { size: 22 }),
      ]),
    ]),
  },
  {
    title: 'Ôn tập trắc nghiệm',
    category: 'education',
    content: presentation([
      slide('#fefce8', [
        icon(608, 140, 64, 'lightbulb', '#ca8a04'),
        text(240, 260, 800, 90, 'Câu hỏi ôn tập', {
          size: 58,
          weight: 800,
          color: '#713f12',
          align: 'center',
        }),
        text(340, 370, 600, 50, 'Chủ đề — Số câu — Thời gian', {
          size: 24,
          color: '#a16207',
          align: 'center',
        }),
      ]),
      slide('#fefce8', [
        text(80, 70, 1120, 100, 'Câu 1: Nội dung câu hỏi viết ở đây?', {
          size: 34,
          weight: 700,
          color: '#713f12',
        }),
        rect(80, 220, 540, 80, '#ffffff', 12),
        text(110, 245, 480, 40, 'A. Phương án thứ nhất', { size: 22 }),
        rect(660, 220, 540, 80, '#ffffff', 12),
        text(690, 245, 480, 40, 'B. Phương án thứ hai', { size: 22 }),
        rect(80, 330, 540, 80, '#ffffff', 12),
        text(110, 355, 480, 40, 'C. Phương án thứ ba', { size: 22 }),
        rect(660, 330, 540, 80, '#ffffff', 12),
        text(690, 355, 480, 40, 'D. Phương án thứ tư', { size: 22 }),
      ]),
    ]),
  },
  {
    title: 'Khoa học trực quan',
    category: 'education',
    content: presentation([
      slide('#f0fdf4', [
        ellipse(-80, 400, 360, 360, '#bbf7d0'),
        text(240, 270, 800, 90, 'Chủ đề khoa học', {
          size: 58,
          weight: 800,
          color: '#14532d',
          align: 'center',
        }),
        text(340, 380, 600, 50, 'Khám phá — Thí nghiệm — Kết luận', {
          size: 24,
          color: '#16a34a',
          align: 'center',
        }),
      ]),
      slide('#ffffff', [
        text(80, 60, 700, 60, 'Quy trình thí nghiệm', { size: 40, weight: 700, color: '#14532d' }),
        rect(80, 180, 340, 200, '#f0fdf4', 16),
        text(110, 210, 60, 60, '1', { size: 44, weight: 800, color: '#16a34a' }),
        text(110, 280, 280, 80, 'Chuẩn bị dụng cụ và giả thuyết', { size: 20, color: '#374151' }),
        rect(470, 180, 340, 200, '#f0fdf4', 16),
        text(500, 210, 60, 60, '2', { size: 44, weight: 800, color: '#16a34a' }),
        text(500, 280, 280, 80, 'Tiến hành và ghi chép số liệu', { size: 20, color: '#374151' }),
        rect(860, 180, 340, 200, '#f0fdf4', 16),
        text(890, 210, 60, 60, '3', { size: 44, weight: 800, color: '#16a34a' }),
        text(890, 280, 280, 80, 'Phân tích và rút ra kết luận', { size: 20, color: '#374151' }),
      ]),
    ]),
  },
  {
    title: 'Portfolio cá nhân',
    category: 'creative',
    content: presentation([
      slide({ gradient: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)' }, [
        ellipse(100, 120, 120, 120, INDIGO),
        text(100, 300, 900, 90, 'Tên của bạn', { size: 64, weight: 800, color: '#ffffff' }),
        text(100, 400, 700, 50, 'Nghề nghiệp — Thành phố — Liên hệ', {
          size: 24,
          color: '#a5b4fc',
        }),
      ]),
      slide({ gradient: 'linear-gradient(160deg, #1e1b4b 0%, #0f172a 100%)' }, [
        text(80, 70, 600, 60, 'Dự án nổi bật', { size: 42, weight: 700, color: '#ffffff' }),
        rect(80, 180, 540, 300, 'rgba(255,255,255,0.06)', 16),
        text(110, 210, 480, 50, 'Dự án A', { size: 28, weight: 700, color: '#e0e7ff' }),
        text(110, 270, 480, 150, 'Mô tả ngắn về dự án, vai trò và kết quả đạt được.', {
          size: 20,
          color: '#94a3b8',
        }),
        rect(660, 180, 540, 300, 'rgba(255,255,255,0.06)', 16),
        text(690, 210, 480, 50, 'Dự án B', { size: 28, weight: 700, color: '#e0e7ff' }),
        text(690, 270, 480, 150, 'Mô tả ngắn về dự án, vai trò và kết quả đạt được.', {
          size: 20,
          color: '#94a3b8',
        }),
      ]),
    ]),
  },
  {
    title: 'Mood board',
    category: 'creative',
    content: presentation([
      slide('#faf5ff', [
        text(80, 80, 700, 90, 'Mood board', { size: 62, weight: 800, color: '#581c87' }),
        rect(80, 240, 260, 260, '#e9d5ff', 20),
        rect(370, 240, 260, 260, '#d8b4fe', 20),
        rect(660, 240, 260, 260, '#c084fc', 20),
        rect(950, 240, 250, 260, '#a855f7', 20),
        text(80, 540, 900, 50, 'Bảng màu & cảm hứng cho dự án của bạn', {
          size: 24,
          color: '#7e22ce',
        }),
      ]),
    ]),
  },
  {
    title: 'Typography đậm',
    category: 'minimal',
    content: presentation([
      slide('#111827', [
        text(80, 180, 1120, 360, 'NÓI ÍT.\nLÀM NHIỀU.', {
          size: 110,
          weight: 800,
          color: '#f9fafb',
          lineHeight: 1.15,
        }),
        rect(80, 560, 160, 8, '#f59e0b', 4),
      ]),
      slide('#111827', [
        text(80, 260, 1120, 200, 'Một ý tưởng lớn cho mỗi slide.', {
          size: 56,
          weight: 700,
          color: '#f9fafb',
          align: 'center',
          lineHeight: 1.3,
        }),
      ]),
    ]),
  },
  {
    title: 'Timeline đơn giản',
    category: 'minimal',
    content: presentation([
      slide('#ffffff', [
        text(80, 280, 1000, 90, 'Hành trình của chúng ta', {
          size: 56,
          weight: 800,
          color: '#111827',
        }),
        text(80, 390, 700, 50, '2024 → 2026', { size: 26, color: '#9ca3af' }),
      ]),
      slide('#ffffff', [
        rect(238, 120, 4, 480, '#e5e7eb', 2),
        ellipse(226, 140, 28, 28, '#111827'),
        text(300, 132, 400, 40, '2024 — Khởi đầu', { size: 24, weight: 700, color: '#111827' }),
        text(300, 180, 800, 50, 'Mô tả cột mốc đầu tiên.', { size: 20, color: '#6b7280' }),
        ellipse(226, 320, 28, 28, '#111827'),
        text(300, 312, 400, 40, '2025 — Tăng trưởng', { size: 24, weight: 700, color: '#111827' }),
        text(300, 360, 800, 50, 'Mô tả cột mốc thứ hai.', { size: 20, color: '#6b7280' }),
        ellipse(226, 500, 28, 28, '#111827'),
        text(300, 492, 400, 40, '2026 — Bứt phá', { size: 24, weight: 700, color: '#111827' }),
        text(300, 540, 800, 50, 'Mô tả cột mốc thứ ba.', { size: 20, color: '#6b7280' }),
      ]),
    ]),
  },
];
