'use client';

import { useState, useActionState, startTransition } from 'react';
import Link from 'next/link';
import { updateCafeAction, deleteCafeAction } from '@/lib/actions';
import { uploadImagesToCloudinary } from '@/lib/cloudinaryClient';
import { NHA_TRANG_AREAS } from '@/lib/constants';
import LocationPicker from '@/components/LocationPicker';
import type { Cafe } from '@/lib/mockData';

type EditCafeState = { error?: string } | undefined;

export default function EditCafeClient({ cafe }: { cafe: Cafe }) {
  const [state, action, pending] = useActionState<EditCafeState, FormData>(
    updateCafeAction,
    undefined
  );

  const [name, setName] = useState(cafe.name);
  const [address, setAddress] = useState(cafe.address);
  const [district, setDistrict] = useState(cafe.district);
  const [description, setDescription] = useState(cafe.description);
  const [openHours, setOpenHours] = useState(cafe.openHours);
  const [phone, setPhone] = useState(cafe.phone ?? '');
  const [priceRange, setPriceRange] = useState(cafe.priceRange);
  const [tags, setTags] = useState(cafe.tags.join(', '));
  const [lat, setLat] = useState(String(cafe.location.lat));
  const [lng, setLng] = useState(String(cafe.location.lng));
  const [images, setImages] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Trạng thái upload ảnh lên Cloudinary từ trình duyệt (trước khi gọi Server Action).
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [submitError, setSubmitError] = useState('');

  function addFiles(list: FileList | File[] | null) {
    if (!list) return;
    const picked = Array.from(list).filter((f) => f.type.startsWith('image/'));
    setImages((prev) => [...prev, ...picked].slice(0, 5));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError('');

    // Nếu admin chọn ảnh mới: trình duyệt đẩy thẳng lên Cloudinary trước, lấy URL.
    // Bỏ trống -> gửi mảng rỗng -> Server Action giữ nguyên ảnh cũ.
    let imageUrls: string[] = [];
    if (images.length > 0) {
      setUploading(true);
      setUploadDone(0);
      setUploadTotal(images.length);
      try {
        imageUrls = await uploadImagesToCloudinary(images, (done, total) => {
          setUploadDone(done);
          setUploadTotal(total);
        });
      } catch (err) {
        setUploading(false);
        setSubmitError(
          `Tải ảnh lên Cloudinary thất bại: ${(err as Error).message} Vui lòng thử lại.`
        );
        return;
      }
      setUploading(false);
    }

    const fd = new FormData();
    fd.set('id', cafe.id);
    fd.set('name', name);
    fd.set('address', address);
    fd.set('district', district);
    fd.set('description', description);
    fd.set('openHours', openHours);
    fd.set('phone', phone);
    fd.set('priceRange', priceRange);
    fd.set('tags', tags);
    fd.set('lat', lat);
    fd.set('lng', lng);
    fd.set('imageUrls', JSON.stringify(imageUrls));
    startTransition(() => action(fd));
  }

  const inputClass =
    'rounded-xl border border-outline-variant bg-surface py-3 px-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all';

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 py-12 min-h-[calc(100vh-160px)]">
      <header className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Về bảng điều khiển
        </Link>
        <h1 className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Chỉnh sửa quán
        </h1>
        <p className="text-on-surface-variant text-sm">
          Cập nhật thông tin cho <span className="font-semibold text-primary">{cafe.name}</span>.
        </p>
      </header>

      <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm border border-outline-variant/30">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(state?.error || submitError) && (
            <div className="md:col-span-2 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
              {submitError || state?.error}
            </div>
          )}

          {uploading && (
            <div className="md:col-span-2 flex items-center gap-3 p-4 bg-primary-fixed/40 text-primary rounded-xl text-sm font-medium">
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              Đang tải ảnh lên hệ thống đám mây... [{uploadDone}/{uploadTotal}]
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-primary">Tên quán cà phê *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-primary">Khu vực *</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Chọn khu vực</option>
              {NHA_TRANG_AREAS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-primary">Địa chỉ *</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">location_on</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className={`${inputClass} w-full pl-12`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-primary">Mô tả quán *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-primary">Tọa độ bản đồ</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">LAT</span>
                <input value={lat} onChange={(e) => setLat(e.target.value)} className={`${inputClass} w-full pl-12`} />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">LNG</span>
                <input value={lng} onChange={(e) => setLng(e.target.value)} className={`${inputClass} w-full pl-12`} />
              </div>
            </div>
            <LocationPicker
              lat={Number(lat) || 12.2389}
              lng={Number(lng) || 109.1967}
              onChange={(la, ln) => {
                setLat(String(la));
                setLng(String(ln));
              }}
              height="224px"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-primary">Giờ mở cửa</label>
            <input value={openHours} onChange={(e) => setOpenHours(e.target.value)} className={inputClass} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-primary">Số điện thoại</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-primary">Mức giá</label>
            <div className="flex gap-2">
              {['$', '$$', '$$$'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriceRange(p)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                    priceRange === p
                      ? 'border-primary bg-primary-fixed text-on-primary-fixed-variant'
                      : 'border-outline-variant text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-primary">Thẻ (phân cách bằng dấu phẩy)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
          </div>

          {/* Hình ảnh (upload lên Cloudinary) */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-bold text-primary">Hình ảnh</label>

            {cafe.images.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {cafe.images.map((url, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-xl overflow-hidden border border-outline-variant"
                  >
                    <img
                      src={url}
                      alt={`Ảnh hiện tại ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                dragOver
                  ? 'border-primary bg-primary-fixed/40'
                  : 'border-outline-variant bg-surface-container-low hover:bg-surface-container hover:border-primary'
              }`}
            >
              <span className="material-symbols-outlined text-outline group-hover:text-primary text-4xl mb-1">add_a_photo</span>
              <p className="text-sm text-on-surface-variant text-center">
                Kéo-thả hoặc chọn ảnh mới để <span className="text-primary font-bold">thay thế</span> ảnh hiện tại
              </p>
              <p className="text-xs text-outline mt-1">Bỏ trống nếu muốn giữ ảnh cũ (tối đa 5 ảnh)</p>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-1">
                {images.map((file, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Ảnh mới ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-sm leading-none"
                      aria-label="Xoá ảnh"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save / Cancel */}
          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/30">
            <Link
              href="/admin"
              className="px-6 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container-high transition-all text-center"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={pending || uploading}
              className="px-8 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-60"
            >
              {uploading
                ? `Đang tải ảnh... [${uploadDone}/${uploadTotal}]`
                : pending
                ? 'Đang lưu...'
                : 'Lưu thay đổi'}
            </button>
          </div>
        </form>

        {/* Danger zone — separate form so it isn't nested inside the edit form */}
        <div className="mt-8 pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-error">Xóa quán</p>
            <p className="text-xs text-on-surface-variant">Thao tác này gỡ bỏ quán và toàn bộ đánh giá liên quan, không thể hoàn tác.</p>
          </div>
          <DeleteButton cafeId={cafe.id} />
        </div>
      </div>
    </main>
  );
}

function DeleteButton({ cafeId }: { cafeId: string }) {
  const [deleting, setDeleting] = useState(false);

  return (
    <form
      action={deleteCafeAction.bind(null, cafeId)}
      onSubmit={(e) => {
        if (!confirm('Xóa vĩnh viễn quán này khỏi hệ thống?')) {
          e.preventDefault();
          return;
        }
        setDeleting(true);
      }}
    >
      <button
        type="submit"
        disabled={deleting}
        className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl border border-error/40 text-error font-semibold text-sm hover:bg-error-container transition-all disabled:opacity-60"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
        {deleting ? 'Đang xóa...' : 'Xóa quán'}
      </button>
    </form>
  );
}
