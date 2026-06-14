import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateId } from '../lib/helpers';

/**
 * Converts an image file to WebP format on the client side.
 * @param {File} file 
 * @param {number} quality 
 * @returns {Promise<File>}
 */
export const convertImageToWebP = (file, quality = 0.82, maxDimension = 2000) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }
    
    const imageURL = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(imageURL);
        reject(new Error('Browser tidak mendukung konversi gambar.'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(imageURL);
        
        if (!blob) {
          return reject(new Error('Konversi gambar ke WebP gagal.'));
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
 * Loads the lamejs library dynamically from CDN.
 * @returns {Promise<any>}
 */
const loadLamejs = () => {
  return new Promise((resolve, reject) => {
    if (window.lamejs) {
      resolve(window.lamejs);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.all.min.js';
    script.onload = () => resolve(window.lamejs);
    script.onerror = () => reject(new Error('Gagal memuat pustaka kompresi audio (lamejs) dari CDN.'));
    document.head.appendChild(script);
  });
};

/**
 * Decodes and compresses an audio file to low-bitrate MP3 client-side.
 * @param {File} file 
 * @param {number} targetBitrate
 * @param {number} targetSampleRate
 * @returns {Promise<File>}
 */
const compressAudioToMp3 = async (file, targetBitrate = 96, targetSampleRate = 22050) => {
  const lamejs = await loadLamejs();
  const arrayBuffer = await file.arrayBuffer();
  
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Browser tidak mendukung AudioContext untuk kompresi.');
  }
  
  const audioCtx = new AudioContextClass();
  let audioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch (err) {
    audioCtx.close().catch(() => {});
    throw err;
  }
  
  const originalSampleRate = audioBuffer.sampleRate;
  const originalSamples = audioBuffer.getChannelData(0); // Mono channel 0
  
  // Downsample PCM data if original rate is higher
  let pcmData;
  let sampleRate = originalSampleRate;
  if (originalSampleRate > targetSampleRate) {
    const ratio = originalSampleRate / targetSampleRate;
    const newLength = Math.round(originalSamples.length / ratio);
    pcmData = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      pcmData[i] = originalSamples[Math.round(i * ratio)];
    }
    sampleRate = targetSampleRate;
  } else {
    pcmData = originalSamples;
  }
  
  // Convert Float32Array (-1.0 to 1.0) to Int16Array (-32768 to 32767)
  const int16Samples = new Int16Array(pcmData.length);
  for (let i = 0; i < pcmData.length; i++) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    int16Samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, targetBitrate);
  const mp3Data = [];
  
  const sampleBlockSize = 1152;
  for (let i = 0; i < int16Samples.length; i += sampleBlockSize) {
    const sampleChunk = int16Samples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }
  
  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }
  
  audioCtx.close().catch(() => {});
  
  const blob = new Blob(mp3Data, { type: 'audio/mp3' });
  const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  return new File([blob], `${nameWithoutExt}_optimized.mp3`, {
    type: 'audio/mp3',
    lastModified: Date.now()
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
      } catch (conversionError) {
        setError(conversionError.message);
        setIsUploading(false);
        throw conversionError;
      }
    } else if (rawFile.type.startsWith('audio/') || rawFile.name.endsWith('.mp3')) {
      setProgress(15);
      try {
        file = await compressAudioToMp3(rawFile);
      } catch (audioError) {
        console.warn('Audio compression failed, uploading original:', audioError);
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
      const { error: uploadError } = await supabase.storage
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

/**
 * Custom hook for managing local image file selection and preview before uploading.
 * @param {string|null} initialUrl - The existing URL or emoji from the database.
 */
export function useImageUpload(initialUrl = null) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  // Synchronize initial value when parent form updates
  const setInitialValue = useCallback((val) => {
    setPreviewUrl(val);
    setFile(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);

      // Clean up previous temporary object URL to prevent memory leaks
      if (previewRef.current && previewRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(previewRef.current);
      }

      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      previewRef.current = url;
    }
  }, []);

  const handleRemove = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(initialUrl);
    setFileName(null);
    previewRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl, initialUrl]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewRef.current && previewRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  return {
    file,
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
    setInitialValue,
  };
}
