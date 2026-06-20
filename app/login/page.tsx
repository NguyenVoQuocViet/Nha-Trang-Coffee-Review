'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction, registerAction } from '@/lib/actions';

type LoginState = { error?: string } | undefined;

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, undefined);
  const [regState, regAction, regPending] = useActionState<LoginState, FormData>(registerAction, undefined);
  const [showPassword, setShowPassword] = useState(false);

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid var(--color-outline-variant)',
    backgroundColor: 'var(--color-surface-container-lowest)',
    color: 'var(--color-on-surface)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--color-background)',
        display: 'grid',
        placeItems: 'center',
        padding: '3rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '448px' }}>
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-8"
          style={{ textDecoration: 'none' }}
        >
          <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>
            coffee
          </span>
          <span
            className="text-2xl font-bold text-primary"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Nha Trang Coffee Review
          </span>
        </Link>

        {/* Card */}
        <div
          className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant"
          style={{ padding: '2rem' }}
        >
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-surface-container-high p-1 mb-8">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {tab === 'login' ? (
            <div>
              <h1
                className="text-2xl font-bold text-primary mb-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Chào mừng trở lại!
              </h1>
              <p className="text-sm text-on-surface-variant mb-8">
                Đăng nhập để viết đánh giá và theo dõi những quán yêu thích.
              </p>

              <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {state?.error && (
                  <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                    {state.error}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5"
                  >
                    Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      className="material-symbols-outlined text-outline"
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '20px',
                        pointerEvents: 'none',
                      }}
                    >
                      mail
                    </span>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      placeholder="your@email.com"
                      style={{
                        width: '100%',
                        paddingLeft: '44px',
                        paddingRight: '16px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-outline-variant)',
                        backgroundColor: 'var(--color-surface-container-lowest)',
                        color: 'var(--color-on-surface)',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--color-outline-variant)')}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5"
                  >
                    Mật khẩu
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span
                      className="material-symbols-outlined text-outline"
                      style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '20px',
                        pointerEvents: 'none',
                      }}
                    >
                      lock
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        paddingLeft: '44px',
                        paddingRight: '48px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-outline-variant)',
                        backgroundColor: 'var(--color-surface-container-lowest)',
                        color: 'var(--color-on-surface)',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--color-outline-variant)')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: '#80756c',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: pending ? 'var(--color-outline)' : 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: pending ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {pending ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h1
                className="text-2xl font-bold text-primary mb-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Tạo tài khoản
              </h1>
              <p className="text-sm text-on-surface-variant mb-8">
                Tham gia cộng đồng cà phê Nha Trang. Viết đánh giá và chia sẻ trải nghiệm!
              </p>

              <form action={regAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {regState?.error && (
                  <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
                    {regState.error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Họ và tên
                  </label>
                  <input name="name" type="text" required placeholder="Tên của bạn" style={fieldStyle} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input name="email" type="email" required placeholder="your@email.com" style={fieldStyle} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Mật khẩu
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Tối thiểu 6 ký tự"
                    style={fieldStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={regPending}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: regPending ? 'var(--color-outline)' : 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: regPending ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {regPending ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-on-surface-variant">
          <Link href="/" className="text-primary font-semibold hover:underline">
            Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
