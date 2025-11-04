import { Loader2Icon, UploadIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface UploadDropzoneProps {
  isPending?: boolean;
  accept?: string;
  onFilesSelected: (files: File[]) => void;
}

export function UploadDropzone({ isPending, accept, onFilesSelected }: UploadDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    noClick: true,
    onDrop: (files: File[]) => {
      if (files.length > 0 && !isPending) {
        onFilesSelected(files);
      }
      if (inputRef.current) inputRef.current.value = "";
    },
  });

  return (
    <div className="size-40 rounded-xl border border-dashed bg-input/10">
      <label className="flex size-full cursor-pointer flex-col items-center justify-center p-2" {...getRootProps()}>
        <div className="my-2">
          {isPending ? <Loader2Icon className="size-6 animate-spin" /> : <UploadIcon className="size-6" />}
        </div>
        <div className="mt-1 space-y-1 text-center">
          <p className="font-semibold text-xs">Drag and drop files here</p>
          <p className="max-w-64 text-muted-foreground text-xs">You can upload 1 image. Each up to 5MB.</p>
        </div>
        <input {...getInputProps()} accept={accept} disabled={isPending} multiple={false} type="file" />
      </label>
      {isDragActive && (
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-background">
          <div className="flex size-full flex-col items-center justify-center rounded-lg bg-accent dark:bg-accent/30">
            <div className="my-2">
              <UploadIcon className="size-6" />
            </div>
            <p className="mt-3 font-semibold text-sm">Drop files here</p>
          </div>
        </div>
      )}
    </div>
  );
}
