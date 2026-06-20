'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import type { SessionPayload } from '@/lib/auth';
import { logoutAction } from '@/lib/actions';

interface NavbarProps {
  session?: SessionPayload | null;
}

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Khám phá', href: '/explore' },
  { label: 'Bản đồ', href: '/map' },
  { label: 'Bảng xếp hạng', href: '/top-reviews' },
];

export default function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Đổi theme bằng cách bật/tắt class "dark" trên <html> + lưu localStorage.
  // Icon/nhãn hiển thị qua CSS (dark:) nên không cần lưu state trong React.
  function toggleTheme() {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {}
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  async function handleLogout() {
    await logoutAction();
    router.refresh();
  }

  return (
    <header className="bg-surface/70 backdrop-blur-xl shadow-sm sticky top-0 z-50 w-full border-b border-outline-variant/20">
      <div className="max-w-[1440px] mx-auto flex justify-between items-center px-4 md:px-16 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <img
            src="/logo/logo.png"
            alt="Nha Trang Coffee Review"
            onError={(e) => {
              // Chưa có /logo/logo.png thì tạm dùng favicon để không vỡ ảnh.
              if (!e.currentTarget.src.endsWith('/favicon.ico')) {
                e.currentTarget.src = '/favicon.ico';
              }
            }}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
          <span className="font-display-lg text-base sm:text-lg nav:text-xl font-bold text-primary whitespace-nowrap truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Nha Trang Coffee Review
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden nav:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
                isActive(link.href)
                  ? 'text-primary border-b-2 border-primary pb-0.5'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {session?.role === 'admin' && (
            <Link
              href="/admin/add-cafe"
              className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${
                pathname.startsWith('/admin')
                  ? 'text-primary border-b-2 border-primary pb-0.5'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Thêm quán
            </Link>
          )}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          {/* Theme toggle (desktop) */}
          <button
            onClick={toggleTheme}
            aria-label="Chuyển chế độ sáng/tối"
            title="Chuyển chế độ sáng/tối"
            className="hidden nav:flex items-center justify-center p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all active:scale-95"
          >
            <span className="dark:hidden">
              <span className="material-symbols-outlined">dark_mode</span>
            </span>
            <span className="hidden dark:inline">
              <span className="material-symbols-outlined">light_mode</span>
            </span>
          </button>

          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="hidden nav:flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-xl">account_circle</span>
                <span>{session.name.split(' ')[0]}</span>
              </Link>
              {session.role === 'admin' && (
                <Link
                  href="/admin"
                  aria-label="Bảng điều khiển"
                  title="Bảng điều khiển"
                  className="hidden nav:flex items-center justify-center p-2 bg-secondary-container text-on-secondary-container rounded-lg"
                >
                  <span className="material-symbols-outlined text-xl">dashboard</span>
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="hidden nav:inline-flex items-center px-4 py-2 text-sm font-semibold text-primary border border-primary/30 rounded-xl hover:bg-primary-fixed/20 transition-all active:scale-95"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="hidden nav:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high rounded-xl transition-all"
              >
                Đăng nhập
              </Link>
              <Link
                href="/login?tab=register"
                className="px-5 py-2 bg-primary text-on-primary text-sm font-semibold rounded-xl shadow-sm hover:opacity-90 transition-all active:scale-95"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="nav:hidden p-2 text-primary"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="nav:hidden bg-surface border-t border-outline-variant/30 px-4 py-4 space-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isActive(link.href)
                  ? 'bg-primary-fixed/20 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {session?.role === 'admin' && (
            <Link
              href="/admin/add-cafe"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
            >
              Thêm quán
            </Link>
          )}
          {/* Theme toggle (mobile) */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span>
              Chế độ tối:{' '}
              <span className="dark:hidden">Tắt</span>
              <span className="hidden dark:inline">Bật</span>
            </span>
            <span className="dark:hidden">
              <span className="material-symbols-outlined">dark_mode</span>
            </span>
            <span className="hidden dark:inline">
              <span className="material-symbols-outlined">light_mode</span>
            </span>
          </button>

          {session && (
            <>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-xl">account_circle</span>
                Trang cá nhân
              </Link>
              {session.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">dashboard</span>
                  Bảng điều khiển Admin
                </Link>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-error hover:bg-error-container/40 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                Đăng xuất
              </button>
            </>
          )}

          {!session && (
            <div className="flex gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center px-4 py-2.5 border border-primary text-primary text-sm font-semibold rounded-xl"
              >
                Đăng nhập
              </Link>
              <Link
                href="/login?tab=register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center px-4 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-xl"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
