import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import * as DialogCore from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createProductBundle } from "@/server/server-functions/product-bundle-functions";
import { getSelectProducts } from "@/server/server-functions/product-functions";
import { tryCatch } from "@/try-catch";
import { AsyncCombobox } from "../shared/async-combobox";
import { Button } from "../ui/button";

const productBundleFormSchema = z.object({
  primaryProductId: z.number(),
  bundledProductId: z.number(),
});

export function ProductBundleCreateForm() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof productBundleFormSchema>>({
    resolver: zodResolver(productBundleFormSchema),
  });

  const getSelectProductsFn = useServerFn(getSelectProducts);

  const mutation = useMutation({ mutationFn: useServerFn(createProductBundle) });
  async function onSubmit(data: z.infer<typeof productBundleFormSchema>) {
    const { error } = await tryCatch(mutation.mutateAsync({ data }));
    if (error) {
      return toast.error("Failed to create product bundle", { description: error.message });
    }

    toast.success("Product bundle created successfully");
    queryClient.invalidateQueries({ queryKey: ["productBundles"] });
    setOpen(false);
    form.reset();
  }

  return (
    <DialogCore.Dialog onOpenChange={setOpen} open={open}>
      <DialogCore.DialogTrigger asChild>
        <Button>
          <PlusIcon className="size-4" />
          Add Bundle
        </Button>
      </DialogCore.DialogTrigger>
      <DialogCore.DialogContent>
        <DialogCore.DialogHeader>
          <DialogCore.DialogTitle>Add Bundle</DialogCore.DialogTitle>
          <DialogCore.DialogDescription>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur gravida.
          </DialogCore.DialogDescription>
        </DialogCore.DialogHeader>
        <Form {...form}>
          <form className="space-y-4" id="create-bundle-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="primaryProductId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Product</FormLabel>
                  <FormControl>
                    <AsyncCombobox
                      emptyText="No products found."
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      placeholder="Search products..."
                      queryFn={({ search }) => getSelectProductsFn({ data: { search } })}
                      queryKey="select-products"
                      value={field.value ? String(field.value) : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bundledProductId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bundled Product</FormLabel>
                  <FormControl>
                    <AsyncCombobox
                      emptyText="No products found."
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                      placeholder="Search products..."
                      queryFn={({ search }) => getSelectProductsFn({ data: { search } })}
                      queryKey="select-products"
                      value={field.value ? String(field.value) : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogCore.DialogFooter>
          <DialogCore.DialogClose asChild>
            <Button disabled={form.formState.isSubmitting} variant="outline">
              Cancel
            </Button>
          </DialogCore.DialogClose>
          <Button disabled={form.formState.isSubmitting} form="create-bundle-form" type="submit">
            Save changes
          </Button>
        </DialogCore.DialogFooter>
      </DialogCore.DialogContent>
    </DialogCore.Dialog>
  );
}
