import { FrameConfig } from "./types";

/**
 * Hardcoded default frames have been removed.
 * All photobooth frames are now managed dynamically through the Admin Panel
 * (Admin > Photobooth > Tambah Template Bingkai PNG).
 *
 * The exported constant is kept as an empty array to prevent import errors
 * in places that still reference it as a fallback.
 */
export const FRAMES_CONFIG: FrameConfig[] = [];
