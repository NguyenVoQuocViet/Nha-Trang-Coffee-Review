import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary text-on-primary mt-auto dark:bg-surface-container-lowest dark:text-on-surface">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 md:items-baseline gap-6 md:gap-8 px-4 md:px-16 py-12">
        <div className="space-y-4 col-span-2 md:col-span-1">
          <div className="flex items-baseline gap-2">
            <span className="material-symbols-outlined self-center text-on-primary text-2xl shrink-0 dark:text-primary">coffee</span>
            <span
              className="text-xl font-bold text-on-primary dark:text-primary"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Nha Trang Coffee Review
            </span>
          </div>
          <p className="text-on-primary/80 text-sm leading-relaxed dark:text-on-surface-variant">
            Đi hết các quán cà phê ở Nha Trang trong 4 năm đại học.
          </p>
        </div>

        <div className="space-y-4">
          <h6 className="text-xs font-bold uppercase tracking-widest text-secondary-fixed dark:text-primary">
            Khám phá
          </h6>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-on-primary/80 hover:text-on-primary dark:text-on-surface-variant dark:hover:text-on-surface hover:underline transition-all"
              >
                Trang chủ
              </Link>
            </li>
            <li>
              <Link
                href="/map"
                className="text-on-primary/80 hover:text-on-primary dark:text-on-surface-variant dark:hover:text-on-surface hover:underline transition-all"
              >
                Bản đồ quán
              </Link>
            </li>
            <li>
              <Link
                href="/top-reviews"
                className="text-on-primary/80 hover:text-on-primary dark:text-on-surface-variant dark:hover:text-on-surface hover:underline transition-all"
              >
                Bảng xếp hạng
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h6 className="text-xs font-bold uppercase tracking-widest text-secondary-fixed dark:text-primary">
            Hỗ trợ
          </h6>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="#"
                className="text-on-primary/80 hover:text-on-primary dark:text-on-surface-variant dark:hover:text-on-surface hover:underline transition-all"
              >
                Liên hệ
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-on-primary/80 hover:text-on-primary dark:text-on-surface-variant dark:hover:text-on-surface hover:underline transition-all"
              >
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-on-primary/80 hover:text-on-primary dark:text-on-surface-variant dark:hover:text-on-surface hover:underline transition-all"
              >
                Điều khoản dịch vụ
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h6 className="text-xs font-bold uppercase tracking-widest text-secondary-fixed dark:text-primary">
            Theo dõi
          </h6>
          <div className="flex flex-col gap-2 text-sm">
            <a
              href="https://github.com/NguyenVoQuocViet/Nha-Trang-Coffee-Review"
              className="flex items-center gap-2 text-on-primary/80 hover:text-on-primary dark:text-on-surface-variant dark:hover:text-on-surface transition-all"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
                <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.438 9.63 8.205 11.19.6.11.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.72-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.42-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.467-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.045.138 3.003.404 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.62-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.91 24 17.49 24 12.29 24 5.78 18.627.5 12 .5z" />
              </svg>
              Github
            </a>
            <a
              href="https://www.facebook.com/qviet.nv"
              className="flex items-center gap-2 text-on-primary/80 hover:text-on-primary dark:text-on-surface-variant dark:hover:text-on-surface transition-all"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-on-primary/10 px-4 md:px-16 py-6 dark:border-outline-variant/40">
        <p className="text-xs text-on-primary/60 text-center dark:text-on-surface-variant">
          © 2026 Nha Trang Coffee Review. Brewing with love by the sea.
        </p>
      </div>
    </footer>
  );
}
