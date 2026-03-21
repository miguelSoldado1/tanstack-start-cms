import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import * as ActionsMenuCore from "@/components/actions-menu";
import { EntityAuditDialog } from "@/components/audit/entity-audit-dialog";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { useDeleteEntity } from "@/hooks/use-delete-entity";
import { deleteProductBundle } from "@/server/server-functions/product-bundle-functions";

interface ProductBundleActionsDropdownMenuProps {
  id: number;
}

export function ProductBundleActionsDropdownMenu({ id }: ProductBundleActionsDropdownMenuProps) {
  const [showAuditDialog, setShowAuditDialog] = useState(false);
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
      <ActionsMenuCore.ActionsMenu>
        <ActionsMenuCore.ActionsMenuTriggerEllipsis />
        <ActionsMenuCore.ActionsContent>
          <ActionsMenuCore.ActionsMenuAuditButton onClick={() => setShowAuditDialog(true)} />
          <ActionsMenuCore.ActionsMenuDeleteButton onClick={() => setShowDeleteDialog(true)} />
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
        entityLabel="Product bundle"
        entityType="productBundle"
        onOpenChange={setShowAuditDialog}
        open={showAuditDialog}
      />
    </>
  );
}
