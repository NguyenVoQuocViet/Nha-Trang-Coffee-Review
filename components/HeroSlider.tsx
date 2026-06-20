'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface Slide {
  image: string;
  fallback?: string;
  tag: string;
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
  accent: string;
}

const SLIDES: Slide[] = [
  {
    image: '/slides/slide1.png',
    fallback:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600&h=900&fit=crop&auto=format&q=80',
    tag: 'Trải nghiệm độc đáo',
    title: 'Cà phê bên làn gió biển',
    subtitle:
      'Khám phá những quán cà phê đặc sản tốt nhất dọc bờ biển Nha Trang — nơi hương cà phê hoà vào tiếng sóng.',
    cta: { label: 'Khám phá ngay', href: '#cafes' },
    accent: 'from-[#2a1c0e]/85 via-[#2a1c0e]/45',
  },
  {
    image: '/slides/slide2.png',
    fallback:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&h=900&fit=crop&auto=format&q=80',
    tag: 'Specialty Coffee',
    title: 'Hương vị đặc sản từ cao nguyên',
    subtitle:
      'Arabica Đà Lạt, Robusta Buôn Ma Thuột — rang xay tại chỗ, thưởng thức giữa lòng thành phố biển xanh.',
    cta: { label: 'Xem bảng xếp hạng', href: '/top-reviews' },
    accent: 'from-[#1a3a2a]/80 via-[#1a3a2a]/40',
  },
  {
    image: '/slides/slide3.png',
    fallback:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&h=900&fit=crop&auto=format&q=80',
    tag: 'Work Friendly',
    title: 'Góc nhỏ yên tĩnh giữa phố',
    subtitle:
      'Không gian làm việc lý tưởng với WiFi siêu nhanh, ổ cắm điện đầy đủ và cà phê rang xay thủ công.',
    cta: { label: 'Tìm work-cafe', href: '/map' },
    accent: 'from-[#1a2840]/85 via-[#1a2840]/45',
  },
  {
    image: '/slides/slide4.png',
    fallback:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&h=900&fit=crop&auto=format&q=80',
    tag: 'Beach View',
    title: 'View biển huyền ảo lúc bình minh',
    subtitle:
      'Ngồi nhâm nhi espresso, nhìn ra vịnh Nha Trang lúc mặt trời mọc — đặc quyền chỉ có ở Nha Trang Coffee Review.',
    cta: { label: 'Xem bản đồ', href: '/map' },
    accent: 'from-[#3a1a0a]/80 via-[#3a1a0a]/45',
  },
];

const AUTOPLAY_MS = 4800;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrent(index);
    setTimeout(() => setTransitioning(false), 700);
  }, [transitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length);
  }, [current, goTo]);

  const onTouchStart = (e: React.TouchEvent) => {
    setPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    setPaused(false);
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only treat as a swipe when it's mostly horizontal and far enough.
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [current, paused, next]);

  const slide = SLIDES[current];

  return (
    <div
      className="relative w-full overflow-hidden bg-[#241812] select-none touch-pan-y"
      style={{ height: 'clamp(340px, 56vw, 680px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background images — crossfade */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
            onError={(e) => {
              // Nếu ảnh cục bộ (vd /slides/slide1.png) chưa có, dùng ảnh dự phòng.
              if (s.fallback && e.currentTarget.src !== s.fallback) {
                e.currentTarget.src = s.fallback;
              }
            }}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${s.accent} to-transparent`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
      ))}

      {/* Text content — left-aligned per design skill (no centered hero at variance 7+) */}
      <div className="relative z-10 h-full flex items-end px-6 pb-14 sm:px-10 sm:pb-16 md:px-16 md:pb-20">
        <div
          key={current}
          className="w-full max-w-2xl break-words"
          style={{ animation: 'slideHeroText 0.65s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {/* Eyebrow tag */}
          <span className="inline-flex items-center px-3 py-1 mb-4 bg-white/20 backdrop-blur-sm text-white/95 text-[11px] font-bold uppercase tracking-[0.15em] rounded-full">
            {slide.tag}
          </span>

          {/* Headline */}
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-3"
            style={{ fontFamily: 'Montserrat, sans-serif', textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}
          >
            {slide.title}
          </h2>

          {/* Subtext */}
          <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-6 max-w-lg whitespace-normal break-words">
            {slide.subtitle}
          </p>

          {/* CTA */}
          <Link
            href={slide.cta.href}
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-white text-[#33210d] font-bold text-sm rounded-full hover:bg-primary-fixed transition-all duration-300 active:scale-95 shadow-lg group"
          >
            {slide.cta.label}
            <span className="w-6 h-6 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                arrow_forward
              </span>
            </span>
          </Link>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        aria-label="Ảnh trước"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 bg-black/25 hover:bg-black/45 backdrop-blur-sm text-white rounded-full hidden md:flex items-center justify-center transition-all duration-200 active:scale-90"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button
        onClick={next}
        aria-label="Ảnh tiếp theo"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 bg-black/25 hover:bg-black/45 backdrop-blur-sm text-white rounded-full hidden md:flex items-center justify-center transition-all duration-200 active:scale-90"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      {/* Progress dots */}
      <div className="absolute bottom-5 left-6 sm:left-10 md:left-16 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Chuyển đến ảnh ${i + 1}`}
            className={`rounded-full transition-all duration-400 ${
              i === current
                ? 'w-7 h-2 bg-white'
                : 'w-2 h-2 bg-white/45 hover:bg-white/70'
            }`}
            style={{ transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)' }}
          />
        ))}

        {/* Progress bar */}
        <div className="ml-3 w-16 h-[2px] bg-white/25 rounded-full overflow-hidden hidden sm:block">
          <div
            key={current}
            className="h-full bg-white rounded-full"
            style={{
              animation: `heroProgress ${AUTOPLAY_MS}ms linear both`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          />
        </div>
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-5 right-5 sm:right-10 md:right-16 z-20 text-white/60 text-xs font-mono">
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>
    </div>
  );
}
