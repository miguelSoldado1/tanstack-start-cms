import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import * as ActionsMenuCore from "@/components/actions-menu";
import { EntityAuditDialog } from "@/components/audit/entity-audit-dialog";
import { useDeleteEntity } from "@/hooks/use-delete-entity";
import { deleteProduct } from "@/server/server-functions/product-functions";
import { DeleteConfirmationDialog } from "../delete-confirmation-dialog";

interface ProductActionsDropdownMenuProps {
  id: number;
}

export function ProductActionsDropdownMenu({ id }: ProductActionsDropdownMenuProps) {
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({ mutationFn: useServerFn(deleteProduct) });
  const deleteProductAction = useDeleteEntity({
    mutateAsync: () => mutation.mutateAsync({ data: { id } }),
    invalidate: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
    entityName: "product",
  });

  return (
    <>
      <ActionsMenuCore.ActionsMenu>
        <ActionsMenuCore.ActionsMenuTriggerEllipsis />
        <ActionsMenuCore.ActionsContent>
          <ActionsMenuCore.ActionsMenuEditItemLink params={{ id: id.toString() }} to={"/product/edit/$id"} />
          <ActionsMenuCore.ActionsMenuAuditButton onClick={() => setShowAuditDialog(true)} />
          <ActionsMenuCore.ActionsMenuDeleteButton
            className="cursor-pointer text-destructive focus:text-destructive"
            disabled={mutation.isPending}
            onClick={() => setShowDeleteDialog(true)}
          />
        </ActionsMenuCore.ActionsContent>
      </ActionsMenuCore.ActionsMenu>
      <DeleteConfirmationDialog
        isPending={mutation.isPending}
        onConfirm={deleteProductAction}
        onOpenChange={setShowDeleteDialog}
        open={showDeleteDialog}
      />
      <EntityAuditDialog
        entityId={id.toString()}
        entityLabel="Product"
        entityType="product"
        onOpenChange={setShowAuditDialog}
        open={showAuditDialog}
      />
    </>
  );
}
