"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { FormItemWrapper } from "@/components/ui/form-item-wrapper";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { authClient } from "@/lib/auth/auth-client";
import { FieldDescription, FieldSeparator } from "../ui/field";
import { AuthHeader, AuthHeaderDescription, AuthHeaderTitle } from "./auth-header";
import { AuthSocialProviders } from "./auth-social-providers";
import { LastUsedBadge } from "./last-used-badge";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export function SignInForm() {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const lastMethod = authClient.getLastUsedLoginMethod();

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const { error } = await authClient.signIn.email(data);
    if (error) {
      return toast.error(error.message || "An error occurred while signing in.");
    }

    navigate({ to: "/" });
  }

  const isFormSubmitting = form.formState.isSubmitting || isSigningIn;

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
            name="password"
            render={({ field }) => (
              <FormItemWrapper label="Password">
                <PasswordInput {...field} disabled={isFormSubmitting} placeholder="***********" />
              </FormItemWrapper>
            )}
          />
          <div className="relative">
            <Button className="w-full" disabled={isFormSubmitting} type="submit">
              Sign in with Email
            </Button>
            {lastMethod === "email" && <LastUsedBadge />}
          </div>
        </form>
      </Form>
      <FieldSeparator>Or</FieldSeparator>
      <AuthSocialProviders isLoading={isSigningIn} lastMethod={lastMethod} setIsLoading={setIsSigningIn} />
      <FieldDescription className="text-center">
        Don't have an account? <Link to="/sign-up">Sign up</Link>
      </FieldDescription>
    </div>
  );
}
