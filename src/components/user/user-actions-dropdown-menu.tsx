import { useQueryClient } from "@tanstack/react-query";
import { UserCog } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import * as ActionsMenuCore from "@/components/actions-menu";
import { authClient } from "@/lib/auth/auth-client";
import { DeleteConfirmationDialog } from "../delete-confirmation-dialog";
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../ui/dropdown-menu";

interface UserActionsDropdownMenuProps {
  id: string;
}

export function UserActionsDropdownMenu({ id }: UserActionsDropdownMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  function deleteUser(userId: string) {
    startTransition(async () => {
      const { error } = await authClient.admin.removeUser({ userId });
      if (error) {
        toast.error("Failed to delete user", { description: error.message });
        return;
      }

      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowDeleteDialog(false);
    });
  }

  function changeUserRole(userId: string, role: "admin" | "read" | "write") {
    startTransition(async () => {
      if (userId === id) {
        toast.error("You cannot change your own role");
        return;
      }

      const { error } = await authClient.admin.setRole({ userId, role });
      if (error) {
        toast.error("Failed to change user role", { description: error.message });
        return;
      }

      toast.success("User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    });
  }

  return (
    <>
      <ActionsMenuCore.ActionsMenu>
        <ActionsMenuCore.ActionsMenuTriggerEllipsis />
        <ActionsMenuCore.ActionsContent>
          <ActionsMenuCore.ActionsMenuDeleteButton
            className="cursor-pointer text-destructive focus:text-destructive"
            disabled={isPending}
            onClick={() => setShowDeleteDialog(true)}
          />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="data-disabled:pointer-events-none data-disabled:opacity-50">
              <div className="mr-2 flex">
                <UserCog className="mr-2 size-4" />
                Change Role
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem className="cursor-pointer" onClick={() => changeUserRole(id, "admin")}>
                  Set Admin
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => changeUserRole(id, "read")}>
                  Set Read
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => changeUserRole(id, "write")}>
                  Set Write
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </ActionsMenuCore.ActionsContent>
      </ActionsMenuCore.ActionsMenu>
      <DeleteConfirmationDialog
        isPending={isPending}
        onConfirm={() => deleteUser(id)}
        onOpenChange={setShowDeleteDialog}
        open={showDeleteDialog}
      />
    </>
  );
}
