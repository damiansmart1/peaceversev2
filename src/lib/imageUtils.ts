/**
 * Utility functions for image handling, compression, and resizing
 */

interface ImageResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

/**
 * Resize and compress an image file while maintaining aspect ratio
 * @param file - The image file to process
 * @param options - Resize and quality options
 * @returns Processed image file
 */
export async function resizeImage(
  file: File,
  options: ImageResizeOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    maxSizeMB = 2,
  } = options;

  // If file is already under size limit and not an image, return as-is
  if (!file.type.startsWith('image/') || file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob and then to file
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            // Create new file with original name
            const processedFile = new File(
              [blob],
              file.name,
              {
                type: file.type,
                lastModified: Date.now(),
              }
            );

            resolve(processedFile);
          },
          file.type,
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate and process uploaded image
 * @param file - The file to validate
 * @param maxSizeMB - Maximum allowed size in MB
 * @returns Processed file or throws error
 */
export async function processUploadedImage(
  file: File,
  maxSizeMB: number = 2
): Promise<File> {
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    // Not an image, check size only
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`File too large. Maximum size is ${maxSizeMB}MB`);
    }
    return file;
  }

  // For images, always resize/compress to ensure they fit within limits
  try {
    const processedFile = await resizeImage(file, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.85,
      maxSizeMB,
    });

    // If still too large after processing, increase compression
    if (processedFile.size > maxSizeMB * 1024 * 1024) {
      return await resizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.7,
        maxSizeMB,
      });
    }

    return processedFile;
  } catch (error) {
    throw new Error('Failed to process image: ' + (error as Error).message);
  }
}

/**
 * Get optimal thumbnail dimensions while maintaining aspect ratio
 */
export function getThumbnailDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 400,
  maxHeight: number = 400
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  if (width > maxWidth || height > maxHeight) {
    if (aspectRatio > 1) {
      // Landscape
      width = maxWidth;
      height = width / aspectRatio;
    } else {
      // Portrait
      height = maxHeight;
      width = height * aspectRatio;
    }
  }
  
  return { width: Math.round(width), height: Math.round(height) };
}
