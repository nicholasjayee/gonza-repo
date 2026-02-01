import { generateReceiptVectorPDF } from './generateReceiptVectorPDF';




// Legacy function for non-receipt PDFs (keeping image-based approach for now)
const generateImagePDF = async (element: HTMLElement, filename: string) => {
  const { generateVectorPDF } = await import('./generateVectorPDF');
  await generateVectorPDF(element, {
    filename,
    orientation: 'landscape',
    format: 'a4',
    margins: { top: 10, right: 10, bottom: 10, left: 10 }
  });
};



export const generatePDF = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  try {
    // Basic implementation delegated to generateImagePDF
    // We ignore iOS specific logic here for simplicity as we are unifying on generateImagePDF
    // which wraps generateVectorPDF
    await generateImagePDF(element, filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Export the new vector PDF function for direct use
export { generateReceiptVectorPDF };
