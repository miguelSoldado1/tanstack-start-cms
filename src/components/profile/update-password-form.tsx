import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";
import { tryCatch } from "@/try-catch";
import { Form, FormField } from "../ui/form";
import { FormItemWrapper } from "../ui/form-item-wrapper";
import { PasswordInput } from "../ui/password-input";
import { Spinner } from "../ui/spinner";

const updatePasswordFormSchema = z.object({
  currentPassword: z.string().min(6).max(100),
  newPassword: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100),
});

export function UpdatePasswordForm() {
  const form = useForm<z.infer<typeof updatePasswordFormSchema>>({
    resolver: zodResolver(updatePasswordFormSchema),
  });

  async function handleUpdatePassword(data: z.infer<typeof updatePasswordFormSchema>) {
    if (data.newPassword !== data.confirmPassword) {
      return form.setError("confirmPassword", {
        message: "New passwords do not match",
      });
    }

    const { error } = await tryCatch(authClient.changePassword({ ...data, revokeOtherSessions: true }));
    if (error) {
      return toast.error("Failed to update password", {
        description: error.message,
      });
    }

    toast.success("Password updated successfully!");
    form.reset();
  }

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRoundIcon className="size-5" />
          Update Password
        </CardTitle>
        <CardDescription>
          Change your password to keep your account secure. Other sessions will be logged out.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleUpdatePassword)}>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItemWrapper label="Current Password">
                  <PasswordInput {...field} placeholder="Enter current password" />
                </FormItemWrapper>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItemWrapper label="New Password">
                  <PasswordInput {...field} placeholder="Enter new password" />
                </FormItemWrapper>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItemWrapper label="Confirm New Password">
                  <PasswordInput {...field} placeholder="Confirm new password" />
                </FormItemWrapper>
              )}
            />
            <div className="flex justify-end">
              <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting && <Spinner />}
                Update Password
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
