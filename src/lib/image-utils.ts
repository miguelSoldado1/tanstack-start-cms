// Image utilities: crop and file reading

// Reads a file as a data URL (for images)
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Utility to crop image using canvas
// Returns a Promise<File>
export function getCroppedImg(
  imageSrc: string,
  crop: { width: number; height: number; x: number; y: number },
  fileName: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No canvas context");
      ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      canvas.toBlob((blob) => {
        if (!blob) return reject("Canvas is empty");
        resolve(new File([blob], fileName, { type: "image/jpeg" }));
      }, "image/jpeg");
    };
    image.onerror = (err) => reject(err);
  });
}
