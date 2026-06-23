'use client';

import { useEffect } from 'react';

/**
 * Error boundary cấp route (App Router). Thay cho màn hình "This page couldn't
 * load" trống trơn của Next bằng một giao diện có thể thử lại.
 *
 * - Lỗi tải chunk (thường gặp khi dev server vừa build lại hoặc mạng chập chờn)
 *   sẽ tự động tải lại trang một lần.
 * - Các lỗi khác (vd Server Action gửi quá dung lượng) hiển thị nút "Thử lại".
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
    const msg = error?.message || '';
    if (/ChunkLoadError|Loading chunk|dynamically imported module/i.test(msg)) {
      window.location.reload();
    }
  }, [error]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center gap-5">
      <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl">error</span>
      </div>
      <div className="space-y-2 max-w-md">
        <h1
          className="text-2xl font-bold text-primary"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Đã có lỗi xảy ra
        </h1>
        <p className="text-sm text-on-surface-variant">
          Không tải được nội dung. Vui lòng thử lại — nếu bạn vừa tải ảnh, hãy
          kiểm tra mỗi ảnh dưới 10MB và tối đa 5 ảnh.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
        >
          Thử lại
        </button>
        <a
          href="/"
          className="px-6 py-3 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-all"
        >
          Về trang chủ
        </a>
      </div>
      {error?.digest && (
        <p className="text-xs text-outline">Mã lỗi: {error.digest}</p>
      )}
    </main>
  );
}
