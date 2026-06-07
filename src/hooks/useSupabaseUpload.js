import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateId } from '../lib/helpers';

/**
 * Converts an image file to WebP format on the client side.
 * @param {File} file 
 * @param {number} quality 
 * @returns {Promise<File>}
 */
const convertImageToWebP = (file, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }
    
    const imageURL = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(imageURL);
        
        if (!blob) {
          return reject(new Error('Canvas to blob conversion failed'));
        }
        
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const webpFile = new File([blob], `${nameWithoutExt}.webp`, {
          type: 'image/webp',
          lastModified: Date.now()
        });
        
        resolve(webpFile);
      }, 'image/webp', quality);
    };
    
    img.onerror = (err) => {
      URL.revokeObjectURL(imageURL);
      reject(err);
    };
    
    img.src = imageURL;
  });
};

/**
 * Custom hook for handling media uploads directly to Supabase Storage.
 * Includes simulated fallbacks for mock environments without active Supabase credentials.
 */
export function useSupabaseUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  /**
   * Upload file to bucket
   * @param {File} rawFile 
   * @param {string} bucketName 
   * @param {string} folderPath 
   * @returns {Promise<string>} Public URL of uploaded asset
   */
  const uploadFile = async (rawFile, bucketName = 'assets', folderPath = 'media') => {
    setIsUploading(true);
    setError(null);
    setProgress(5);

    let file = rawFile;
    if (rawFile.type.startsWith('image/')) {
      setProgress(15);
      try {
        file = await convertImageToWebP(rawFile);
      } catch (webpErr) {
        console.warn('WebP conversion failed, uploading raw file:', webpErr);
      }
    }
    setProgress(25);

    try {
      // Validate credentials exist; if not, do mock local simulation
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
      ) {
        // Simulate progress bar and mock base64/local URL upload
        setProgress(50);
        await new Promise((r) => setTimeout(r, 400));
        setProgress(80);
        await new Promise((r) => setTimeout(r, 300));
        setProgress(100);
        setIsUploading(false);

        // Return a mock object URL or high-quality placeholder image
        return URL.createObjectURL(file);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${generateId()}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;

      setProgress(40);

      // Perform upload
      const { error: uploadError, data } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      setProgress(85);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setProgress(100);
      setIsUploading(false);
      return publicUrl;
    } catch (err) {
      console.error('File upload failed:', err);
      setError(err.message || 'Something went wrong during file upload');
      setIsUploading(false);
      throw err;
    }
  };

  return {
    uploadFile,
    isUploading,
    error,
    progress,
  };
}
