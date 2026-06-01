import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateId } from '../lib/helpers';

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
   * @param {File} file 
   * @param {string} bucketName 
   * @param {string} folderPath 
   * @returns {Promise<string>} Public URL of uploaded asset
   */
  const uploadFile = async (file, bucketName = 'assets', folderPath = 'media') => {
    setIsUploading(true);
    setError(null);
    setProgress(10);

    try {
      // Validate credentials exist; if not, do mock local simulation
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
      ) {
        // Simulate progress bar and mock base64/local URL upload
        setProgress(40);
        await new Promise((r) => setTimeout(r, 600));
        setProgress(80);
        await new Promise((r) => setTimeout(r, 400));
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
