import { useToast } from '@/hooks/use-toast';
// import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for handling product image uploads with enhanced compression
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useProductImage = (userId: string | undefined) => {
  const { toast } = useToast();

  /**
   * Progressive compression that guarantees file size under 10KB
   * @param file The original image file
   * @returns A promise that resolves to the compressed file
   */
  const compressImage = async (file: File): Promise<File> => {
    const MAX_SIZE_KB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;
    
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onerror = () => {
          console.error('FileReader error');
          reject(new Error('Failed to read file'));
        };
        
        reader.onload = (event) => {
          try {
            const img = new Image();
            img.onerror = () => {
              console.error('Image load error');
              reject(new Error('Failed to load image'));
            };
            
            img.onload = () => {
              try {
                // Progressive compression function
                const compressWithQuality = (width: number, height: number, quality: number): Promise<File> => {
                  return new Promise((resolveCompress) => {
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                      reject(new Error('Could not get canvas context'));
                      return;
                    }
                    
                    // Clear canvas and draw image
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to JPEG with specified quality
                    canvas.toBlob(
                      (blob) => {
                        if (!blob) {
                          reject(new Error('Could not compress image'));
                          return;
                        }
                        
                        const compressedFile = new File([blob], `${file.name.replace(/\.[^/.]+$/, '')}-optimized.jpg`, {
                          type: 'image/jpeg',
                          lastModified: Date.now(),
                        });
                        
                        resolveCompress(compressedFile);
                      },
                      'image/jpeg',
                      quality
                    );
                  });
                };
                
                // Progressive compression algorithm
                const progressiveCompress = async () => {
                  let { width, height } = img;
                  
                  // Start with reasonable dimensions and quality
                  const maxDimension = 400;
                  if (width > maxDimension || height > maxDimension) {
                    const aspectRatio = width / height;
                    if (width > height) {
                      width = maxDimension;
                      height = width / aspectRatio;
                    } else {
                      height = maxDimension;
                      width = height * aspectRatio;
                    }
                  }
                  
                  // Ensure dimensions are valid
                  width = Math.max(50, Math.floor(width));
                  height = Math.max(50, Math.floor(height));
                  
                  // Try different quality levels
                  const qualityLevels = [0.8, 0.6, 0.4, 0.3, 0.2, 0.1, 0.05, 0.02, 0.01];
                  
                  for (const quality of qualityLevels) {
                    const compressedFile = await compressWithQuality(width, height, quality);
                    
                    if (compressedFile.size <= MAX_SIZE_BYTES) {
                      console.log(`Image compression successful:`);
                      console.log(`  Original: ${(file.size / 1024).toFixed(1)}KB`);
                      console.log(`  Compressed: ${(compressedFile.size / 1024).toFixed(1)}KB`);
                      console.log(`  Reduction: ${((file.size - compressedFile.size) / file.size * 100).toFixed(1)}%`);
                      console.log(`  Dimensions: ${width}x${height}px`);
                      console.log(`  Quality: ${(quality * 100).toFixed(0)}%`);
                      
                      return compressedFile;
                    }
                  }
                  
                  // If still too large, reduce dimensions further
                  const dimensionReductions = [0.8, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2];
                  
                  for (const reduction of dimensionReductions) {
                    const newWidth = Math.max(50, Math.floor(width * reduction));
                    const newHeight = Math.max(50, Math.floor(height * reduction));
                    
                    for (const quality of [0.1, 0.05, 0.02, 0.01]) {
                      const compressedFile = await compressWithQuality(newWidth, newHeight, quality);
                      
                      if (compressedFile.size <= MAX_SIZE_BYTES) {
                        console.log(`Image compression successful with dimension reduction:`);
                        console.log(`  Original: ${(file.size / 1024).toFixed(1)}KB`);
                        console.log(`  Compressed: ${(compressedFile.size / 1024).toFixed(1)}KB`);
                        console.log(`  Reduction: ${((file.size - compressedFile.size) / file.size * 100).toFixed(1)}%`);
                        console.log(`  Dimensions: ${newWidth}x${newHeight}px`);
                        console.log(`  Quality: ${(quality * 100).toFixed(0)}%`);
                        
                        return compressedFile;
                      }
                    }
                  }
                  
                  // Final fallback - create a very small image
                  const finalFile = await compressWithQuality(50, 50, 0.01);
                  console.log(`Image compression fallback:`);
                  console.log(`  Original: ${(file.size / 1024).toFixed(1)}KB`);
                  console.log(`  Compressed: ${(finalFile.size / 1024).toFixed(1)}KB`);
                  console.log(`  Dimensions: 50x50px`);
                  
                  return finalFile;
                };
                
                progressiveCompress().then(resolve).catch(reject);
                
              } catch (error) {
                console.error('Canvas processing error:', error);
                reject(new Error('Failed to process image on canvas'));
              }
            };
            
            img.src = event.target?.result as string;
          } catch (error) {
            console.error('Image creation error:', error);
            reject(new Error('Failed to create image'));
          }
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('File reading setup error:', error);
        reject(new Error('Failed to setup file reader'));
      }
    });
  };

  /**
   * Additional optimization to remove EXIF data and metadata
   * @param file The image file to optimize
   * @returns Promise resolving to optimized file
   */
  const removeMetadata = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read file'));
        
        reader.onload = (event) => {
          try {
            const img = new Image();
            img.onerror = () => reject(new Error('Failed to load image'));
            
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  reject(new Error('Could not get canvas context'));
                  return;
                }
                
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob(
                  (blob) => {
                    if (!blob) {
                      reject(new Error('Could not process image'));
                      return;
                    }
                    
                    const cleanFile = new File([blob], file.name, {
                      type: file.type,
                      lastModified: Date.now(),
                    });
                    
                    resolve(cleanFile);
                  },
                  file.type,
                  0.95
                );
              } catch (error) {
                console.error('Metadata removal canvas error:', error);
                reject(new Error('Failed to process image'));
              }
            };
            
            img.src = event.target?.result as string;
          } catch (error) {
            console.error('Metadata removal image error:', error);
            reject(new Error('Failed to load image'));
          }
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Metadata removal setup error:', error);
        reject(new Error('Failed to setup file reader'));
      }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const uploadProductImage = async (file: File): Promise<string | null> => {
    console.warn("Image upload temporarily disabled during Supabase client removal.");
    toast({
        title: "Feature Unavailable",
        description: "Image uploads are being migrated to a new system.",
        variant: "default"
    });
    return null;
    /*
    try {
      // ... original upload logic ...
    } catch (error) { ... }
    */
  };

  return {
    uploadProductImage,
    compressImage, // Export for testing or direct usage if needed
    removeMetadata // Export metadata removal function
  };
};
