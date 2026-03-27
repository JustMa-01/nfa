// Firebase Storage Service
// Handles image uploads for travel packages

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './config';

/**
 * Upload multiple images to Firebase Storage under a given folder.
 * Returns an array of download URLs.
 *
 * @param files - Array of File objects to upload
 * @param folder - Storage folder path (e.g. "packages/xyz")
 * @param onProgress - Optional callback receiving 0-100 progress
 */
export const uploadImages = async (
  files: File[],
  folder: string,
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    return new Promise<string>((resolve, reject) => {
      const fileName = `${Date.now()}_${index}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  });

  return Promise.all(uploadPromises);
};

/**
 * Delete an image from Firebase Storage by its full download URL
 */
export const deleteImage = async (url: string): Promise<void> => {
  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
  } catch (err) {
    // If item doesn't exist, we ignore the error
    console.warn('Could not delete image:', err);
  }
};
