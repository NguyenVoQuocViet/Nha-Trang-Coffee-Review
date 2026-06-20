import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getReviewsByUserId, getAllCafes } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CoffeeRating from '@/components/CoffeeRating';
import Link from 'next/link';
import { logoutAction } from '@/lib/actions';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [userReviews, allCafes] = await Promise.all([
    getReviewsByUserId(session.userId),
    getAllCafes(),
  ]);

  const reviewedCafes = userReviews.map((r) => ({
    review: r,
    cafe: allCafes.find((c) => c.id === r.cafeId),
  }));

  const avgRating =
    userReviews.length > 0
      ? (userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length).toFixed(1)
      : '—';

  const badges = [
    { label: 'Người mới', icon: 'emoji_events', earned: true, desc: 'Viết đánh giá đầu tiên' },
    { label: 'Tín đồ cà phê', icon: 'local_cafe', earned: userReviews.length >= 3, desc: '3 đánh giá' },
    { label: 'Chuyên gia', icon: 'verified', earned: userReviews.length >= 10, desc: '10 đánh giá' },
  ];

  return (
    <>
      <Navbar session={session} />
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-12 space-y-10">
        {/* Profile Card */}
        <div className="bg-primary text-on-primary rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
          <div className="w-24 h-24 rounded-full bg-on-primary/20 flex items-center justify-center text-on-primary text-4xl font-bold shrink-0">
            {session.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h1 className="text-2xl font-bold text-on-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {session.name}
            </h1>
            <p className="text-on-primary/70 text-sm">{session.email}</p>
            {session.role === 'admin' && (
              <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold mt-2">
                Admin
              </span>
            )}
          </div>
          <div className="flex gap-8 text-center shrink-0">
            {[
              { label: 'Đánh giá', value: userReviews.length },
              { label: 'Điểm TB', value: avgRating },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-on-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {value}
                </p>
                <p className="text-on-primary/70 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Huy hiệu
          </h2>
          <div className="flex gap-4 flex-wrap">
            {badges.map(({ label, icon, earned, desc }) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${
                  earned
                    ? 'bg-primary-fixed border-primary/20 text-on-primary-fixed-variant'
                    : 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant opacity-50'
                }`}
              >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: earned ? "'FILL' 1" : "'FILL' 0" }}>
                  {icon}
                </span>
                <div>
                  <p className="font-bold text-sm">{label}</p>
                  <p className="text-xs opacity-70">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* My Reviews */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Đánh giá của tôi ({userReviews.length})
          </h2>

          {userReviews.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant border border-outline-variant/30 rounded-2xl">
              <span className="material-symbols-outlined text-5xl mb-3 block">rate_review</span>
              <p className="font-semibold">Bạn chưa có đánh giá nào</p>
              <Link
                href="/"
                className="mt-4 inline-block text-primary font-semibold underline text-sm"
              >
                Khám phá quán cà phê
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewedCafes.map(({ review, cafe }) => (
                <div
                  key={review.id}
                  className="flex gap-5 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 hover:shadow-sm transition-all"
                >
                  {cafe && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img className="w-full h-full object-cover" src={cafe.images[0]} alt={cafe.name} />
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    {cafe && (
                      <Link
                        href={`/cafe/${cafe.id}`}
                        className="font-bold text-primary hover:underline text-sm"
                      >
                        {cafe.name}
                      </Link>
                    )}
                    <CoffeeRating value={review.rating} size="sm" />
                    <p className="text-sm text-on-surface-variant leading-relaxed">{review.comment}</p>
                    <p className="text-xs text-outline">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Logout */}
        <div className="border-t border-outline-variant pt-6 flex justify-end">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 border border-error text-error rounded-xl text-sm font-semibold hover:bg-error-container transition-all"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Đăng xuất
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
