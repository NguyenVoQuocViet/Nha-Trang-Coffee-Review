'use client';

import { useState, useTransition } from 'react';
import CoffeeRating from '@/components/CoffeeRating';
import {
  deleteReviewAction,
  toggleHelpfulAction,
  addReplyAction,
} from '@/lib/actions';
import type { Review } from '@/lib/mockData';

interface ReviewItemProps {
  review: Review;
  cafeId: string;
  currentUserId?: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

function Avatar({ name, src }: { name: string; src?: string }) {
  return (
    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0 text-on-primary-container font-bold text-sm overflow-hidden">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

export default function ReviewItem({
  review,
  cafeId,
  currentUserId,
  isAdmin,
  isLoggedIn,
}: ReviewItemProps) {
  const likedByMe = currentUserId
    ? review.helpfulUserIds.includes(currentUserId)
    : false;

  const [pending, startTransition] = useTransition();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleHelpful() {
    if (!isLoggedIn) {
      setError('Bạn cần đăng nhập để đánh giá hữu ích.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await toggleHelpfulAction(review.id, cafeId);
      if (res?.error) setError(res.error);
    });
  }

  function handleReplySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoggedIn) {
      setError('Bạn cần đăng nhập để phản hồi.');
      return;
    }
    const text = replyText.trim();
    if (!text) return;
    setError(null);
    startTransition(async () => {
      const res = await addReplyAction(review.id, cafeId, text);
      if (res?.error) {
        setError(res.error);
      } else {
        setReplyText('');
        setShowReply(false);
      }
    });
  }

  function handleDelete() {
    if (!confirm('Xóa đánh giá này?')) return;
    startTransition(async () => {
      await deleteReviewAction(review.id, cafeId);
    });
  }

  return (
    <div className="flex gap-4">
      <Avatar name={review.userName} src={review.userAvatar} />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h5 className="font-bold text-primary text-sm">{review.userName}</h5>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-on-surface-variant">
              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
            </span>
            {isAdmin && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                title="Xóa đánh giá"
                className="flex items-center gap-1 text-xs text-error hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            )}
          </div>
        </div>
        <CoffeeRating value={review.rating} size="sm" />
        <p className="text-on-surface-variant text-sm leading-relaxed">
          {review.comment}
        </p>

        <div className="flex items-center gap-4 pt-1">
          <button
            type="button"
            onClick={handleHelpful}
            disabled={pending}
            className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-50 ${
              likedByMe
                ? 'text-primary font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: likedByMe ? "'FILL' 1" : "'FILL' 0" }}
            >
              thumb_up
            </span>
            Hữu ích{review.helpfulCount > 0 ? ` (${review.helpfulCount})` : ''}
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setShowReply((v) => !v);
            }}
            className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-base">reply</span>
            Phản hồi{review.replies.length > 0 ? ` (${review.replies.length})` : ''}
          </button>
        </div>

        {error && <p className="text-xs text-error font-medium">{error}</p>}

        {/* Reply form */}
        {showReply && (
          <form onSubmit={handleReplySubmit} className="space-y-2 pt-1">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              placeholder={
                isLoggedIn
                  ? 'Viết phản hồi...'
                  : 'Bạn cần đăng nhập để phản hồi'
              }
              disabled={!isLoggedIn || pending}
              className="w-full bg-surface border border-outline-variant rounded-xl p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder:text-on-surface-variant/50 disabled:opacity-60"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReply(false)}
                className="px-4 py-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!isLoggedIn || pending || !replyText.trim()}
                className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </form>
        )}

        {/* Replies list */}
        {review.replies.length > 0 && (
          <div className="space-y-3 pt-2 pl-4 border-l-2 border-outline-variant/50">
            {review.replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0 text-on-secondary-container font-bold text-xs overflow-hidden">
                  {reply.userAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={reply.userAvatar}
                      alt={reply.userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    reply.userName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h6 className="font-bold text-primary text-xs">
                      {reply.userName}
                    </h6>
                    <span className="text-[11px] text-on-surface-variant">
                      {new Date(reply.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    {reply.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
