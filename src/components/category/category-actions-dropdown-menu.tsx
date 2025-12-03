import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import * as ActionsMenuCore from "@/components/actions-menu";
import { useDeleteEntity } from "@/hooks/use-delete-entity";
import { deleteCategory } from "@/server/server-functions/category-functions";
import { DeleteConfirmationDialog } from "../delete-confirmation-dialog";
import { EditCategoryDialog } from "./edit-category-dialog";

interface CategoryActionsDropdownMenuProps {
  id: number;
}

export function CategoryActionsDropdownMenu({ id }: CategoryActionsDropdownMenuProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const deleteCategoryMutation = useMutation({ mutationFn: useServerFn(deleteCategory) });
  const deleteCategoryAction = useDeleteEntity({
    mutateAsync: () => deleteCategoryMutation.mutateAsync({ data: { id } }),
    invalidate: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    entityName: "category",
    redirectHref: "/category",
  });

  return (
    <>
      <ActionsMenuCore.ActionsMenu>
        <ActionsMenuCore.ActionsMenuTriggerEllipsis />
        <ActionsMenuCore.ActionsContent>
          <ActionsMenuCore.ActionsMenuEditItemButton onClick={() => setShowEditDialog(true)} />
          <ActionsMenuCore.ActionsMenuDeleteButton onClick={() => setShowDeleteDialog(true)} />
        </ActionsMenuCore.ActionsContent>
      </ActionsMenuCore.ActionsMenu>
      <DeleteConfirmationDialog
        isPending={deleteCategoryMutation.isPending}
        onConfirm={deleteCategoryAction}
        onOpenChange={setShowDeleteDialog}
        open={showDeleteDialog}
      />
      <EditCategoryDialog categoryId={id} onOpenChange={setShowEditDialog} open={showEditDialog} />
    </>
  );
}
