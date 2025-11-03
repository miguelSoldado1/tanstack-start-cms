import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BasicInfoForm, basicInfoSchema } from "@/components/product/basic-info-form";
// import { ProductCategoryTable } from "@/components/product/product-categories/product-category-table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getProduct, updateProduct } from "@/server/server-functions/product-functions";
import { tryCatch } from "@/try-catch";
// import { ProductMultimedia } from "./product-multimedia/product-multimedia";
import { RecordInfoForm } from "./record-info-form";
import type z from "zod";

interface ProductEditFormProps {
  id: number;
}

export function ProductEditForm({ id }: ProductEditFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const getProductFn = useServerFn(getProduct);
  const query = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductFn({ data: { id } }),
  });

  const form = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema),
    values: {
      name: query.data?.name ?? "",
      description: query.data?.description ?? "",
      sku: query.data?.sku ?? "",
      price: query.data?.price ? Number(query.data.price) : 0,
    },
  });

  const mutation = useMutation({ mutationFn: useServerFn(updateProduct) });
  async function onSubmit(input: z.infer<typeof basicInfoSchema>) {
    const { error } = await tryCatch(mutation.mutateAsync({ data: { ...input, id } }));
    if (error) {
      return toast.error("Failed to update product", { description: error.message });
    }

    toast.success("Product updated successfully");

    queryClient.invalidateQueries({ queryKey: ["products"] });
    navigate({ to: "/product" });
  }

  return (
    <section className="container space-y-6 rounded-xl border p-6">
      <Accordion className="w-full" defaultValue={["basic-info", "product-multimedia"]} type="multiple">
        <AccordionItem className="mb-4 rounded-lg border" value="record-info">
          <AccordionTrigger className="px-4 py-3">Record Information</AccordionTrigger>
          <AccordionContent className="my-1 px-4 pb-4">
            <RecordInfoForm data={query.data} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem className="mb-4 rounded-lg border" value="basic-info">
          <AccordionTrigger className="px-4 py-3">Basic Information</AccordionTrigger>
          <AccordionContent className="my-1 px-4 pb-4">
            <BasicInfoForm disabled={query.isPending} form={form} onSubmit={onSubmit} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem className="mb-4 rounded-lg border" value="product-multimedia">
          <AccordionTrigger className="px-4 py-3">Product Multimedia</AccordionTrigger>
          <AccordionContent className="my-1 px-4 pb-4">{/* <ProductMultimedia productId={id} /> */}</AccordionContent>
        </AccordionItem>
        <AccordionItem className="mb-4 rounded-lg border" value="product-categories">
          <AccordionTrigger className="px-4 py-3">Product Categories</AccordionTrigger>
          <AccordionContent className="my-1 px-4 pb-4">{/* <ProductCategoryTable productId={id} /> */}</AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex justify-end gap-2">
        <Button onClick={() => navigate({ to: "/product" })} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={form.formState.isSubmitting} form="product-form" type="submit">
          Update Product
        </Button>
      </div>
    </section>
  );
}
