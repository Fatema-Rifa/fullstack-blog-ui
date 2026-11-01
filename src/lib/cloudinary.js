const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "wcf0swtj";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "blog_folder";
const ASSET_FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER || "blogs";

/**
 * Direct unsigned upload to Cloudinary from the client
 * @param {File|Blob|string} file - Image file or data URL
 * @param {string} [folder] - Optional destination folder in Cloudinary
 * @returns {Promise<{ url: string, publicId: string, width: number, height: number, format: string }>}
 */
export const uploadToCloudinary = async (file, folder = ASSET_FOLDER) => {
  if (!file) throw new Error("No file provided for upload");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  if (folder) {
    formData.append("folder", folder);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || "Failed to upload image to Cloudinary");
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  };
};

/**
 * Helper to build an optimized Cloudinary delivery URL with transformations
 * @param {string} url - Existing Cloudinary URL
 * @param {object} options - Options such as width, height, crop, quality
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
    return url;
  }

  const { width, height, crop = "fill", quality = "auto", format = "auto" } = options;

  const transforms = [`f_${format}`, `q_${quality}`];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  const transformString = transforms.join(",");

  // Insert transformations after /upload/
  return url.replace("/upload/", `/upload/${transformString}/`);
};

export default {
  uploadToCloudinary,
  getOptimizedImageUrl,
  CLOUD_NAME,
  UPLOAD_PRESET,
  ASSET_FOLDER,
};
