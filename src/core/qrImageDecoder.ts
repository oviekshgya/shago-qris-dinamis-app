import jsQR from 'jsqr';

const MAX_IMAGE_SIZE = 2200;

export async function decodeQrPayloadFromImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar QRIS.');
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    throw new Error('Browser tidak dapat membaca gambar QR.');
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const imageData = context.getImageData(0, 0, width, height);
  const decoded = jsQR(imageData.data, width, height);

  if (!decoded?.data) {
    throw new Error('QR tidak terbaca. Gunakan gambar yang jelas, tidak blur, dan QR terlihat penuh.');
  }

  return decoded.data.trim();
}
