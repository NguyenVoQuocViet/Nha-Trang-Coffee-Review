'use client';

import { useState } from 'react';
import Link from 'next/link';
import GoogleMapWidget from '@/components/GoogleMapWidget';
import CoffeeRating from '@/components/CoffeeRating';
import type { Cafe } from '@/lib/mockData';

export default function MapClient({ cafes }: { cafes: Cafe[] }) {
  const [selectedCafeId, setSelectedCafeId] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const filtered = cafes.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCafe = cafes.find((c) => c.id === selectedCafeId);

  const mapMarkers = filtered.map((c) => ({
    id: c.id,
    position: c.location,
    title: c.name,
  }));

  return (
    <main className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <div className="w-full lg:w-96 flex flex-col border-r border-outline-variant bg-surface-container-lowest overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-outline-variant">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-base">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="Tìm quán hoặc khu vực..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <p className="px-4 py-2.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/50 bg-surface-container-low">
          {filtered.length} quán gần đây
        </p>

        {/* Cafe list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((cafe) => (
            <button
              key={cafe.id}
              type="button"
              onClick={() => setSelectedCafeId(cafe.id)}
              className={`w-full flex gap-3 p-4 border-b border-outline-variant/40 text-left hover:bg-surface-container-low transition-all duration-150 ${
                selectedCafeId === cafe.id
                  ? 'bg-primary-fixed/30 border-l-4 border-l-primary pl-3'
                  : ''
              }`}
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 img-hover-zoom">
                <img className="w-full h-full object-cover" src={cafe.images[0]} alt={cafe.name} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-bold text-primary text-sm truncate">{cafe.name}</p>
                <p className="text-xs text-on-surface-variant truncate">{cafe.address}</p>
                <div className="flex items-center gap-2">
                  <CoffeeRating value={cafe.rating} size="sm" />
                  <span className="text-xs text-on-surface-variant">({cafe.reviewCount})</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected cafe quick-view */}
        {selectedCafe && (
          <div className="border-t-2 border-primary p-4 bg-primary-fixed/10 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src={selectedCafe.images[0]} alt={selectedCafe.name} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-primary text-sm truncate">{selectedCafe.name}</p>
                <p className="text-xs text-on-surface-variant truncate">{selectedCafe.address}</p>
              </div>
            </div>
            <Link
              href={`/cafe/${selectedCafe.id}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Xem chi tiết quán
            </Link>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[400px] lg:min-h-0">
        <GoogleMapWidget
          center={selectedCafe?.location}
          markers={mapMarkers}
          height="100%"
          zoom={selectedCafeId ? 15 : 13}
          onMarkerClick={setSelectedCafeId}
        />
      </div>
    </main>
  );
}
