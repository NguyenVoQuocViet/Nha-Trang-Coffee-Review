// Upload ảnh TRỰC TIẾP từ trình duyệt lên Cloudinary (unsigned upload).
//
// Vì sao? Trên Vercel, request body tới Serverless Function (gồm cả Server Action)
// bị giới hạn ~4.5MB. Gửi nhiều ảnh qua Server Action sẽ vượt giới hạn này và trả
// về lỗi 413 "Payload Too Large". Bằng cách đẩy thẳng file lên API công khai của
// Cloudinary, ảnh không còn đi qua server của ta; Server Action chỉ nhận lại danh
// sách URL (vài KB chữ) để lưu vào MongoDB.
//
// Yêu cầu hai biến môi trường công khai (NEXT_PUBLIC_*) ở cả local lẫn Vercel:
//   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME      — tên cloud (vd: "dxxxxxx")
//   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET   — preset ở chế độ Unsigned (vd: "ml_default")

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

/**
 * Đẩy một file ảnh lên Cloudinary và trả về `secure_url` tuyệt đối
 * (dạng https://res.cloudinary.com/...). Ném lỗi nếu thất bại.
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME) {
    throw new Error(
      'Thiếu biến môi trường NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME. Hãy thêm vào .env.local và cấu hình trên Vercel.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  let res: Response;
  try {
    res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
  } catch {
    throw new Error('Không kết nối được tới Cloudinary. Kiểm tra mạng và thử lại.');
  }

  if (!res.ok) {
    // Cloudinary trả lỗi dạng { error: { message } }; cố đọc cho rõ nguyên nhân.
    let message = `Cloudinary từ chối (HTTP ${res.status}).`;
    try {
      const data = await res.json();
      if (data?.error?.message) message = data.error.message;
    } catch {
      /* body không phải JSON — giữ message mặc định */
    }
    throw new Error(message);
  }

  const data = await res.json();
  if (!data?.secure_url) {
    throw new Error('Cloudinary không trả về secure_url.');
  }
  return data.secure_url as string;
}

/**
 * Upload lần lượt nhiều ảnh, gọi `onProgress(done, total)` sau mỗi ảnh để hiển thị
 * trạng thái "Đang tải ảnh... [1/5]". Trả về mảng các secure_url theo đúng thứ tự.
 * Nếu một ảnh lỗi, ném lỗi ngay (các ảnh trước đó đã lên Cloudinary, không rollback).
 */
export async function uploadImagesToCloudinary(
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    onProgress?.(i, files.length);
    const url = await uploadImageToCloudinary(files[i]);
    urls.push(url);
    onProgress?.(i + 1, files.length);
  }
  return urls;
}
