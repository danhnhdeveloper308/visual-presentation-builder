/** Nhãn + màu hiển thị cho 14 category template (REQUIREMENTS.md mục II). */
export const CATEGORY_LABELS: Record<string, string> = {
  business: "Kinh doanh",
  startup: "Startup",
  education: "Giáo dục",
  portfolio: "Portfolio",
  product: "Sản phẩm",
  marketing: "Marketing",
  "pitch-deck": "Pitch Deck",
  medical: "Y tế",
  timeline: "Dòng thời gian",
  finance: "Tài chính",
  resume: "Resume/CV",
  technology: "Công nghệ",
  creative: "Sáng tạo",
  minimal: "Tối giản",
};

export const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  business: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  startup: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  education: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
  portfolio: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
  product: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  marketing: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
  "pitch-deck": { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
  medical: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
  timeline: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  finance: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  resume: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700" },
  technology: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700" },
  creative: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  minimal: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
};

export const DEFAULT_CATEGORY_COLOR = { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" };
