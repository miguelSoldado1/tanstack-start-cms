import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import type { UseFormProps } from "react-hook-form";

const categoryForm = z.object({
  name: z.string().min(2).max(100),
});

export function useCategoryForm(props: UseFormProps<z.infer<typeof categoryForm>>) {
  return useForm<z.infer<typeof categoryForm>>({
    resolver: zodResolver(categoryForm),
    ...props,
  });
}

export type CategoryFormType = z.infer<typeof categoryForm>;
