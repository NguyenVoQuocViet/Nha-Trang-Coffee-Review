'use client';

import { useState, useActionState, startTransition } from 'react';
import { addReviewAction } from '@/lib/actions';

type ReviewState = { error?: string; success?: boolean } | undefined;

interface ReviewFormProps {
  cafeId: string;
  userName: string;
}

export default function ReviewForm({ cafeId, userName }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [state, action, pending] = useActionState<ReviewState, FormData>(
    addReviewAction,
    undefined
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('rating', String(rating));
    formData.set('cafeId', cafeId);
    formData.set('comment', comment);
    startTransition(() => action(formData));
  }

  if (state?.success) {
    return (
      <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/50 text-center">
        <span className="material-symbols-outlined text-5xl text-secondary mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        <p className="font-bold text-primary text-lg">Cảm ơn bạn đã đánh giá!</p>
        <p className="text-on-surface-variant text-sm mt-1">Đánh giá của bạn đã được thêm thành công.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 border border-primary text-primary rounded-xl text-sm font-semibold hover:bg-primary-fixed/20 transition-all"
        >
          Đánh giá thêm
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/50 space-y-5">
      <h4 className="text-lg font-bold text-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        Chia sẻ trải nghiệm của bạn
      </h4>
      <p className="text-sm text-on-surface-variant">
        Đánh giá với tư cách: <span className="text-primary font-semibold">{userName}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {state?.error && (
          <div className="p-3 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
            {state.error}
          </div>
        )}

        {/* Star rating */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Điểm đánh giá
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-125"
              >
                <span
                  className="material-symbols-outlined text-primary text-4xl"
                  style={{
                    fontVariationSettings:
                      i <= (hoverRating || rating) ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  coffee
                </span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-primary font-semibold mt-1">
              {['', 'Tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Xuất sắc'][rating]} ({rating}/5)
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
            Nhận xét
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder="Nhận xét của bạn về quán... (phong cách, đồ uống, không gian, giá cả)"
            rows={4}
            className="w-full bg-surface border border-outline-variant rounded-xl p-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder:text-on-surface-variant/50"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={pending || rating === 0 || !comment.trim()}
            className="px-8 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </div>
  );
}
