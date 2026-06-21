'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import GoogleMapWidget from '@/components/GoogleMapWidget';
import CoffeeRating from '@/components/CoffeeRating';
import type { Cafe } from '@/lib/mockData';
import type { SessionPayload } from '@/lib/auth';
import { DISTRICT_FILTERS } from '@/lib/constants';

// Mỗi danh mục khớp theo nhiều từ khóa (tiếng Việt + tiếng Anh), không phân biệt
// hoa thường và khớp một phần — để nhận cả tag người dùng gõ tay lẫn dữ liệu cũ.
const CATEGORIES = [
  { label: 'View biển', icon: 'beach_access', match: ['view biển', 'beach', 'ocean', 'sea', 'coastal', 'biển'] },
  { label: 'Làm việc', icon: 'laptop_mac', match: ['làm việc', 'work', 'wifi', 'workspace', 'học bài'] },
  { label: 'Yên tĩnh', icon: 'menu_book', match: ['yên tĩnh', 'quiet', 'yên'] },
  { label: 'Sân vườn', icon: 'filter_vintage', match: ['sân vườn', 'garden', 'vườn'] },
  { label: 'Tán gẫu', icon: 'forum', match: ['tán gẫu', 'tan gau', 'chat', 'trò chuyện', 'gặp gỡ', 'hangout', 'tụ tập'] },
  { label: 'Học bài', icon: 'school', match: ['học bài', 'study', 'studying', 'self-study'] },
  { label: 'Chơi game', icon: 'sports_esports', match: ['chơi game', 'game', 'gaming', 'esport', 'console'] },
  { label: 'Chơi bài', icon: 'playing_cards', match: ['chơi bài', 'cards', 'board game', 'boardgame', 'tụ tập'] },
];

const DISTRICTS = DISTRICT_FILTERS;

interface HomeClientProps {
  cafes: Cafe[];
  session?: SessionPayload | null;
}

export default function HomeClient({ cafes, session }: HomeClientProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDistrict, setActiveDistrict] = useState('Tất cả');
  const [selectedCafeId, setSelectedCafeId] = useState<string | undefined>();

  const filtered = useMemo(() => {
    return cafes.filter((cafe) => {
      const matchSearch =
        !search ||
        cafe.name.toLowerCase().includes(search.toLowerCase()) ||
        cafe.address.toLowerCase().includes(search.toLowerCase()) ||
        cafe.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchCat =
        !activeCategory ||
        (() => {
          const cat = CATEGORIES.find((c) => c.label === activeCategory);
          if (!cat) return true;
          return cafe.tags.some((t) =>
            cat.match.some((k) => t.toLowerCase().includes(k))
          );
        })();
      const matchDistrict =
        activeDistrict === 'Tất cả' || cafe.district === activeDistrict;
      return matchSearch && matchCat && matchDistrict;
    });
  }, [cafes, search, activeCategory, activeDistrict]);

  const mapMarkers = filtered.map((c) => ({
    id: c.id,
    position: c.location,
    title: c.name,
  }));

  return (
    <main>
      {/* Hero Slider */}
      <HeroSlider />

      <div id="cafes" className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        {/* Search */}
        <div className="relative mb-6 max-w-2xl">
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          )}
        </div>

        {/* Category chips */}
        <section className="mb-6">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(active ? null : cat.label)}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
                      active
                        ? 'bg-primary text-on-primary shadow-md'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-primary-fixed hover:text-primary'
                    }`}
                    style={{ transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)' }}
                  >
                    <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                  </div>
                  <span className={`text-xs font-semibold transition-colors ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* District chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-8">
          {DISTRICTS.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDistrict(d)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 ${
                activeDistrict === d
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cafe list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Quán nổi bật
              </h3>
              <span className="text-sm text-on-surface-variant px-3 py-1 bg-surface-container rounded-full">
                {filtered.length} quán
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-4 block text-outline-variant">search_off</span>
                <p className="font-semibold text-base">Không tìm thấy quán phù hợp</p>
                <button
                  onClick={() => { setSearch(''); setActiveCategory(null); setActiveDistrict('Tất cả'); }}
                  className="mt-5 px-5 py-2 border border-primary text-primary rounded-full text-sm font-semibold hover:bg-primary-fixed transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {filtered.map((cafe, i) => (
                  <CafeCard
                    key={cafe.id}
                    cafe={cafe}
                    isSelected={selectedCafeId === cafe.id}
                    onSelect={() => setSelectedCafeId(cafe.id)}
                    animDelay={i * 60}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sticky map sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <h3 className="text-xl font-bold text-primary mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Bản đồ
              </h3>
              <GoogleMapWidget
                center={selectedCafeId ? cafes.find((c) => c.id === selectedCafeId)?.location : undefined}
                markers={mapMarkers}
                height="430px"
                zoom={selectedCafeId ? 15 : 13}
                onMarkerClick={setSelectedCafeId}
              />
              <Link
                href="/map"
                className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 border border-outline-variant rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high hover:border-primary/30 transition-all duration-200"
              >
                <span className="material-symbols-outlined text-base">open_in_full</span>
                Xem bản đồ đầy đủ
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile map CTA */}
        <div className="lg:hidden mt-8">
          <Link
            href="/map"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-secondary text-on-secondary rounded-2xl font-bold text-sm shadow-sm active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">map</span>
            Xem bản đồ các quán
          </Link>
        </div>
      </div>

      {/* Admin FAB */}
      {session?.role === 'admin' && (
        <Link
          href="/admin/add-cafe"
          className="fixed right-6 bottom-8 w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-xl flex items-center justify-center z-40 hover:scale-110 hover:shadow-2xl active:scale-95 transition-all duration-200"
          title="Thêm quán mới"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </Link>
      )}
    </main>
  );
}

function CafeCard({
  cafe,
  isSelected,
  onSelect,
  animDelay,
}: {
  cafe: Cafe;
  isSelected: boolean;
  onSelect: () => void;
  animDelay: number;
}) {
  return (
    <Link
      href={`/cafe/${cafe.id}`}
      onMouseEnter={onSelect}
      className={`block bg-surface-container-lowest rounded-2xl overflow-hidden cursor-pointer border-2 card-hover ${
        isSelected ? 'border-primary shadow-lg' : 'border-transparent hover:border-outline-variant/60'
      }`}
      style={{ animation: `fadeSlideIn 0.45s cubic-bezier(0.16,1,0.3,1) ${animDelay}ms both` }}
    >
      <div className="relative h-52 w-full img-hover-zoom overflow-hidden">
        <img className="w-full h-full object-cover" src={cafe.images[0]} alt={cafe.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {cafe.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2.5 py-0.5 bg-primary-fixed/90 text-on-primary-fixed-variant rounded-full text-[11px] font-bold backdrop-blur-sm">
              {tag}
            </span>
          ))}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-surface-container-lowest/95 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="font-bold text-primary text-xs">{cafe.rating}</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-1.5">
          <h4 className="text-base font-bold text-primary leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {cafe.name}
          </h4>
          <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full shrink-0 ml-2">
            {cafe.priceRange}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-3">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '13px' }}>location_on</span>
          {cafe.address}
        </p>
        <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">{cafe.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CoffeeRating value={cafe.rating} size="sm" />
            <span className="text-xs text-on-surface-variant">({cafe.reviewCount})</span>
          </div>
          <span className="inline-flex items-center justify-center gap-1 px-2.5 md:px-4 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-xl group-hover:opacity-90 transition-all duration-150 shrink-0">
            <span className="hidden md:inline">Xem chi tiết</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
