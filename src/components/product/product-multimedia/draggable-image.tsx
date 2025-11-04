import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteEntity } from "@/hooks/use-delete-entity";
import { deleteProductMultimedia } from "@/server/server-functions/product-multimedia-functions";
import type { CSSProperties } from "react";
import type { productMultimedia } from "@/lib/database/schema";

interface DraggableImageProps {
  productImage: typeof productMultimedia.$inferSelect;
  invalidate: () => unknown;
}

export function DraggableImage({ productImage, invalidate }: DraggableImageProps) {
  const [open, setOpen] = useState(false);
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({ id: productImage.id });

  const mutation = useMutation({ mutationFn: useServerFn(deleteProductMultimedia) });
  const deleteMultimedia = useDeleteEntity({
    mutateAsync: () => mutation.mutateAsync({ data: { id: productImage.id } }),
    entityName: "product multimedia",
    invalidate,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging || mutation.isPending ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
  };

  return (
    <div
      className="relative h-40 w-40 cursor-pointer select-none overflow-hidden rounded-2xl shadow-md"
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      style={style}
    >
      <div className="absolute top-2 left-2 z-10 select-none rounded-md bg-secondary px-2 py-1 font-semibold text-secondary-foreground text-xs">
        {productImage.order}
      </div>
      <Button
        className="absolute top-2 right-2 z-10 size-6 cursor-pointer"
        onClick={() => setOpen(true)}
        size="icon"
        variant="destructive"
      >
        <Trash2Icon className="size-4" />
      </Button>
      {/** biome-ignore lint/correctness/useImageSize: <explanation> */}
      <img alt="" className="object-cover" src={productImage.url} />
      <DeleteConfirmationDialog
        isPending={mutation.isPending}
        onConfirm={() => deleteMultimedia()}
        onOpenChange={setOpen}
        open={open}
      />
    </div>
  );
}
