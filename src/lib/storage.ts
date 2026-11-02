import { storage } from './firebase';
import { ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';

/**
 * Uploads an image file or optimized base64 Data URL to Firebase Storage.
 * Returns the permanent HTTPS download URL from Firebase Storage.
 * If Storage is not provisioned or network fails, falls back gracefully to the data URL.
 */
export async function uploadImageToStorage(
  fileOrDataUrl: File | string,
  folder = 'products'
): Promise<string> {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  try {
    if (typeof fileOrDataUrl === 'string') {
      // It's a Data URL
      if (fileOrDataUrl.startsWith('data:image')) {
        const fileName = `${folder}/${timestamp}_${randomSuffix}.jpg`;
        const storageRef = ref(storage, fileName);
        await uploadString(storageRef, fileOrDataUrl, 'data_url');
        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
      }
      // If already a remote URL (http:// or https:// or /assets/...), return as is
      return fileOrDataUrl;
    } else {
      // It's a File object from device gallery
      const extension = fileOrDataUrl.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${timestamp}_${randomSuffix}.${extension}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, fileOrDataUrl);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    }
  } catch (error) {
    console.warn('Firebase Storage upload failed; falling back to optimized inline format:', error);
    if (typeof fileOrDataUrl === 'string') {
      return fileOrDataUrl;
    }
    // Convert file to base64 fallback
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(fileOrDataUrl);
    });
  }
}
