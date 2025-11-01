import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { getUser } from "@/server-functions/auth-functions";

export const Route = createFileRoute("/")({
  component: App,
  beforeLoad: () => getUser(),
});

function App() {
  const session = Route.useRouteContext();
  const navigate = useNavigate();

  async function handleSignOut() {
    const { error } = await authClient.signOut();
    if (error) {
      return toast.error(error.message || "An error occurred while signing out.");
    }

    navigate({ to: "/sign-in" });
  }
  return (
    <div>
      <h1>Welcome back, {session?.name}!</h1>
      <Button onClick={handleSignOut}>Sign out</Button>
    </div>
  );
}
