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
import { LastUsedBadge } from "./last-used-badge";

const DISABLE_SIGN_UP_WITH_EMAIL = true;

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
    defaultValues: { email: "", name: "", password: "" },
  });

  const lastMethod = authClient.getLastUsedLoginMethod();

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const { error } = await authClient.signUp.email(data);
    if (error) {
      return toast.error(error.message || "An error occurred while signing up.");
    }

    navigate({ to: "/user" });
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
                <Input
                  {...field}
                  disabled={isFormSubmitting || DISABLE_SIGN_UP_WITH_EMAIL}
                  placeholder="email@acme.com"
                  type="email"
                />
              </FormItemWrapper>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItemWrapper label="Name">
                <Input
                  {...field}
                  disabled={isFormSubmitting || DISABLE_SIGN_UP_WITH_EMAIL}
                  placeholder="John Doe"
                  type="text"
                />
              </FormItemWrapper>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItemWrapper label="Password">
                <PasswordInput
                  {...field}
                  disabled={isFormSubmitting || DISABLE_SIGN_UP_WITH_EMAIL}
                  placeholder="***********"
                />
              </FormItemWrapper>
            )}
          />
          <Button disabled={isFormSubmitting || DISABLE_SIGN_UP_WITH_EMAIL} type="submit">
            Sign up with Email
          </Button>
          {lastMethod === "email" && <LastUsedBadge />}
        </form>
      </Form>
      <FieldSeparator>Or</FieldSeparator>
      <AuthSocialProviders isLoading={isSigningUp} lastMethod={lastMethod} setIsLoading={setIsSigningUp} />
      <FieldDescription className="text-center">
        Already have an account? <Link to="/sign-in">Sign in</Link>
      </FieldDescription>
    </div>
  );
}
