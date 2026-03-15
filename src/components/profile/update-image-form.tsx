import { type ClientUploadError, useUploadFiles } from "@better-upload/client";
import { CameraIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { type ChangeEvent, useEffectEvent, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/auth/user-avatar";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { ImageCropperDialog } from "@/components/image-cropper-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";
import { getCroppedImg, readFileAsDataURL } from "@/lib/image-utils";
import { tryCatch } from "@/try-catch";
import { Spinner } from "../ui/spinner";

interface UploadMetadata {
  imageUrl?: string;
}

interface UploadCompleteData {
  metadata?: UploadMetadata;
}

export function UpdateImageForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data } = authClient.useSession();
  const [isRemoving, startRemoveTransition] = useTransition();
  const [isUploading, startUploadTransition] = useTransition();
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
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

  const resetFileInput = useEffectEvent(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  });

  const { control } = useUploadFiles({
    route: "profileImage",
    onError: useEffectEvent((error: ClientUploadError) => {
      toast.error("Failed to upload image", { description: error.message });
    }),
    onUploadFail: useEffectEvent(() => {
      toast.error("Failed to upload image", { description: "The upload did not complete successfully." });
    }),
    onUploadComplete: useEffectEvent(async ({ metadata }: UploadCompleteData) => {
      const imageUrl = metadata?.imageUrl;

      if (!imageUrl) {
        toast.error("Failed to save image", { description: "The uploaded file URL was not returned." });
        return;
      }

      const { error } = await tryCatch(authClient.updateUser({ image: imageUrl }));
      if (error) {
        toast.error("Failed to update profile image", { description: error.message });
        return;
      }

      toast.success("Profile image updated successfully!");
    }),
  });

  const resetCropState = useEffectEvent(() => {
    setCropModalOpen(false);
    setImageSrc(undefined);
    setFileToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    resetFileInput();
  });

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await readFileAsDataURL(file);
    setImageSrc(dataUrl);
    setFileToCrop(file);
    setCropModalOpen(true);
  }

  async function handleCropConfirm() {
    if (!(imageSrc && croppedAreaPixels && fileToCrop)) return;

    const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, fileToCrop.name);
    resetCropState();
    startUploadTransition(async () => {
      await control.upload([croppedFile]);
    });
  }

  function handleRemoveImage() {
    if (!data?.user?.image) return;

    startRemoveTransition(async () => {
      const { error } = await tryCatch(authClient.updateUser({ image: null }));

      if (error) {
        toast.error("Failed to remove profile image", { description: error.message });
        return;
      }

      toast.success("Profile image removed successfully!");
    });
  }

  const isBusy = isRemoving || isUploading;

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CameraIcon className="size-5" />
          Profile Image
        </CardTitle>
        <CardDescription>
          Upload a new profile image or remove the current one. Images are cropped to a square.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {data?.user ? (
            <UserAvatar className="size-24 border" image={data.user.image} name={data.user.email} />
          ) : (
            <div className="size-24 animate-pulse rounded-full bg-muted" />
          )}
          <div className="space-y-3">
            <div className="space-y-1">
              <p className="font-medium text-sm">Current avatar</p>
              <p className="text-muted-foreground text-sm">
                PNG, JPG, and WebP work well. The uploaded image will replace the current one.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled={isBusy || !data?.user} onClick={() => inputRef.current?.click()} type="button">
                {isUploading ? <Spinner /> : <UploadIcon />}
                Upload New Image
              </Button>
              <Button
                disabled={isBusy || !data?.user?.image}
                onClick={() => setRemoveDialogOpen(true)}
                type="button"
                variant="destructive"
              >
                {isRemoving ? <Spinner /> : <Trash2Icon />}
                Remove Image
              </Button>
            </div>
          </div>
        </div>
        <input accept="image/*" className="hidden" onChange={handleFileChange} ref={inputRef} type="file" />
        <ImageCropperDialog
          aspect={1}
          crop={crop}
          image={imageSrc}
          onCancel={resetCropState}
          onConfirm={handleCropConfirm}
          onCropChange={setCrop}
          onCropComplete={(_area, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
          onZoomChange={setZoom}
          open={cropModalOpen}
          zoom={zoom}
        />
        <DeleteConfirmationDialog
          isPending={isRemoving}
          onConfirm={handleRemoveImage}
          onOpenChange={setRemoveDialogOpen}
          open={removeDialogOpen}
        />
      </CardContent>
    </Card>
  );
}
