import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { useDeleteEntity } from "@/hooks/use-delete-entity";
import { deleteProductBundle } from "@/server/server-functions/product-bundle-functions";
import { DeleteConfirmationDialog } from "../delete-confirmation-dialog";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface DeleteProductBundleProps {
  id: number;
}

export function DeleteProductBundle({ id }: DeleteProductBundleProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({ mutationFn: useServerFn(deleteProductBundle) });
  const deleteProductAction = useDeleteEntity({
    mutateAsync: () => mutation.mutateAsync({ data: { id } }),
    invalidate: () => queryClient.invalidateQueries({ queryKey: ["productBundles"] }),
    entityName: "product bundle",
  });

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="size-4 cursor-pointer text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
            size="icon"
            variant="ghost"
          >
            <TrashIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
      <DeleteConfirmationDialog
        isPending={mutation.isPending}
        onConfirm={deleteProductAction}
        onOpenChange={setShowDeleteDialog}
        open={showDeleteDialog}
      />
    </>
  );
}
