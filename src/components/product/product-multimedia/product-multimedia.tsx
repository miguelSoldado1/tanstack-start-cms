import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useUploadFiles } from "better-upload/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createProductMultimedia,
  getProductMultimediaById,
  reorderProductMultimedia,
} from "@/server/server-functions/product-multimedia-functions";
// import { trpc } from "@/lib/trpc/client";
import { tryCatch } from "@/try-catch";
import { UploadWithCropper } from "../../upload-with-cropper";
import { DragAndDropMedia } from "./drag-and-drop-media";

interface ProductMultimediaProps {
  productId: number;
}

export function ProductMultimedia({ productId }: ProductMultimediaProps) {
  const getProductMultimediaByIdFn = useServerFn(getProductMultimediaById);
  const query = useQuery({
    queryKey: ["productMultimedia", productId],
    queryFn: () => getProductMultimediaByIdFn({ data: { productId } }),
  });

  const [items, setItems] = useState(query.data ?? []);

  useEffect(() => {
    setItems(query.data ?? []);
  }, [query.data]);

  const createMutation = useMutation({ mutationFn: useServerFn(createProductMultimedia) });
  const reorderMutation = useMutation({ mutationFn: useServerFn(reorderProductMultimedia) });

  const { control } = useUploadFiles({
    route: "productMultimedia",
    onError: (error) => {
      toast.error("Something went wrong", { description: error.message });
    },
    onUploadFail: () => {
      toast.error("Something went wrong", { description: "Some or all files failed to upload" });
    },
    onUploadComplete: async (data) => {
      const multimedia = data.files.map((file) => ({ objectKey: file.objectKey }));
      const { error } = await tryCatch(createMutation.mutateAsync({ data: { multimedia, productId } }));
      if (error) {
        toast.error("Failed to upload files", { description: error.message });
        return;
      }

      toast.success("Files uploaded successfully");
      query.refetch();
    },
  });

  async function handleReorder() {
    const newOrderIds = items.map((item) => item.id);
    const { error } = await tryCatch(reorderMutation.mutateAsync({ data: { productId, newOrderIds } }));
    if (error) {
      return toast.error("Failed to reorder items", { description: error.message });
    }

    toast.success("Order updated successfully");
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,max-content))] gap-4">
        <UploadWithCropper onUpload={(file) => control.upload([file])} />
        {query.isPending ? (
          new Array(5).fill(null).map((_, index) => <Skeleton className="size-40" key={index} />)
        ) : (
          <DragAndDropMedia invalidate={() => query.refetch()} items={items} setItems={setItems} />
        )}
      </div>
      <div className="flex justify-end">
        <Button disabled={reorderMutation.isPending || query.isPending || items.length === 0} onClick={handleReorder}>
          Update Order
        </Button>
      </div>
    </div>
  );
}
