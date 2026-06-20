import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import {
  getApprovedCafes,
  getPendingCafes,
  getAllCafes,
  getRecentReviews,
  countReviews,
} from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { approveCafeAction, deleteCafeAction } from '@/lib/actions';

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/');

  const [approved, pending, allCafes, recentReviews, totalReviews] =
    await Promise.all([
      getApprovedCafes(),
      getPendingCafes(),
      getAllCafes(),
      getRecentReviews(5),
      countReviews(),
    ]);

  const stats = [
    { label: 'Tổng quán', value: allCafes.length, icon: 'storefront', color: 'bg-primary-fixed text-on-primary-fixed-variant' },
    { label: 'Đã duyệt', value: approved.length, icon: 'check_circle', color: 'bg-secondary-fixed text-on-secondary-fixed-variant' },
    { label: 'Chờ duyệt', value: pending.length, icon: 'pending', color: 'bg-error-container text-error' },
    { label: 'Đánh giá', value: totalReviews, icon: 'rate_review', color: 'bg-surface-container-high text-on-surface-variant' },
  ];

  return (
    <>
      <Navbar session={session} />
      <main className="max-w-[1440px] mx-auto w-full min-w-0 px-4 md:px-8 py-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Bảng điều khiển Admin
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Quản lý quán cà phê, đánh giá và nội dung người dùng.
            </p>
          </div>
          <Link
            href="/admin/add-cafe"
            className="flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 px-5 py-3 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined">add</span>
            Thêm quán mới
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map(({ label, value, icon, color }) => (
            <div key={label} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 space-y-3">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
              </div>
              <p className="text-3xl font-bold text-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {value}
              </p>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Cafes */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Quán chờ duyệt
              </h2>
              {pending.length > 0 && (
                <span className="px-3 py-1 bg-error-container text-on-error-container rounded-full text-xs font-bold">
                  {pending.length} chờ
                </span>
              )}
            </div>

            {pending.length === 0 ? (
              <div className="rounded-2xl border border-outline-variant/30 p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3 block">check_circle</span>
                <p className="font-semibold">Tất cả đã được duyệt!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((cafe) => (
                  <div
                    key={cafe.id}
                    className="flex items-start gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img className="w-full h-full object-cover" src={cafe.images[0]} alt={cafe.name} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-bold text-primary text-sm truncate">{cafe.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{cafe.address}</p>
                      <p className="text-xs text-on-surface-variant">{cafe.district} · {cafe.priceRange}</p>
                    </div>
                    <form action={approveCafeAction.bind(null, cafe.id)}>
                      <button
                        type="submit"
                        className="shrink-0 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                      >
                        Duyệt
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Reviews */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Đánh giá gần đây
            </h2>
            <div className="space-y-3">
              {recentReviews.map((review) => {
                const cafe = allCafes.find((c) => c.id === review.cafeId);
                return (
                  <div key={review.id} className="flex gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm shrink-0">
                      {review.userName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-primary text-sm">{review.userName}</p>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className="material-symbols-outlined text-primary text-sm"
                              style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              coffee
                            </span>
                          ))}
                        </div>
                      </div>
                      {cafe && (
                        <p className="text-xs text-secondary font-semibold">{cafe.name}</p>
                      )}
                      <p className="text-xs text-on-surface-variant line-clamp-2">{review.comment}</p>
                      <p className="text-xs text-outline">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* All Cafes Table */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Danh sách quán ({allCafes.length})
          </h2>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="bg-surface-container-high text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                    <th className="text-left px-6 py-4">Quán</th>
                    <th className="text-left px-6 py-4">Khu vực</th>
                    <th className="text-left px-6 py-4">Rating</th>
                    <th className="text-left px-6 py-4">Trạng thái</th>
                    <th className="text-right px-6 py-4">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {allCafes.map((cafe) => (
                    <tr key={cafe.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                            <img className="w-full h-full object-cover" src={cafe.images[0]} alt={cafe.name} />
                          </div>
                          <div>
                            <p className="font-semibold text-primary line-clamp-2 break-words">{cafe.name}</p>
                            <p className="text-xs text-on-surface-variant">{cafe.priceRange}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">{cafe.district}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span
                            className="material-symbols-outlined text-primary text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          <span className="font-bold text-primary">{cafe.rating}</span>
                          <span className="text-xs text-on-surface-variant">({cafe.reviewCount})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold ${
                            cafe.status === 'approved'
                              ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                              : cafe.status === 'pending'
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {cafe.status === 'approved' ? 'Đã duyệt' : cafe.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/cafe/${cafe.id}`}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                          >
                            Xem
                          </Link>
                          <Link
                            href={`/admin/edit-cafe/${cafe.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-secondary bg-secondary-fixed/60 hover:bg-secondary-fixed transition-colors"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                            Sửa
                          </Link>
                          <form action={deleteCafeAction.bind(null, cafe.id)}>
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-error bg-error-container/60 hover:bg-error-container transition-colors"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                              Xóa
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
