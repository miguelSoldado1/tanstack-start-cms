import { Button } from "@/components/ui/button";
import * as DialogCore from "@/components/ui/dialog";
import { Spinner } from "./ui/spinner";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => unknown | undefined;
  isPending?: boolean;
}

export function DeleteConfirmationDialog({ open, onOpenChange, onConfirm, isPending }: DeleteConfirmationDialogProps) {
  async function handleConfirm() {
    await onConfirm();
    onOpenChange(false);
  }

  return (
    <DialogCore.Dialog onOpenChange={onOpenChange} open={open}>
      <DialogCore.DialogContent showCloseButton={false}>
        <DialogCore.DialogHeader>
          <DialogCore.DialogTitle>Are you absolutely sure?</DialogCore.DialogTitle>
          <DialogCore.DialogDescription>
            This action cannot be undone. This will permanently delete the item and remove it from our servers.
          </DialogCore.DialogDescription>
        </DialogCore.DialogHeader>
        <DialogCore.DialogFooter>
          <Button disabled={isPending} onClick={() => onOpenChange(false)} variant="outline">
            {isPending && <Spinner />}
            Cancel
          </Button>
          <Button disabled={isPending} onClick={handleConfirm} variant="destructive">
            {isPending && <Spinner />}
            Delete
          </Button>
        </DialogCore.DialogFooter>
      </DialogCore.DialogContent>
    </DialogCore.Dialog>
  );
}
