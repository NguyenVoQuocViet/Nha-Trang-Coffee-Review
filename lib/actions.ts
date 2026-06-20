'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  validateCredentials,
  registerUser,
  setSession,
  clearSession,
  getSession,
} from './auth';
import {
  addReview,
  createCafe,
  updateCafe,
  deleteCafe,
  approveCafe,
  getCafeById,
} from './data';
import { uploadImageBuffer, deleteImagesByUrl } from './cloudinary';

function revalidateCafeSurfaces(cafeId?: string) {
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/explore');
  revalidatePath('/map');
  revalidatePath('/top-reviews');
  if (cafeId) revalidatePath(`/cafe/${cafeId}`);
}

/* --------------------------------- Auth ---------------------------------- */

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Vui lòng nhập email và mật khẩu.' };
  }

  let user;
  try {
    user = await validateCredentials(email, password);
  } catch (error) {
    console.error('loginAction error:', error);
    return { error: 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.' };
  }

  if (!user) {
    return { error: 'Email hoặc mật khẩu không đúng.' };
  }

  await setSession({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  redirect('/');
}

export async function registerAction(_prevState: unknown, formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.' };
  }
  if (password.length < 6) {
    return { error: 'Mật khẩu phải có ít nhất 6 ký tự.' };
  }

  let result;
  try {
    result = await registerUser(name, email, password);
  } catch (error) {
    console.error('registerAction error:', error);
    return { error: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.' };
  }

  if (!result.ok) {
    return { error: result.error };
  }

  await setSession({
    userId: result.user.id,
    role: result.user.role,
    name: result.user.name,
    email: result.user.email,
  });

  redirect('/');
}

export async function logoutAction() {
  await clearSession();
  redirect('/');
}

/* -------------------------------- Reviews -------------------------------- */

export async function addReviewAction(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Bạn cần đăng nhập để đánh giá.' };
  }

  const cafeId = formData.get('cafeId') as string;
  const rating = Number(formData.get('rating'));
  const comment = (formData.get('comment') as string)?.trim();

  if (!cafeId || !rating || !comment) {
    return { error: 'Vui lòng điền đầy đủ thông tin đánh giá.' };
  }

  if (rating < 1 || rating > 5) {
    return { error: 'Điểm đánh giá phải từ 1 đến 5.' };
  }

  try {
    await addReview({
      cafeId,
      userId: session.userId,
      userName: session.name,
      rating,
      comment,
    });
  } catch (error) {
    console.error('addReviewAction error:', error);
    return { error: 'Không thể lưu đánh giá. Vui lòng thử lại.' };
  }

  // addReview đã tự tính lại rating trung bình của quán.
  revalidateCafeSurfaces(cafeId);
  return { success: true };
}

/* --------------------------------- Cafes --------------------------------- */

async function uploadCafeImages(formData: FormData): Promise<string[]> {
  const files = formData
    .getAll('images')
    .filter((f): f is File => f instanceof File && f.size > 0);

  const urls: string[] = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImageBuffer(buffer, file.type);
    urls.push(url);
  }
  return urls;
}

export async function addCafeAction(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/');
  }

  const name = (formData.get('name') as string)?.trim();
  const address = (formData.get('address') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const district = (formData.get('district') as string)?.trim();
  const priceRange = (formData.get('priceRange') as string) || '$$';
  const openHours = (formData.get('openHours') as string) || '07:00 AM - 10:00 PM';
  const phone = (formData.get('phone') as string) || '';
  const lat = Number(formData.get('lat')) || 12.2388;
  const lng = Number(formData.get('lng')) || 109.1967;
  const tagsRaw = (formData.get('tags') as string) || '';
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

  if (!name || !address || !description || !district) {
    return { error: 'Vui lòng điền đầy đủ thông tin quán (gồm cả khu vực).' };
  }

  try {
    // 1) Upload từng ảnh lên Cloudinary, lấy về secure_url tuyệt đối.
    const images = await uploadCafeImages(formData);

    // 2) Lưu quán mới vào MongoDB với mảng URL ảnh từ Cloudinary.
    await createCafe({
      name,
      address,
      area: district,
      description,
      images,
      location: { lat, lng },
      tags,
      priceRange,
      openHours,
      phone,
      createdBy: session.userId,
      status: 'approved',
    });
  } catch (error) {
    console.error('addCafeAction error:', error);
    return { error: 'Không thể tạo quán. Vui lòng kiểm tra ảnh và thử lại.' };
  }

  // 3) Cập nhật cache rồi điều hướng an toàn về trang quản trị (hết lỗi 404).
  revalidateCafeSurfaces();
  redirect('/admin');
}

export async function updateCafeAction(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/');
  }

  const id = (formData.get('id') as string)?.trim();
  const name = (formData.get('name') as string)?.trim();
  const address = (formData.get('address') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const district = (formData.get('district') as string)?.trim();
  const priceRange = (formData.get('priceRange') as string) || '$$';
  const openHours = (formData.get('openHours') as string) || '07:00 AM - 10:00 PM';
  const phone = (formData.get('phone') as string) || '';
  const lat = Number(formData.get('lat'));
  const lng = Number(formData.get('lng'));
  const tagsRaw = (formData.get('tags') as string) || '';
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

  if (!id) redirect('/admin');
  if (!name || !address || !description || !district) {
    return { error: 'Vui lòng điền đầy đủ thông tin quán.' };
  }

  let updated;
  try {
    // Cho phép thêm ảnh mới khi chỉnh sửa (nếu admin chọn tệp).
    const newImages = await uploadCafeImages(formData);

    // Lưu lại ảnh cũ trước khi ghi đè để xoá khỏi Cloudinary sau đó.
    let oldImages: string[] = [];
    if (newImages.length > 0) {
      const current = await getCafeById(id);
      oldImages = current?.images ?? [];
    }

    updated = await updateCafe(id, {
      name,
      address,
      area: district,
      description,
      priceRange,
      openHours,
      phone,
      tags,
      location: {
        lat: Number.isFinite(lat) ? lat : 12.2388,
        lng: Number.isFinite(lng) ? lng : 109.1967,
      },
      ...(newImages.length > 0 ? { images: newImages } : {}),
    });

    // Thay ảnh thành công -> dọn ảnh cũ trên Cloudinary để không bị rác.
    if (updated && newImages.length > 0) {
      await deleteImagesByUrl(oldImages);
    }
  } catch (error) {
    console.error('updateCafeAction error:', error);
    return { error: 'Không thể cập nhật quán. Vui lòng thử lại.' };
  }

  if (!updated) {
    return { error: 'Không tìm thấy quán để cập nhật.' };
  }

  revalidateCafeSurfaces(id);
  redirect(`/cafe/${id}`);
}

export async function deleteCafeAction(cafeId: string): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/');
  }

  try {
    // Lấy ảnh của quán trước khi xoá để dọn luôn trên Cloudinary.
    const current = await getCafeById(cafeId);
    await deleteCafe(cafeId);
    if (current) await deleteImagesByUrl(current.images);
  } catch (error) {
    console.error('deleteCafeAction error:', error);
  }

  revalidateCafeSurfaces();
  redirect('/admin');
}

export async function approveCafeAction(cafeId: string): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== 'admin') return;

  try {
    await approveCafe(cafeId);
  } catch (error) {
    console.error('approveCafeAction error:', error);
  }

  revalidatePath('/admin');
  revalidatePath('/');
}
