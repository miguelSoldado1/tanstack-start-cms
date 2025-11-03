import z from "zod";
import { Form, FormField } from "../ui/form";
import { FormItemWrapper } from "../ui/form-item-wrapper";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";

export const basicInfoSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(1000),
  sku: z.string().min(2).max(10),
  price: z.number().min(0.01).multipleOf(0.01),
});

interface BasicInfoFormProps {
  form: UseFormReturn<z.infer<typeof basicInfoSchema>>;
  onSubmit: SubmitHandler<z.infer<typeof basicInfoSchema>>;
  disabled?: boolean;
}

export function BasicInfoForm({ form, onSubmit, disabled }: BasicInfoFormProps) {
  return (
    <Form {...form}>
      <form className="space-y-4" id="product-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItemWrapper label="Name">
              <Input {...field} disabled={disabled} />
            </FormItemWrapper>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItemWrapper label="Description">
              <Textarea {...field} disabled={disabled} />
            </FormItemWrapper>
          )}
        />
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItemWrapper label="SKU">
              <Input {...field} disabled={disabled} />
            </FormItemWrapper>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItemWrapper label="Price">
              <div className="relative">
                <Input
                  className="peer ps-6"
                  min="0"
                  step="0.01"
                  type="number"
                  {...field}
                  disabled={disabled}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                />
                <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground text-sm peer-disabled:opacity-50">
                  $
                </span>
              </div>
            </FormItemWrapper>
          )}
        />
      </form>
    </Form>
  );
}
