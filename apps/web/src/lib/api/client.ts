/**
 * Custom fetch wrapper — tầng gọi API duy nhất của FE (KHÔNG dùng axios,
 * KHÔNG fetch trực tiếp trong component). Xem docs/FRONTEND.md mục 2.
 *
 * Tối ưu:
 * - Cookie auth: luôn `credentials: 'include'`.
 * - Lỗi chuẩn hoá về `ApiError { status, message, details }`.
 * - Timeout mặc định 30s qua AbortSignal, caller có thể truyền signal riêng.
 * - 401 → tự refresh token MỘT LẦN rồi retry request gốc; nhiều request 401
 *   cùng lúc chỉ tạo MỘT refresh call (single-flight, dedupe).
 * - Refresh fail → gọi onUnauthorized (đá về /login), không retry vòng lặp.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const REFRESH_PATH = "/auth/refresh";
/** Các path không được auto-refresh khi 401 (tránh vòng lặp). */
const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  REFRESH_PATH,
];

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** App gọi 1 lần (ở providers) để đăng ký hành vi khi session hết hạn hẳn. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler;
}

/** Single-flight: nhiều request 401 đồng thời chia sẻ chung 1 promise refresh. */
let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  refreshPromise ??= (async () => {
    try {
      const res = await fetch(`${BASE_URL}${REFRESH_PATH}`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Timeout ms, mặc định 30_000. Truyền 0 để tắt. */
  timeoutMs?: number;
};

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toError(status: number, body: unknown): ApiError {
  if (typeof body === "object" && body !== null && "message" in body) {
    const msg = (body as { message: string | string[] }).message;
    return new ApiError(status, Array.isArray(msg) ? msg.join(", ") : String(msg), body);
  }
  return new ApiError(status, `Request failed with status ${status}`, body);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, timeoutMs = 30_000, headers, signal, ...rest } = options;

  const signals: AbortSignal[] = [];
  if (signal) signals.push(signal);
  if (timeoutMs > 0) signals.push(AbortSignal.timeout(timeoutMs));

  const doFetch = () =>
    fetch(`${BASE_URL}${path}`, {
      ...rest,
      credentials: "include",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: signals.length > 0 ? AbortSignal.any(signals) : undefined,
    });

  let res = await doFetch();

  // Route auth (login/register/refresh): 401 là lỗi NGHIỆP VỤ (sai mật khẩu, bị khóa...)
  // → ném ApiError cho form hiển thị inline, KHÔNG refresh + KHÔNG gọi onUnauthorized
  // (trước đây onUnauthorized đá về /login làm trang reload, user không thấy lỗi gì).
  const isAuthPath = NO_REFRESH_PATHS.some((p) => path.startsWith(p));

  // Auto-refresh đúng 1 lần khi 401 (trừ các route auth)
  if (res.status === 401 && !isAuthPath) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await doFetch();
    } else {
      onUnauthorized?.();
      throw toError(res.status, await parseBody(res));
    }
  }

  if (!res.ok) {
    if (res.status === 401 && !isAuthPath) onUnauthorized?.();
    throw toError(res.status, await parseBody(res));
  }

  return (await parseBody(res)) as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
