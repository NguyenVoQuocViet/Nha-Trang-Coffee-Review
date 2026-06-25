'use client';

import { useState, useActionState, startTransition } from 'react';
import { addCafeAction } from '@/lib/actions';
import { uploadImagesToCloudinary } from '@/lib/cloudinaryClient';
import { NHA_TRANG_AREAS } from '@/lib/constants';
import LocationPicker from '@/components/LocationPicker';

type AddCafeState = { error?: string } | undefined;

const DISTRICTS = NHA_TRANG_AREAS;

const STEP_LABELS = ['Thông tin cơ bản', 'Chi tiết & Hình ảnh', 'Xác nhận'];

// Ảnh được upload TRỰC TIẾP từ trình duyệt lên Cloudinary (không qua Server Action),
// nên không còn dính giới hạn ~4.5MB body của Vercel. Cloudinary unsigned preset
// mặc định cho tối đa 10MB/ảnh, nên giữ MAX_FILE_MB = 10 cho khớp.
const MAX_IMAGES = 5;
const MAX_FILE_MB = 10;

export default function AddCafeClient() {
  const [step, setStep] = useState(0);
  const [state, action, pending] = useActionState<AddCafeState, FormData>(addCafeAction, undefined);

  // Form fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [openHours, setOpenHours] = useState('07:00 AM - 10:00 PM');
  const [phone, setPhone] = useState('');
  const [priceRange, setPriceRange] = useState('$$');
  const [tags, setTags] = useState('');
  const [lat, setLat] = useState('12.2389');
  const [lng, setLng] = useState('109.1967');
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Trạng thái upload ảnh lên Cloudinary từ trình duyệt (trước khi gọi Server Action).
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [submitError, setSubmitError] = useState('');

  function addFiles(list: FileList | File[] | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const onlyImages = incoming.filter((f) => f.type.startsWith('image/'));
    const valid = onlyImages.filter((f) => f.size <= MAX_FILE_MB * 1024 * 1024);
    const tooLargeCount = onlyImages.length - valid.length;

    setImages((prev) => {
      const merged = [...prev, ...valid];

      const msgs: string[] = [];
      if (onlyImages.length < incoming.length) msgs.push('Chỉ chấp nhận tệp hình ảnh.');
      if (tooLargeCount > 0) msgs.push(`Mỗi ảnh tối đa ${MAX_FILE_MB}MB (đã bỏ qua ${tooLargeCount} ảnh quá lớn).`);
      if (merged.length > MAX_IMAGES) msgs.push(`Chỉ được tải lên tối đa ${MAX_IMAGES} ảnh.`);
      setImageError(msgs.join(' '));

      return merged.slice(0, MAX_IMAGES);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError('');

    // 1) Upload ảnh thẳng từ trình duyệt lên Cloudinary, thu lại mảng secure_url.
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

    // 2) Gửi Server Action với dữ liệu chữ + mảng URL ảnh (nhẹ, vài KB).
    const fd = new FormData();
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

  const progressPct = step === 0 ? '3%' : step === 1 ? '50%' : '100%';

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 py-12 min-h-[calc(100vh-160px)]">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Thêm Quán Mới
        </h1>
        <p className="text-on-surface-variant text-sm">
          Chia sẻ những không gian cà phê tuyệt vời nhất tại Nha Trang với cộng đồng.
        </p>
      </header>

      {/* Progress Stepper */}
      <div className="flex justify-between items-center mb-12 px-4 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-variant -z-10 -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500"
          style={{ width: progressPct }}
        />
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition-all text-sm ${
                i < step
                  ? 'bg-secondary-container text-on-secondary-container'
                  : i === step
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-variant text-on-surface-variant'
              }`}
            >
              {i < step ? (
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check
                </span>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs font-semibold hidden md:block ${
                i === step ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-12 shadow-sm border border-outline-variant/30">
        <form onSubmit={handleSubmit} className="space-y-8">
          {(state?.error || submitError) && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium">
              {submitError || state?.error}
            </div>
          )}

          {uploading && (
            <div className="flex items-center gap-3 p-4 bg-primary-fixed/40 text-primary rounded-xl text-sm font-medium">
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              Đang tải ảnh lên hệ thống đám mây... [{uploadDone}/{uploadTotal}]
            </div>
          )}

          {/* Step 1 */}
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-primary">Tên quán cà phê *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ví dụ: Coastal Brew & Sea"
                  className="rounded-xl border border-outline-variant bg-surface py-3 px-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-primary">Khu vực *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  className="rounded-xl border border-outline-variant bg-surface py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="">Chọn khu vực</option>
                  {DISTRICTS.map((d) => (
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
                    placeholder="Nhập địa chỉ chi tiết tại Nha Trang"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-primary">Tọa độ bản đồ</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">LAT</span>
                    <input
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="12.2389"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">LNG</span>
                    <input
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="109.1967"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant bg-surface text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant">Tọa độ mặc định: trung tâm Nha Trang (12.2389, 109.1967)</p>
              </div>

              {/* Bản đồ chọn vị trí (nhấp để ghim, đồng bộ với ô tọa độ ở trên) */}
              <div className="md:col-span-2">
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
            </div>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-primary">Mô tả quán *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Kể về phong cách, hương vị cà phê và trải nghiệm đặc biệt..."
                  rows={4}
                  className="rounded-xl border border-outline-variant bg-surface py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-primary">Giờ mở cửa</label>
                <input
                  value={openHours}
                  onChange={(e) => setOpenHours(e.target.value)}
                  placeholder="07:00 AM - 10:00 PM"
                  className="rounded-xl border border-outline-variant bg-surface py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-primary">Số điện thoại</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+84 xxx xxx xxx"
                  className="rounded-xl border border-outline-variant bg-surface py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                />
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
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Cold Brew, Beach View, WiFi, Quiet Zone"
                  className="rounded-xl border border-outline-variant bg-surface py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>

              {/* Image upload (trình duyệt đẩy thẳng lên Cloudinary khi submit) */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-primary">Hình ảnh (tối đa 5 ảnh)</label>
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
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                    dragOver
                      ? 'border-primary bg-primary-fixed/40'
                      : 'border-outline-variant bg-surface-container-low hover:bg-surface-container hover:border-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-outline group-hover:text-primary text-5xl mb-2">add_a_photo</span>
                  <p className="text-sm text-on-surface-variant text-center">
                    Kéo và thả ảnh vào đây hoặc <span className="text-primary font-bold">chọn tệp</span>
                  </p>
                  <p className="text-xs text-outline mt-1">Hỗ trợ JPG, PNG (tối đa {MAX_FILE_MB}MB mỗi ảnh, {MAX_IMAGES} ảnh)</p>
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

                {imageError && (
                  <p className="text-xs font-medium text-error">{imageError}</p>
                )}

                {images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {images.map((file, i) => (
                      <div
                        key={`${file.name}-${i}`}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-outline-variant"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Ảnh xem trước ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImages((prev) => prev.filter((_, idx) => idx !== i));
                            setImageError('');
                          }}
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
            </div>
          )}

          {/* Step 3: Review */}
          {step === 2 && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-20 h-20 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Sẵn sàng gửi bài!
              </h3>
              <p className="text-on-surface-variant text-sm max-w-md mb-8">
                Vui lòng kiểm tra lại thông tin. Đội ngũ Nha Trang Coffee Review sẽ phê duyệt quán của bạn trong vòng 24h.
              </p>
              <div className="w-full max-w-lg text-left space-y-3 bg-surface-container-low p-6 rounded-2xl">
                {[
                  { label: 'Tên quán', value: name || '—' },
                  { label: 'Địa chỉ', value: address || '—' },
                  { label: 'Khu vực', value: district || '—' },
                  { label: 'Mức giá', value: priceRange },
                  { label: 'Giờ mở cửa', value: openHours },
                  { label: 'Số ảnh', value: `${images.length} ảnh` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between border-b border-outline-variant/30 pb-2">
                    <span className="text-on-surface-variant text-sm">{label}:</span>
                    <span className="font-bold text-primary text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-outline-variant/30">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-8 py-3 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-all"
              >
                Quay lại
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 0 && (!name.trim() || !address.trim() || !district)) return;
                  if (step === 1 && !description.trim()) return;
                  setStep(step + 1);
                }}
                className="px-8 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all"
              >
                Tiếp theo
              </button>
            ) : (
              <button
                type="submit"
                disabled={pending || uploading}
                className="px-8 py-3 rounded-xl bg-secondary text-on-secondary font-semibold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-60"
              >
                {uploading
                  ? `Đang tải ảnh... [${uploadDone}/${uploadTotal}]`
                  : pending
                  ? 'Đang gửi...'
                  : 'Gửi yêu cầu'}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
