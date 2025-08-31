export const STUDIO_ERROR_MESSAGES = {
  UPLOAD_FAILED: "Upload failed. Please check your internet connection and try again.",
  CREDITS_INSUFFICIENT: "You need credits to generate a preview. Buy credits to continue.",
  REPLICATE_ERROR: "AI generation failed. Your credit has been refunded. Please try again.",
  INVALID_IMAGE: "Please upload a valid image (JPG, PNG, or WebP under 10MB)",
  MISSING_IMAGES: "Please upload both body photo and design",
  GENERATION_FAILED: "Failed to generate preview. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  LOCALHOST_ERROR: "Replicate requires public URLs. Please deploy to production or use a tunnel service.",
  IMAGE_COMPRESSION_FAILED: "Failed to compress image. Please try a smaller file.",
  FILE_TOO_LARGE: "File is too large. Maximum size is 10MB.",
  INVALID_FILE_TYPE: "Invalid file type. Please upload JPG, PNG, or WebP images.",
} as const;

export const STUDIO_SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: "Image uploaded successfully",
  GENERATION_STARTED: "Generating your tattoo preview...",
  GENERATION_COMPLETE: "Preview generated successfully!",
  CREDIT_REFUNDED: "Credit has been refunded due to generation failure",
  IMAGE_DOWNLOADED: "Image downloaded successfully",
  LINK_COPIED: "Share link copied to clipboard",
} as const;

export const STUDIO_INFO_MESSAGES = {
  GENERATING: "This usually takes 30-60 seconds...",
  COMPRESSING: "Compressing image...",
  UPLOADING: "Uploading image...",
  PROCESSING: "Processing your request...",
} as const;

export class StudioError extends Error {
  constructor(
    message: string,
    public code: keyof typeof STUDIO_ERROR_MESSAGES,
    public details?: any
  ) {
    super(message);
    this.name = 'StudioError';
  }
}