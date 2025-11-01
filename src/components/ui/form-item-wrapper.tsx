import { FormControl, FormItem, FormLabel, FormMessage } from "./form";
import type React from "react";

interface FormItemWrapperProps {
  label: string;
  children: React.ReactNode;
}

export function FormItemWrapper({ label, children }: FormItemWrapperProps) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>{children}</FormControl>
      <FormMessage />
    </FormItem>
  );
}
