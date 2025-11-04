import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BasicInfoForm, basicInfoSchema } from "@/components/product/basic-info-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { createProduct } from "@/server/server-functions/product-functions";
import { tryCatch } from "@/try-catch";
import { RecordInfoForm } from "./record-info-form";
import type z from "zod";

export function ProductCreateForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: 0,
    },
  });

  const mutation = useMutation({ mutationFn: useServerFn(createProduct) });
  async function onSubmit(input: z.infer<typeof basicInfoSchema>) {
    const { data: id, error } = await tryCatch(mutation.mutateAsync({ data: input }));
    if (error) {
      return toast.error("Failed to create product", { description: error.message });
    }

    toast.success("Product created successfully");
    queryClient.invalidateQueries({ queryKey: ["products"] });
    navigate({ to: `/product/edit/${id}` });
  }

  return (
    <section className="container space-y-6 rounded-xl border p-6">
      <Accordion className="w-full" defaultValue={["basic-info"]} type="multiple">
        <AccordionItem className="mb-4 rounded-lg border" value="record-info">
          <AccordionTrigger className="px-4 py-3">Record Information</AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <RecordInfoForm />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem className="mb-4 rounded-lg border" value="basic-info">
          <AccordionTrigger className="px-4 py-3">
            <div className="text-left">Basic Information</div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <BasicInfoForm form={form} onSubmit={onSubmit} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex justify-end gap-2">
        <Button onClick={() => navigate({ to: "/product" })} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={form.formState.isSubmitting} form="product-form" type="submit">
          Create Product
        </Button>
      </div>
    </section>
  );
}
