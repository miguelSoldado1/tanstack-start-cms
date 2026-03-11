import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import * as DialogCore from "@/components/ui/dialog";
import { type CategoryFormType, useCategoryForm } from "@/hooks/use-category-form";
import { createCategory } from "@/server/server-functions/category-functions";
import { tryCatch } from "@/try-catch";
import { Button } from "../ui/button";
import { Form, FormField } from "../ui/form";
import { FormItemWrapper } from "../ui/form-item-wrapper";
import { Input } from "../ui/input";

export function CategoryCreateForm() {
  const [open, setOpen] = useState(false);
  const form = useCategoryForm({ defaultValues: { name: "" } });
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({ mutationFn: useServerFn(createCategory) });

  async function onSubmit(data: CategoryFormType) {
    const { error } = await tryCatch(createCategoryMutation.mutateAsync({ data }));
    if (error) {
      return toast.error("Failed to create category", { description: error.message });
    }

    toast.success("Category created successfully");
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    setOpen(false);
    form.reset();
  }

  return (
    <DialogCore.Dialog onOpenChange={setOpen} open={open}>
      <DialogCore.DialogTrigger asChild>
        <Button>
          <PlusIcon className="size-4" />
          Add Category
        </Button>
      </DialogCore.DialogTrigger>
      <DialogCore.DialogContent>
        <DialogCore.DialogHeader>
          <DialogCore.DialogTitle>Add Category</DialogCore.DialogTitle>
          <DialogCore.DialogDescription>Create a new category.</DialogCore.DialogDescription>
        </DialogCore.DialogHeader>
        <Form {...form}>
          <form id="create-category-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItemWrapper label="Name">
                  <Input {...field} />
                </FormItemWrapper>
              )}
            />
          </form>
        </Form>
        <DialogCore.DialogFooter>
          <DialogCore.DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogCore.DialogClose>
          <Button disabled={form.formState.isSubmitting} form="create-category-form" type="submit">
            Save changes
          </Button>
        </DialogCore.DialogFooter>
      </DialogCore.DialogContent>
    </DialogCore.Dialog>
  );
}
