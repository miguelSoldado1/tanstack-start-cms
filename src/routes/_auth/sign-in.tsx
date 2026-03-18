import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignInForm } from "@/components/auth/sign-in-form";
import { appConfig } from "@/config/app";
import { getUser } from "@/server/server-functions/auth-functions";
import { getStarterFeatures } from "@/server/server-functions/starter-functions";

export const Route = createFileRoute("/_auth/sign-in")({
  component: RouteComponent,
  beforeLoad: async () => {
    const user = await getUser();
    if (user) {
      throw redirect({ to: appConfig.defaultAuthenticatedPath });
    }
  },
  loader: () => getStarterFeatures(),
});

function RouteComponent() {
  const { authProviders } = Route.useLoaderData();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignInForm enabledProviders={authProviders} />
      </div>
    </div>
  );
}
