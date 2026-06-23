'use client';

import { useState, useEffect, useCallback } from 'react';

interface CafeGalleryProps {
  images: string[];
  name: string;
}

/**
 * Lưới ảnh của trang chi tiết quán. Nhấp vào bất kỳ ảnh nào sẽ mở lightbox xem
 * ảnh ở tỉ lệ gốc (object-contain) với điều hướng trước/sau.
 */
export default function CafeGallery({ images, name }: CafeGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length]
  );
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length]
  );

  // Phím tắt: Esc đóng, mũi tên trái/phải chuyển ảnh.
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, close, next, prev]);

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-72 md:h-[480px] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="md:col-span-2 md:row-span-2 relative group overflow-hidden cursor-zoom-in"
        >
          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={images[0]}
            alt={name}
          />
        </button>
        {images.slice(1, 5).map((img, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setOpenIndex(i + 1)}
            className="hidden md:block relative group overflow-hidden cursor-zoom-in"
          >
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={img}
              alt={`${name} ${i + 2}`}
            />
          </button>
        ))}
      </section>

      {/* Lightbox */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-8"
          onClick={close}
        >
          {/* Nút đóng */}
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Ảnh ở tỉ lệ gốc */}
          <img
            src={images[openIndex]}
            alt={`${name} ${openIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg select-none"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Điều hướng (chỉ hiện khi có nhiều hơn 1 ảnh) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Ảnh trước"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Ảnh sau"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium">
                {openIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
