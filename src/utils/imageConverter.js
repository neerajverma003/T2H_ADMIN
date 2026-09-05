export const isImageFile = (file) => file?.type?.startsWith('image/');

export const convertImageFileToWebP = async (file, options = {}) => {
    const { quality = 0.90, maxDimension = 2560 } = options;
    if (!file || !isImageFile(file)) return file;
    if (file.type === 'image/webp') return file;

    try {
        const imageBitmap = await createImageBitmap(file);
        let width = imageBitmap.width;
        let height = imageBitmap.height;
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        if (scale < 1) {
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(imageBitmap, 0, 0, width, height);

        const cleanBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
        const fileName = `${cleanBaseName || 'image'}.webp`;

        // Prefer native canvas.toBlob for performance and lower memory usage
        const webpBlob = await new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/webp', quality);
        });

        if (webpBlob) {
            return new File([webpBlob], fileName, { type: 'image/webp' });
        }

        // Fallback: toDataURL
        const dataUrl = canvas.toDataURL('image/webp', quality);
        const fallbackBlob = await (await fetch(dataUrl)).blob();
        return new File([fallbackBlob], fileName, { type: 'image/webp' });
    } catch (err) {
        console.warn('Image conversion to WebP failed, uploading original file instead.', err);
        return file;
    }
};
