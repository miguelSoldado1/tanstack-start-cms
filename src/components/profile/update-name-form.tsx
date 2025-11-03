import { zodResolver } from "@hookform/resolvers/zod";
import { UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";
import { tryCatch } from "@/try-catch";
import { Form, FormField } from "../ui/form";
import { FormItemWrapper } from "../ui/form-item-wrapper";
import { Spinner } from "../ui/spinner";

const updateNameFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
});

export function UpdateNameForm() {
  const { data } = authClient.useSession();
  const form = useForm<z.infer<typeof updateNameFormSchema>>({
    values: { name: data?.user.name ?? "" },
    resolver: zodResolver(updateNameFormSchema),
  });

  async function handleUpdateName(data: z.infer<typeof updateNameFormSchema>) {
    const { error } = await tryCatch(authClient.updateUser({ name: data.name }));
    if (error) {
      return toast.error("Failed to update user", {
        description: error.message,
      });
    }

    toast.success("User updated successfully!");
  }

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="size-5" />
          Update Name
        </CardTitle>
        <CardDescription>Change your display name that appears on your profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleUpdateName)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItemWrapper label="Name">
                  <Input {...field} disabled={!data?.user} placeholder="Enter your name" />
                </FormItemWrapper>
              )}
            />
            <div className="flex justify-end">
              <Button disabled={form.formState.isSubmitting || !data?.user} type="submit">
                {form.formState.isSubmitting && <Spinner />}
                Update Name
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
