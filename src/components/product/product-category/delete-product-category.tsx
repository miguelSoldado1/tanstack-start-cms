import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { deleteProductCategory } from "@/server/server-functions/product-category-functions";
import { tryCatch } from "@/try-catch";

interface DeleteProductCategoryProps {
  id: number;
  productId: number;
}

export function DeleteProductCategory({ id, productId }: DeleteProductCategoryProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({ mutationFn: useServerFn(deleteProductCategory) });
  async function handleDelete() {
    const { error } = await tryCatch(mutation.mutateAsync({ data: { id, productId } }));
    if (error) {
      return toast.error("Failed to delete product category", { description: error.message });
    }

    queryClient.invalidateQueries({ queryKey: ["productCategories", productId] });
    toast.success("Product category deleted successfully");
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="size-4 cursor-pointer text-destructive focus:text-destructive"
            onClick={() => setOpen(true)}
            size="icon"
            variant="ghost"
          >
            <TrashIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
      <DeleteConfirmationDialog isPending={mutation.isPending} onConfirm={handleDelete} onOpenChange={setOpen} open={open} />
    </>
  );
}
