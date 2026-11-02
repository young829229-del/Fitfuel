/**
 * Utility to process photos selected directly from the user's gallery / camera roll.
 * Resizes large camera photos to an optimized web-friendly size (max 1000px)
 * and returns a clean base64 data URL.
 */
export async function processGalleryPhoto(file: File, maxWidth = 1000, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image from gallery.'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down if dimensions exceed maxWidth
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original data URL if canvas context unavailable
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Draw image onto canvas with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
