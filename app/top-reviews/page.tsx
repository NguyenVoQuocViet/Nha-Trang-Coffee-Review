import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getApprovedCafes } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CoffeeRating from '@/components/CoffeeRating';

const FILTERS = ['Tất cả', 'Điểm cao nhất', 'Nhiều đánh giá', 'Mới nhất'];

export default async function TopReviewsPage() {
  const [session, cafes] = await Promise.all([
    getSession(),
    getApprovedCafes(),
  ]);

  const ranked = [...cafes]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 10);

  const [top, ...rest] = ranked;

  return (
    <div className="flex flex-col min-h-[100dvh] w-full">
      <Navbar session={session} />
      <main className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-12 flex-1">
        <header className="text-center mb-12">
          <p className="text-secondary font-semibold text-sm uppercase tracking-widest mb-2">
            Bảng xếp hạng
          </p>
          <h1
            className="text-4xl font-bold text-primary"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Top Quán Cà Phê Nha Trang
          </h1>
          <p className="text-on-surface-variant text-sm mt-3 w-full max-w-2xl mx-auto whitespace-normal break-words">
            Những quán được cộng đồng đánh giá cao nhất — được xếp hạng dựa trên điểm số và số lượng đánh giá.
          </p>
        </header>

        {/* Filter tabs */}
        <div className="flex flex-nowrap gap-2 mb-10 overflow-x-auto hide-scrollbar whitespace-nowrap pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {FILTERS.map((f, i) => (
            <button
              key={f}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                i === 0
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* #1 Spotlight */}
        {top && (
          <Link
            href={`/cafe/${top.id}`}
            className="group block mb-10 rounded-3xl overflow-hidden bg-[#33210d] text-white relative min-h-64 hover:shadow-xl transition-shadow"
          >
            <img
              src={top.images[0]}
              alt={top.name}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="relative z-10 p-5 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              <div className="ranking-number flex-shrink-0">1</div>
              <div className="flex-1 min-w-0">
                <p className="text-primary-fixed text-xs font-bold uppercase tracking-widest mb-2">
                  #1 Quán nổi bật nhất
                </p>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {top.name}
                </h2>
                <p className="text-white/80 text-sm mb-3 break-words">{top.address}</p>
                <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
                  <CoffeeRating value={top.rating} size="md" />
                  <span className="text-white font-bold">{top.rating}</span>
                  <span className="text-white/70 text-sm">({top.reviewCount} đánh giá)</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {top.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-white text-[#33210d] rounded-2xl font-bold text-sm group-hover:bg-primary-fixed transition-all shrink-0">
                Xem chi tiết
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
              </span>
            </div>
          </Link>
        )}

        {/* Ranked list */}
        <div className="space-y-4">
          {rest.map((cafe, index) => {
            const rank = index + 2;
            return (
              <Link
                key={cafe.id}
                href={`/cafe/${cafe.id}`}
                className="flex items-start sm:items-center gap-3 sm:gap-6 p-4 md:p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    rank === 2
                      ? 'bg-yellow-100 text-yellow-700'
                      : rank === 3
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {rank}
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={cafe.images[0]}
                    alt={cafe.name}
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-bold text-primary break-words leading-snug">{cafe.name}</p>
                    <p className="text-xs text-on-surface-variant break-words flex items-start gap-1">
                      <span className="material-symbols-outlined text-xs shrink-0">location_on</span>
                      {cafe.address}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cafe.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-xs font-semibold whitespace-nowrap">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1 shrink-0">
                    <div className="flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-primary text-base"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="font-bold text-primary">{cafe.rating}</span>
                    </div>
                    <span className="text-xs text-on-surface-variant whitespace-nowrap">{cafe.reviewCount} đánh giá</span>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors hidden sm:inline-flex">
                      chevron_right
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
