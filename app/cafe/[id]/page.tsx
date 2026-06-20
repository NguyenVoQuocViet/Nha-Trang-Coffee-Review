import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCafeById, getReviewsByCafeId } from '@/lib/data';
import { getSession } from '@/lib/auth';
import { deleteCafeAction } from '@/lib/actions';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CoffeeRating from '@/components/CoffeeRating';
import ReviewForm from './ReviewForm';
import GoogleMapWidget from '@/components/GoogleMapWidget';
import CafeGallery from '@/components/CafeGallery';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CafeDetailPage({ params }: Props) {
  const { id } = await params;
  const [session, cafe, reviews] = await Promise.all([
    getSession(),
    getCafeById(id),
    getReviewsByCafeId(id),
  ]);

  if (!cafe) notFound();

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { star, pct };
  });

  return (
    <div className="flex flex-col min-h-[100dvh] w-full">
      <Navbar session={session} />
      <main className="w-full max-w-[1440px] mx-auto px-4 md:px-16 py-8 space-y-12 flex-1">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Về trang chủ
        </Link>

        {/* Admin quick actions */}
        {session?.role === 'admin' && (
          <div className="flex flex-wrap items-center gap-3 -mt-6 p-4 rounded-2xl bg-primary-fixed/40 border border-primary-fixed">
            <span className="text-xs font-bold uppercase tracking-wider text-primary mr-auto">
              Công cụ quản trị
            </span>
            <Link
              href={`/admin/edit-cafe/${cafe.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
              Sửa quán
            </Link>
            <form action={deleteCafeAction.bind(null, cafe.id)}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-error/40 text-error text-sm font-semibold hover:bg-error-container transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                Xóa quán
              </button>
            </form>
          </div>
        )}

        {/* Image Gallery (nhấp để phóng to) */}
        <CafeGallery images={cafe.images} name={cafe.name} />

        {/* Main content */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left: Cafe Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1
                  className="text-3xl font-bold text-primary"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {cafe.name}
                </h1>
                <p className="text-on-surface-variant flex items-center gap-1 mt-1 text-sm">
                  <span className="material-symbols-outlined text-secondary text-base">location_on</span>
                  {cafe.address}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary-fixed rounded-xl">
                  <span
                    className="material-symbols-outlined text-on-primary-fixed-variant text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="font-bold text-on-primary-fixed-variant">{cafe.rating}</span>
                  <span className="text-xs text-on-primary-fixed-variant/80">({cafe.reviewCount})</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {cafe.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-sm font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* About */}
            <div className="glass-card p-6 rounded-xl space-y-6">
              <h3 className="text-lg font-bold text-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Về quán
              </h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">{cafe.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { icon: 'schedule', label: 'Giờ mở cửa', value: cafe.openHours },
                  { icon: 'call', label: 'Điện thoại', value: cafe.phone || 'Chưa cập nhật' },
                  { icon: 'payments', label: 'Mức giá', value: cafe.priceRange },
                  { icon: 'location_city', label: 'Khu vực', value: cafe.district },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary p-2 bg-primary-fixed/30 rounded-lg text-xl">
                      {icon}
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-on-surface">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Map vị trí thực tế của quán (Google Maps theo lat/lng từ DB) */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="glass-card p-4 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-lg">location_on</span>
                Vị trí trên bản đồ
              </h3>
              <GoogleMapWidget
                center={cafe.location}
                markers={[{ id: cafe.id, position: cafe.location, title: cafe.name }]}
                height="clamp(220px, 38vh, 340px)"
                zoom={16}
              />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${cafe.location.lat},${cafe.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>directions</span>
                Chỉ đường tới quán
              </a>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="space-y-8 border-t border-outline-variant pt-12">
          <h2
            className="text-3xl font-bold text-primary"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Đánh giá từ khách hàng
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Rating Summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="glass-card p-6 rounded-xl text-center space-y-2">
                <p
                  className="font-bold text-primary"
                  style={{ fontSize: '57px', lineHeight: '64px', fontFamily: 'Montserrat, sans-serif' }}
                >
                  {cafe.rating}
                </p>
                <CoffeeRating value={cafe.rating} size="md" />
                <p className="text-on-surface-variant text-sm font-semibold">
                  Dựa trên {cafe.reviewCount} đánh giá
                </p>
              </div>
              <div className="space-y-3">
                {ratingBreakdown.map(({ star, pct }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-4 font-bold text-sm text-on-surface">{star}</span>
                    <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-on-surface-variant">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews List + Form */}
            <div className="lg:col-span-8 space-y-8">
              {/* Review Form */}
              {session ? (
                <ReviewForm cafeId={cafe.id} userName={session.name} />
              ) : (
                <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/50 text-center">
                  <span className="material-symbols-outlined text-4xl text-outline mb-3 block">rate_review</span>
                  <p className="text-on-surface-variant font-semibold mb-4">
                    Bạn cần đăng nhập để viết đánh giá
                  </p>
                  <Link
                    href="/login"
                    className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              )}

              {/* Reviews list */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-center text-on-surface-variant py-8">
                    Chưa có đánh giá nào. Hãy là người đầu tiên!
                  </p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0 text-on-primary-container font-bold text-sm overflow-hidden">
                        {review.userAvatar ? (
                          <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                        ) : (
                          review.userName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-primary text-sm">{review.userName}</h5>
                          <span className="text-xs text-on-surface-variant">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <CoffeeRating value={review.rating} size="sm" />
                        <p className="text-on-surface-variant text-sm leading-relaxed">
                          {review.comment}
                        </p>
                        <div className="flex items-center gap-4 pt-1">
                          <button className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-base">thumb_up</span>
                            Hữu ích
                          </button>
                          <button className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-base">reply</span>
                            Phản hồi
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
