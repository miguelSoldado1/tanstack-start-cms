import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getUser } from "@/server/server-functions/auth-functions";

export const Route = createFileRoute("/_auth/sign-in")({
  component: RouteComponent,
  beforeLoad: async () => {
    const user = await getUser();
    if (user) {
      throw redirect({ to: "/product" });
    }
  },
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignInForm />
      </div>
    </div>
  );
}
