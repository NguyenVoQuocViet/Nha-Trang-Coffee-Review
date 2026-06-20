'use client';

import { useState } from 'react';

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  height?: string;
}

// Nửa chiều rộng khung nhìn (độ). ~0.02 độ ≈ 2km mỗi phía quanh tâm bản đồ.
const DELTA = 0.02;

/**
 * Bản đồ OpenStreetMap (không cần API key) có thể NHẤP để ghim toạ độ.
 * Một lớp phủ trong suốt phía trên iframe sẽ bắt sự kiện click và quy đổi vị trí
 * pixel sang lat/lng dựa trên bbox cố định của bản đồ.
 */
export default function LocationPicker({
  lat,
  lng,
  onChange,
  height = '256px',
}: LocationPickerProps) {
  // Tâm bản đồ (cố định cho tới khi bấm "Căn giữa") để không bị nháy reload iframe.
  const [center, setCenter] = useState({ lat, lng });

  const minLng = center.lng - DELTA;
  const maxLat = center.lat + DELTA;
  const span = DELTA * 2;

  const bbox = `${center.lng - DELTA},${center.lat - DELTA},${center.lng + DELTA},${center.lat + DELTA}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;

  // Vị trí pixel (%) của ghim hiện tại trong khung nhìn.
  const pinLeft = ((lng - minLng) / span) * 100;
  const pinTop = ((maxLat - lat) / span) * 100;
  const pinVisible = pinLeft >= 0 && pinLeft <= 100 && pinTop >= 0 && pinTop <= 100;

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 (trái) -> 1 (phải)
    const y = (e.clientY - rect.top) / rect.height; // 0 (trên) -> 1 (dưới)
    const newLng = minLng + x * span;
    const newLat = maxLat - y * span;
    onChange(Number(newLat.toFixed(6)), Number(newLng.toFixed(6)));
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-outline-variant"
      style={{ height }}
    >
      {/* Bản đồ thật (vô hiệu hoá tương tác để lớp phủ bắt được click) */}
      <iframe
        key={src}
        src={src}
        className="w-full h-full pointer-events-none"
        style={{ border: 0, display: 'block' }}
        title="Chọn vị trí trên bản đồ"
        loading="lazy"
      />

      {/* Lớp phủ bắt click */}
      <div className="absolute inset-0 cursor-crosshair" onClick={handleClick} />

      {/* Ghim vị trí đang chọn */}
      {pinVisible && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${pinLeft}%`,
            top: `${pinTop}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}
          >
            location_on
          </span>
        </div>
      )}

      {/* Hướng dẫn */}
      <div className="absolute top-2 left-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-on-surface-variant pointer-events-none">
        Nhấp vào bản đồ để ghim vị trí
      </div>

      {/* Toạ độ hiện tại + nút căn giữa */}
      <div className="absolute bottom-2 left-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-primary pointer-events-none">
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </div>
      <button
        type="button"
        onClick={() => setCenter({ lat, lng })}
        className="absolute bottom-2 right-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-semibold text-primary hover:bg-primary-fixed transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
          my_location
        </span>
        Căn giữa
      </button>
    </div>
  );
}
