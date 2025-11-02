import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldSeparator } from "@/components/ui/field";
import { Form, FormField } from "@/components/ui/form";
import { FormItemWrapper } from "@/components/ui/form-item-wrapper";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth/auth-client";
import { AuthHeader, AuthHeaderDescription, AuthHeaderTitle } from "./auth-header";
import { AuthSocialProviders } from "./auth-social-providers";

const formSchema = z.object({
  email: z.email(),
  name: z.string().min(4).max(64),
  password: z.string().min(8).max(128),
});

export function SignUpForm() {
  const navigate = useNavigate();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const { error } = await authClient.signUp.email(data);
    if (error) {
      return toast.error(error.message || "An error occurred while signing up.");
    }

    navigate({ to: "/" });
  }

  const isFormSubmitting = form.formState.isSubmitting || isSigningUp;

  return (
    <div className="flex flex-col gap-4">
      <AuthHeader>
        <AuthHeaderTitle>Welcome to Acme Inc</AuthHeaderTitle>
        <AuthHeaderDescription>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lobortis magna ac tortor ullamcorper malesuada.
        </AuthHeaderDescription>
      </AuthHeader>
      <Form {...form}>
        <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItemWrapper label="Email">
                <Input {...field} disabled={isFormSubmitting} placeholder="email@acme.com" type="email" />
              </FormItemWrapper>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItemWrapper label="Name">
                <Input {...field} disabled={isFormSubmitting} placeholder="John Doe" type="text" />
              </FormItemWrapper>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItemWrapper label="Password">
                <PasswordInput {...field} disabled={isFormSubmitting} placeholder="***********" />
              </FormItemWrapper>
            )}
          />
          <Button disabled={isFormSubmitting} type="submit">
            Sign up with Email
          </Button>
        </form>
      </Form>
      <FieldSeparator>Or</FieldSeparator>
      <AuthSocialProviders isLoading={isSigningUp} setIsLoading={setIsSigningUp} />
      <FieldDescription className="text-center">
        Already have an account? <Link to="/sign-in">Sign in</Link>
      </FieldDescription>
    </div>
  );
}
