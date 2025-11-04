import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSelectCategories } from "@/server/server-functions/category-functions";
import { createProductCategory } from "@/server/server-functions/product-category-functions";
import { tryCatch } from "@/try-catch";

const productCategoryFormSchema = z.object({
  category: z.string(),
});

interface AddProductCategoryProps {
  productId: number;
  existingCategories: number[];
}

export function AddProductCategory({ productId, existingCategories }: AddProductCategoryProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof productCategoryFormSchema>>({
    resolver: zodResolver(productCategoryFormSchema),
    defaultValues: {
      category: "",
    },
  });

  const getSelectCategoriesFn = useServerFn(getSelectCategories);
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: getSelectCategoriesFn,
  });

  const mutation = useMutation({ mutationFn: useServerFn(createProductCategory) });
  async function onSubmit(data: z.infer<typeof productCategoryFormSchema>) {
    const { error } = await tryCatch(mutation.mutateAsync({ data: { productId, categoryId: Number(data.category) } }));
    if (error) {
      return toast.error("Failed to add product category", { description: error.message });
    }

    queryClient.invalidateQueries({ queryKey: ["productCategories", productId] });
    toast.success("Product category added successfully");
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="size-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>Add a new product category</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" id="add-category-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select defaultValue={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {query.data?.map((option) => (
                        <SelectItem
                          disabled={existingCategories.includes(Number(option.value))}
                          key={option.value}
                          value={option.value.toString()}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={form.formState.isSubmitting} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={form.formState.isSubmitting} form="add-category-form" type="submit">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
