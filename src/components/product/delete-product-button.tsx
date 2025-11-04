import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { useDeleteEntity } from "@/hooks/use-delete-entity";
import { deleteProduct, getProduct } from "@/server/server-functions/product-functions";
import { DeleteConfirmationDialog } from "../delete-confirmation-dialog";
import { Button } from "../ui/button";

interface DeleteProductButtonProps {
  id: number;
}

export function DeleteProductButton({ id }: DeleteProductButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const getProductFn = useServerFn(getProduct);
  const query = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductFn({ data: { id } }),
  });

  const mutation = useMutation({ mutationFn: useServerFn(deleteProduct) });
  const deleteProductAction = useDeleteEntity({
    mutateAsync: () => mutation.mutateAsync({ data: { id } }),
    invalidate: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
    entityName: "product",
    redirectHref: "/product",
  });

  return (
    <>
      <Button
        disabled={mutation.isPending || query.isPending}
        onClick={() => setShowDeleteDialog(true)}
        variant="destructive"
      >
        <TrashIcon className="size-4" />
        Delete Product
      </Button>
      <DeleteConfirmationDialog
        isPending={mutation.isPending}
        onConfirm={deleteProductAction}
        onOpenChange={setShowDeleteDialog}
        open={showDeleteDialog}
      />
    </>
  );
}
