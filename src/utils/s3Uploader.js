import axios from 'axios';
import { apiClient } from '../stores/authStores';
import { convertImageFileToWebP } from './imageConverter';

/**
 * Uploads a file to S3 via a presigned URL from the backend.
 *
 * @param {File} file - The file object to upload
 * @param {Object} options - Options for the upload
 * @param {string} options.type - The folder category (e.g., "templates", "blogs")
 * @param {string} options.title - Used to help name the file (optional)
 * @param {string} options.fileType - Sub-folder type (e.g., "images", "videos")
 * @returns {{ s3Key: string, publicUrl: string }}
 */
export const uploadFileToS3 = async (file, { type = 'misc', title = '', fileType = 'images' } = {}) => {
  const uploadFile = await convertImageFileToWebP(file);

  // Step 1: Get a presigned URL from our backend
  const presignedRes = await apiClient.post('/admin/generate-presigned-url', {
    fileName: uploadFile.name,
    fileType: uploadFile.type,
    folder: `${type}/${fileType}`,
  });

  const { uploadUrl, key } = presignedRes.data;

  // Step 2: PUT the file directly to S3 using the presigned URL
  await axios.put(uploadUrl, uploadFile, {
    headers: { 'Content-Type': uploadFile.type },
  });

  // Step 3: Build the public CDN URL
  const cdnBase = import.meta.env.VITE_CDN_URL?.trim() || 'https://media.trip2honeymoon.com';
  const publicUrl = `${cdnBase}/${key}`;

  return { s3Key: key, publicUrl };
};
