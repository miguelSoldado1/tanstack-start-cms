import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import * as DialogCore from "@/components/ui/dialog";
import { type CategoryFormType, useCategoryForm } from "@/hooks/use-category-form";
import { getCategory, updateCategory } from "@/server/server-functions/category-functions";
import { tryCatch } from "@/try-catch";
import { Button } from "../ui/button";
import { Form, FormField } from "../ui/form";
import { FormItemWrapper } from "../ui/form-item-wrapper";
import { Input } from "../ui/input";

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: number;
}

export function EditCategoryDialog({ open, onOpenChange, categoryId }: EditCategoryDialogProps) {
  const getCategoryFn = useServerFn(getCategory);
  const query = useQuery({ queryKey: ["category", categoryId], queryFn: () => getCategoryFn({ data: { id: categoryId } }) });
  const form = useCategoryForm({ values: { name: query.data?.name ?? "" } });
  const queryClient = useQueryClient();

  const mutation = useMutation({ mutationFn: useServerFn(updateCategory) });

  async function onSubmit(data: CategoryFormType) {
    const { error } = await tryCatch(mutation.mutateAsync({ data: { id: categoryId, ...data } }));
    if (error) {
      return toast.error("Failed to update category", { description: error.message });
    }

    toast.success("Category updated successfully");
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    onOpenChange(false);
  }

  return (
    <DialogCore.Dialog onOpenChange={onOpenChange} open={open}>
      <DialogCore.DialogContent>
        <DialogCore.DialogHeader>
          <DialogCore.DialogTitle>Edit Category</DialogCore.DialogTitle>
          <DialogCore.DialogDescription>Make changes to your category.</DialogCore.DialogDescription>
        </DialogCore.DialogHeader>
        <Form {...form}>
          <form id="edit-category-form" onSubmit={form.handleSubmit(onSubmit)}>
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
          <Button disabled={form.formState.isSubmitting || query.isPending} form="edit-category-form" type="submit">
            Save changes
          </Button>
        </DialogCore.DialogFooter>
      </DialogCore.DialogContent>
    </DialogCore.Dialog>
  );
}
