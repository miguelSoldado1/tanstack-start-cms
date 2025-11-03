import { useNavigate } from "@tanstack/react-router";
import { TrashIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";
import { tryCatch } from "@/try-catch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Spinner } from "../ui/spinner";

export function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  function handleDeleteAccount() {
    startTransition(async () => {
      const { error } = await tryCatch(authClient.deleteUser());
      if (error) {
        toast.error("Failed to delete account", { description: error.message });
        return;
      }

      toast.success("Account deleted successfully!");
      navigate({ to: "/sign-in" });
      setOpen(false);
    });
  }

  return (
    <Card className="w-full border-destructive bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <TrashIcon className="size-5" />
          Delete Account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-end">
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button disabled={isPending} variant="destructive">
              {isPending && <Spinner />}
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all your data from our
                servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button disabled={isPending} onClick={() => setOpen(false)} variant="outline">
                {isPending && <Spinner />}
                Cancel
              </Button>
              <Button
                className="bg-destructive hover:bg-destructive/90"
                disabled={isPending}
                onClick={handleDeleteAccount}
                variant="destructive"
              >
                Yes, delete my account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
