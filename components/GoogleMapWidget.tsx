'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

interface MapCoords {
  lat: number;
  lng: number;
}

interface MapMarker {
  id: string;
  position: MapCoords;
  title: string;
}

interface GoogleMapWidgetProps {
  center?: MapCoords;
  markers?: MapMarker[];
  height?: string;
  zoom?: number;
  onMarkerClick?: (id: string) => void;
}

const NHA_TRANG_CENTER: MapCoords = { lat: 12.2389, lng: 109.1967 };
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
// Map ID bắt buộc khi dùng Advanced Marker. Dùng "DEMO_MAP_ID" của Google nếu
// chưa tạo Map ID riêng (có thể đặt NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID để tuỳ biến).
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
// Tải sẵn thư viện "marker" để dùng AdvancedMarkerElement. Khai báo ở ngoài
// component để mảng giữ nguyên tham chiếu, tránh việc useLoadScript reload.
const LIBRARIES: ('marker')[] = ['marker'];

export default function GoogleMapWidget({
  center,
  markers,
  height = '420px',
  zoom = 14,
  onMarkerClick,
}: GoogleMapWidgetProps) {
  if (!API_KEY) {
    return <OSMFallback center={center ?? NHA_TRANG_CENTER} height={height} />;
  }

  return (
    <RealGoogleMap
      center={center ?? NHA_TRANG_CENTER}
      markers={markers ?? []}
      height={height}
      zoom={zoom}
      onMarkerClick={onMarkerClick}
    />
  );
}

function RealGoogleMap({
  center,
  markers,
  height,
  zoom,
  onMarkerClick,
}: Required<Omit<GoogleMapWidgetProps, 'onMarkerClick'>> & {
  onMarkerClick?: (id: string) => void;
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries: LIBRARIES,
  });
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // Khóa phụ thuộc dựa trên dữ liệu marker để chỉ vẽ lại khi marker thực sự đổi.
  const markersKey = markers
    .map((m) => `${m.id}:${m.position.lat},${m.position.lng}`)
    .join('|');

  const onLoad = useCallback((m: google.maps.Map) => setMap(m), []);
  const onUnmount = useCallback(() => setMap(null), []);

  // Tạo/cập nhật các AdvancedMarkerElement theo danh sách marker.
  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps?.marker) return;

    // Xoá marker cũ trước khi vẽ lại.
    markersRef.current.forEach((mk) => {
      mk.map = null;
    });
    markersRef.current = [];

    for (const m of markers) {
      const pin = new google.maps.marker.PinElement({
        background: '#33210d',
        borderColor: '#ffffff',
        glyphColor: '#ffffff',
        scale: 1.1,
      });
      const advanced = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: m.position,
        title: m.title,
        content: pin.element,
        gmpClickable: Boolean(onMarkerClick),
      });
      if (onMarkerClick) {
        advanced.addListener('gmp-click', () => onMarkerClick(m.id));
        advanced.addListener('click', () => onMarkerClick(m.id));
      }
      markersRef.current.push(advanced);
    }

    return () => {
      markersRef.current.forEach((mk) => {
        mk.map = null;
      });
      markersRef.current = [];
    };
    // markersKey thay cho `markers` để tránh vẽ lại không cần thiết.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, markersKey, onMarkerClick]);

  if (loadError) {
    return <OSMFallback center={center} height={height} />;
  }

  if (!isLoaded) {
    return (
      <div
        className="skeleton-shimmer rounded-xl border border-outline-variant"
        style={{ height }}
      />
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden border border-outline-variant"
      style={{ height }}
    >
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={{
          mapId: MAP_ID,
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
        onLoad={onLoad}
        onUnmount={onUnmount}
      />
    </div>
  );
}

function OSMFallback({ center, height }: { center: MapCoords; height: string }) {
  const delta = 0.018;
  const bbox = `${center.lng - delta},${center.lat - delta},${center.lng + delta},${center.lat + delta}`;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${center.lat},${center.lng}`;

  return (
    <div className="relative rounded-xl overflow-hidden border border-outline-variant" style={{ height }}>
      <iframe
        src={osmUrl}
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
        allowFullScreen
        loading="lazy"
        title="Bản đồ Nha Trang"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="absolute bottom-2 left-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 pointer-events-none">
        <span className="material-symbols-outlined text-secondary" style={{ fontSize: '14px' }}>map</span>
        <span className="text-[11px] font-medium text-on-surface-variant">OpenStreetMap</span>
      </div>
      <a
        href={`https://www.openstreetmap.org/?mlat=${center.lat}&mlon=${center.lng}#map=15/${center.lat}/${center.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-semibold text-primary hover:bg-primary-fixed transition-colors"
      >
        Mở rộng
        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>open_in_new</span>
      </a>
    </div>
  );
}
