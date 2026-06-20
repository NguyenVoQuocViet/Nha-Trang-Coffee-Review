'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Cafe } from '@/lib/mockData';

interface MockMapProps {
  cafes: Cafe[];
  selectedCafeId?: string;
  onSelectCafe?: (id: string) => void;
  height?: string;
}

const MARKER_POSITIONS: Record<string, { top: string; left: string }> = {
  'cafe-1': { top: '55%', left: '52%' },
  'cafe-2': { top: '25%', left: '58%' },
  'cafe-3': { top: '45%', left: '40%' },
  'cafe-4': { top: '35%', left: '30%' },
  'cafe-5': { top: '58%', left: '55%' },
  'cafe-6': { top: '30%', left: '48%' },
  'cafe-7': { top: '65%', left: '44%' },
};

function getMarkerPos(cafeId: string) {
  return (
    MARKER_POSITIONS[cafeId] || {
      top: `${20 + Math.random() * 60}%`,
      left: `${20 + Math.random() * 60}%`,
    }
  );
}

export default function MockMap({
  cafes,
  selectedCafeId,
  onSelectCafe,
  height = '500px',
}: MockMapProps) {
  const [activePopup, setActivePopup] = useState<string | null>(null);

  function togglePopup(id: string) {
    setActivePopup(activePopup === id ? null : id);
    onSelectCafe?.(id);
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-outline-variant"
      style={{ height }}
    >
      {/* Stylized map background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, #c8e6f0 0%, #a8d4e0 25%, #b8d4c8 50%, #c8d0b8 75%, #d4c8a8 100%)',
        }}
      >
        {/* Simulated roads */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="20" y1="0" x2="20" y2="100" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#fff" strokeWidth="1" opacity="0.7" />
          <line x1="80" y1="0" x2="80" y2="100" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
          <line x1="0" y1="30" x2="100" y2="30" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="#fff" strokeWidth="1" opacity="0.7" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
          {/* Coastline */}
          <path
            d="M 70 0 Q 75 20 72 40 Q 78 60 74 80 Q 70 95 68 100"
            stroke="#61b4fe"
            strokeWidth="2"
            fill="none"
            opacity="0.8"
          />
          <path
            d="M 70 0 Q 75 20 72 40 Q 78 60 74 80 Q 70 95 68 100 L 100 100 L 100 0 Z"
            fill="#61b4fe"
            opacity="0.3"
          />
        </svg>

        {/* Water label */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/60 text-xs font-semibold italic">
          Vịnh Nha Trang
        </div>
      </div>

      {/* Map markers */}
      {cafes.map((cafe) => {
        const pos = getMarkerPos(cafe.id);
        const isSelected = selectedCafeId === cafe.id || activePopup === cafe.id;

        return (
          <div
            key={cafe.id}
            className="absolute cursor-pointer"
            style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}
            onClick={() => togglePopup(cafe.id)}
          >
            {/* Marker */}
            <div className={`relative ${isSelected ? 'scale-125' : ''} transition-transform`}>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-on-primary shadow-xl border-2 border-white ${
                  isSelected ? 'bg-secondary' : 'bg-primary'
                }`}
              >
                <span className="material-symbols-outlined text-xl">coffee</span>
              </div>
              <div
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 rounded-sm ${
                  isSelected ? 'bg-secondary' : 'bg-primary'
                }`}
              />
            </div>

            {/* Popup */}
            {activePopup === cafe.id && (
              <div
                className="absolute bottom-14 left-1/2 -translate-x-1/2 w-64 bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 z-10"
                style={{ minWidth: '220px' }}
              >
                {cafe.images[0] && (
                  <img
                    src={cafe.images[0]}
                    alt={cafe.name}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-3">
                  <h4 className="font-semibold text-primary text-sm">{cafe.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {cafe.rating} · {cafe.reviewCount} đánh giá
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">{cafe.address}</p>
                  <Link
                    href={`/cafe/${cafe.id}`}
                    className="mt-3 block w-full text-center py-2 bg-primary text-on-primary text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Map controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button className="w-10 h-10 bg-surface shadow-md rounded-xl flex items-center justify-center text-primary hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-xl">add</span>
        </button>
        <button className="w-10 h-10 bg-surface shadow-md rounded-xl flex items-center justify-center text-primary hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-xl">remove</span>
        </button>
        <button className="w-10 h-10 mt-1 bg-secondary text-on-secondary shadow-lg rounded-xl flex items-center justify-center hover:opacity-90 transition-all">
          <span className="material-symbols-outlined text-xl">my_location</span>
        </button>
      </div>

      {/* Layer toggle */}
      <div className="absolute top-4 right-4">
        <button className="w-10 h-10 bg-surface shadow-md rounded-xl flex items-center justify-center text-primary hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-xl">layers</span>
        </button>
      </div>

      {/* Map attribution */}
      <div className="absolute bottom-2 left-2 text-[10px] text-on-surface-variant/50">
        Nha Trang Coffee Hub · Mock Map
      </div>
    </div>
  );
}
