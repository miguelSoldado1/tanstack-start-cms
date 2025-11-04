import { useCallback, useState } from "react";
import { getCroppedImg, readFileAsDataURL } from "@/lib/image-utils";
import { ImageCropperDialog } from "./image-cropper-dialog";
import { UploadDropzone } from "./upload-dropzone";

export function UploadWithCropper({ onUpload }: { onUpload: (file: File) => void }) {
  const [isPending, setIsPending] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [fileToCrop, setFileToCrop] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    width: number;
    height: number;
    x: number;
    y: number;
  } | null>(null);

  async function handleFilesSelected(files: File[]) {
    const file = files[0];
    if (file.type.startsWith("image/")) {
      const dataUrl = await readFileAsDataURL(file);
      setImageSrc(dataUrl);
      setFileToCrop(file);
      setCropModalOpen(true);
    } else {
      setIsPending(true);
      onUpload(file);
      setIsPending(false);
    }
  }

  const handleCropComplete = useCallback(
    (_area: unknown, croppedPixels: { width: number; height: number; x: number; y: number }) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  function handleCropCancel() {
    setCropModalOpen(false);
    setImageSrc(undefined);
    setFileToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }

  async function handleCropConfirm() {
    if (!(imageSrc && croppedAreaPixels && fileToCrop)) return;
    setIsPending(true);
    const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, fileToCrop.name);
    onUpload(croppedFile);
    setIsPending(false);
    handleCropCancel();
  }

  return (
    <>
      <UploadDropzone accept="image/*" isPending={isPending} onFilesSelected={handleFilesSelected} />
      <ImageCropperDialog
        aspect={1}
        crop={crop}
        image={imageSrc}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
        onCropChange={setCrop}
        onCropComplete={handleCropComplete}
        onZoomChange={setZoom}
        open={cropModalOpen}
        zoom={zoom}
      />
    </>
  );
}
