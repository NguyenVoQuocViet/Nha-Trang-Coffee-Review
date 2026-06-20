'use client';

interface CoffeeRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (value: number) => void;
}

const SIZE_MAP = {
  sm: 'text-base',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export default function CoffeeRating({
  value,
  max = 5,
  size = 'sm',
  interactive = false,
  onChange,
}: CoffeeRatingProps) {
  const sizeClass = SIZE_MAP[size];

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(value);
        return (
          <span
            key={i}
            className={`material-symbols-outlined text-primary ${sizeClass} ${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
            }`}
            style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
            onClick={() => interactive && onChange?.(i + 1)}
          >
            coffee
          </span>
        );
      })}
    </div>
  );
}
