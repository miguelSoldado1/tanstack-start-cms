import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { ImpersonationBanner } from "@/components/auth/impersonation-banner";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { authClient } from "@/lib/auth/auth-client";

const SIGNED_IN_DESCRIPTION = "Your account is signed in, but it does not have permission to access this area.";
const SIGNED_OUT_DESCRIPTION = "You do not have permission to continue with this request.";

export const Route = createFileRoute("/unauthorized")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  async function handleSignOut() {
    const { error } = await authClient.signOut();

    if (error) {
      return toast.error(error.message || "An error occurred while signing out.");
    }

    navigate({ to: "/sign-in" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="flex w-full max-w-2xl flex-col gap-4">
        <ImpersonationBanner />
        <Empty className="min-h-96 max-w-2xl border-destructive/30 shadow-sm">
          <EmptyHeader>
            <EmptyMedia className="rounded-2xl text-destructive [&_svg]:size-7" variant="icon">
              <ShieldAlertIcon />
            </EmptyMedia>
            <EmptyTitle className="text-destructive">Unauthorized</EmptyTitle>
            <EmptyDescription>{session?.user ? SIGNED_IN_DESCRIPTION : SIGNED_OUT_DESCRIPTION}</EmptyDescription>
          </EmptyHeader>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {session?.user ? (
              <>
                <Button asChild variant="outline">
                  <Link to="/">Go to dashboard</Link>
                </Button>
                <Button disabled={isPending} onClick={handleSignOut} type="button" variant="destructive">
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild variant="destructive">
                <Link to="/sign-in">Back to sign in</Link>
              </Button>
            )}
          </div>
        </Empty>
      </div>
    </main>
  );
}
