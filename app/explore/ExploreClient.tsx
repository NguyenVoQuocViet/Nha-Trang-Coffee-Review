'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import CoffeeRating from '@/components/CoffeeRating';
import type { Cafe } from '@/lib/mockData';
import { DISTRICT_FILTERS } from '@/lib/constants';

// Khớp theo nhiều từ khóa (Việt + Anh), không phân biệt hoa thường, khớp một phần.
const CATEGORIES = [
  { label: 'View biển', match: ['view biển', 'beach', 'ocean', 'sea', 'coastal', 'biển'] },
  { label: 'Làm việc', match: ['làm việc', 'work', 'wifi', 'workspace', 'học bài'] },
  { label: 'Yên tĩnh', match: ['yên tĩnh', 'quiet', 'yên'] },
  { label: 'Sân vườn', match: ['sân vườn', 'garden', 'vườn'] },
  { label: 'Tán gẫu', match: ['tán gẫu', 'tan gau', 'chat', 'trò chuyện', 'gặp gỡ', 'hangout', 'tụ tập'] },
  { label: 'Học bài', match: ['học bài', 'study', 'studying', 'self-study'] },
  { label: 'Chơi game', match: ['chơi game', 'game', 'gaming', 'esport', 'console'] },
  { label: 'Chơi bài', match: ['chơi bài', 'cards', 'board game', 'boardgame', 'tụ tập'] },
];

const DISTRICTS = DISTRICT_FILTERS;

const SORTS = [
  { key: 'rating', label: 'Điểm cao nhất' },
  { key: 'reviews', label: 'Nhiều đánh giá' },
  { key: 'name', label: 'Tên A → Z' },
] as const;

type SortKey = (typeof SORTS)[number]['key'];

export default function ExploreClient({ cafes }: { cafes: Cafe[] }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDistrict, setActiveDistrict] = useState('Tất cả');
  const [sort, setSort] = useState<SortKey>('rating');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = cafes.filter((cafe) => {
      const matchSearch =
        !q ||
        cafe.name.toLowerCase().includes(q) ||
        cafe.address.toLowerCase().includes(q) ||
        cafe.tags.some((t) => t.toLowerCase().includes(q));
      const matchCat =
        !activeCategory ||
        (() => {
          const cat = CATEGORIES.find((c) => c.label === activeCategory);
          if (!cat) return true;
          return cafe.tags.some((t) =>
            cat.match.some((k) => t.toLowerCase().includes(k))
          );
        })();
      const matchDistrict = activeDistrict === 'Tất cả' || cafe.district === activeDistrict;
      return matchSearch && matchCat && matchDistrict;
    });

    return list.sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating || b.reviewCount - a.reviewCount;
      if (sort === 'reviews') return b.reviewCount - a.reviewCount || b.rating - a.rating;
      return a.name.localeCompare(b.name, 'vi');
    });
  }, [cafes, search, activeCategory, activeDistrict, sort]);

  const resetFilters = () => {
    setSearch('');
    setActiveCategory(null);
    setActiveDistrict('Tất cả');
  };

  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-10 flex-1">
      {/* Header */}
      <header className="mb-8">
        <p className="text-secondary font-semibold text-sm uppercase tracking-widest mb-2">
          Khám phá
        </p>
        <h1
          className="text-3xl md:text-4xl font-bold text-primary"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Khám phá quán cà phê Nha Trang
        </h1>
        <p className="text-on-surface-variant text-sm mt-3 w-full max-w-2xl whitespace-normal break-words">
          Duyệt toàn bộ những quán cà phê đặc sản tại Nha Trang — lọc theo phong cách, khu vực và mức độ được yêu thích.
        </p>
      </header>

      {/* Search */}
      <div className="relative mb-6 w-full max-w-2xl">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
          search
        </span>
        <input
          className="w-full pl-12 pr-10 py-3 bg-surface-container-lowest border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline/60 text-sm shadow-sm"
          placeholder="Tìm kiếm quán, phong cách, khu vực..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Xóa tìm kiếm"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              close
            </span>
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-nowrap gap-2 mb-4 overflow-x-auto hide-scrollbar whitespace-nowrap pb-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
            activeCategory === null
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Tất cả phong cách
        </button>
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.label;
          return (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(active ? null : cat.label)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                active
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* District chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
        {DISTRICTS.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDistrict(d)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 ${
              activeDistrict === d
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Result bar + sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <span className="text-sm text-on-surface-variant shrink-0">
          Tìm thấy <span className="font-bold text-primary">{filtered.length}</span> quán
        </span>
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
          <span className="text-xs text-on-surface-variant hidden sm:inline shrink-0">Sắp xếp:</span>
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                sort === s.key
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-4 block text-outline-variant">
            search_off
          </span>
          <p className="font-semibold text-base">Không tìm thấy quán phù hợp</p>
          <button
            onClick={resetFilters}
            className="mt-5 px-5 py-2 border border-primary text-primary rounded-full text-sm font-semibold hover:bg-primary-fixed transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cafe, i) => (
            <ExploreCard key={cafe.id} cafe={cafe} animDelay={i * 50} />
          ))}
        </div>
      )}
    </main>
  );
}

function ExploreCard({ cafe, animDelay }: { cafe: Cafe; animDelay: number }) {
  return (
    <Link
      href={`/cafe/${cafe.id}`}
      className="group block bg-surface-container-lowest rounded-2xl overflow-hidden border-2 border-transparent hover:border-outline-variant/60 card-hover"
      style={{ animation: `fadeSlideIn 0.45s cubic-bezier(0.16,1,0.3,1) ${animDelay}ms both` }}
    >
      <div className="relative h-44 w-full img-hover-zoom overflow-hidden">
        <img className="w-full h-full object-cover" src={cafe.images[0]} alt={cafe.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {cafe.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 bg-primary-fixed/90 text-on-primary-fixed-variant rounded-full text-[11px] font-bold backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-surface-container-lowest/95 rounded-full shadow-sm">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="font-bold text-primary text-xs">{cafe.rating}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h3
            className="text-base font-bold text-primary leading-tight break-words"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {cafe.name}
          </h3>
          <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full shrink-0">
            {cafe.priceRange}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-3 break-words">
          <span className="material-symbols-outlined text-secondary shrink-0" style={{ fontSize: '13px' }}>
            location_on
          </span>
          {cafe.address}
        </p>
        <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed break-words">
          {cafe.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CoffeeRating value={cafe.rating} size="sm" />
            <span className="text-xs text-on-surface-variant">({cafe.reviewCount})</span>
          </div>
          <span className="inline-flex items-center justify-center gap-1 px-2.5 md:px-4 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-xl group-hover:opacity-90 transition-all duration-150 shrink-0">
            <span className="hidden md:inline">Xem chi tiết</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
