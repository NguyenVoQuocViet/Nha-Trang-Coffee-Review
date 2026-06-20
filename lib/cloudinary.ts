import { v2 as cloudinary } from 'cloudinary';

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

// Tên upload preset (đã đặt ở chế độ Unsigned trên Cloudinary).
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    '⚠️ Thiếu cấu hình Cloudinary. Hãy kiểm tra CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET trong .env.local'
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload một file ảnh (đọc dưới dạng Buffer) trực tiếp lên Cloudinary và trả về
 * đường dẫn URL tuyệt đối (secure_url, dạng https://res.cloudinary.com/...).
 *
 * Sử dụng `cloudinary.v2.uploader.upload` kèm `upload_preset: 'ml_default'`.
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  mimeType: string,
  folder = 'nhatrang-coffee'
): Promise<string> {
  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    upload_preset: CLOUDINARY_UPLOAD_PRESET,
    folder,
    resource_type: 'image',
  });
  return result.secure_url;
}

/**
 * Trích `public_id` từ một secure_url của Cloudinary để có thể xoá.
 * Ví dụ: https://res.cloudinary.com/<cloud>/image/upload/v123/nhatrang-coffee/abc.png
 *        -> nhatrang-coffee/abc
 * Trả về null nếu URL không phải của Cloudinary (vd ảnh Unsplash mặc định).
 */
export function publicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

/**
 * Xoá nhiều ảnh khỏi Cloudinary theo danh sách URL (bỏ qua URL không phải
 * Cloudinary). Chạy best-effort: lỗi xoá 1 ảnh không làm hỏng toàn bộ thao tác.
 */
export async function deleteImagesByUrl(urls: string[]): Promise<void> {
  for (const url of urls) {
    const publicId = publicIdFromUrl(url);
    if (!publicId) continue;
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (error) {
      console.error('⚠️ Không xoá được ảnh Cloudinary:', url, (error as Error).message);
    }
  }
}

export { cloudinary };
