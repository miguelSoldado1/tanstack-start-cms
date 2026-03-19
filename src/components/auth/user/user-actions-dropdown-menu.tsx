import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { EyeIcon, UserCog } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import * as ActionsMenuCore from "@/components/actions-menu";
import { appConfig } from "@/config/app";
import { authClient } from "@/lib/auth/auth-client";
import { DeleteConfirmationDialog } from "../../delete-confirmation-dialog";
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../../ui/dropdown-menu";

interface UserActionsDropdownMenuProps {
  id: string;
  role: string | null;
}

export function UserActionsDropdownMenu({ id, role }: UserActionsDropdownMenuProps) {
  const navigate = useNavigate();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { data: session, refetch } = authClient.useSession();

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
      if (userId === session?.user.id) {
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

  function impersonateUser(userId: string) {
    startTransition(async () => {
      if (userId === session?.user.id) {
        toast.error("You are already using this account");
        return;
      }

      if (role === "admin") {
        toast.error("Admin users cannot be previewed");
        return;
      }

      const { error } = await authClient.admin.impersonateUser({ userId });

      if (error) {
        toast.error("Failed to start preview", { description: error.message });
        return;
      }

      await refetch({ query: { disableCookieCache: true } });
      await router.invalidate();
      toast.success("Preview session started");
      navigate({ replace: true, to: appConfig.defaultAuthenticatedPath });
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
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isPending || id === session?.user.id || role === "admin"}
            onClick={() => impersonateUser(id)}
          >
            <EyeIcon />
            Preview Access
          </DropdownMenuItem>
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
