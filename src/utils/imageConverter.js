export const isImageFile = (file) => file?.type?.startsWith('image/');

export const convertImageFileToWebP = async (file, options = {}) => {
    const { quality = 0.80, maxDimension = 2048 } = options;
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
        ctx.drawImage(imageBitmap, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/webp', quality);
        const webpBlob = await (await fetch(dataUrl)).blob();
        const cleanBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
        const fileName = `${cleanBaseName || 'image'}.webp`;

        return new File([webpBlob], fileName, { type: 'image/webp' });
    } catch (err) {
        console.warn('Image conversion to WebP failed, uploading original file instead.', err);
        return file;
    }
};
