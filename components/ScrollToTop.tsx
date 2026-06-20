'use client';

import { useState, useEffect } from 'react';

/**
 * Nút "lên đầu trang": hiện khi cuộn xuống > 400px, bấm để cuộn mượt về đầu.
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    // Cập nhật trạng thái ban đầu sau khi paint (tránh setState đồng bộ trong effect).
    const id = requestAnimationFrame(onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Lên đầu trang"
      title="Lên đầu trang"
      className={`fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container shadow-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <span className="material-symbols-outlined">arrow_upward</span>
    </button>
  );
}
