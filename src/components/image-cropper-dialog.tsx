import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CropperProps } from "react-easy-crop";

interface ImageCropperDialogProps
  extends Pick<CropperProps, "image" | "crop" | "zoom" | "aspect" | "onCropChange" | "onZoomChange" | "onCropComplete"> {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ImageCropperDialog({ open, onCancel, onConfirm, image, ...cropperProps }: ImageCropperDialogProps) {
  return (
    <Dialog onOpenChange={onCancel} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="relative h-64 w-full">{image && <Cropper {...cropperProps} image={image} />}</div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={onConfirm}>Crop & Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
