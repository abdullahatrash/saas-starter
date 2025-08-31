import imageCompression from 'browser-image-compression';
import { STUDIO_ERROR_MESSAGES } from './studio-errors';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  onProgress?: (progress: number) => void;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxSizeMB = 2,
    maxWidthOrHeight = 2048,
    useWebWorker = true,
    onProgress,
  } = options;

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
      onProgress,
    });

    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error(STUDIO_ERROR_MESSAGES.IMAGE_COMPRESSION_FAILED);
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: STUDIO_ERROR_MESSAGES.INVALID_FILE_TYPE,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: STUDIO_ERROR_MESSAGES.FILE_TOO_LARGE,
    };
  }

  return { valid: true };
}

export async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download image');
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  
  // Fallback for older browsers
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      resolve();
    } catch (error) {
      document.body.removeChild(textarea);
      reject(error);
    }
  });
}