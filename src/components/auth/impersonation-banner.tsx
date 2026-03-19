import { useNavigate, useRouter } from "@tanstack/react-router";
import { Undo2Icon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/app";
import { authClient } from "@/lib/auth/auth-client";

export function ImpersonationBanner() {
  const navigate = useNavigate();
  const router = useRouter();
  const { data: session, refetch } = authClient.useSession();
  const [isPending, startTransition] = useTransition();

  if (!session?.session.impersonatedBy) {
    return null;
  }

  function handleStopImpersonating() {
    startTransition(async () => {
      const { error } = await authClient.admin.stopImpersonating();

      if (error) {
        toast.error("Failed to stop preview", { description: error.message });
        return;
      }

      await refetch({ query: { disableCookieCache: true } });
      await router.invalidate();
      toast.success("Returned to your admin session");
      navigate({ replace: true, to: appConfig.defaultAuthenticatedPath });
    });
  }

  return (
    <div className="group fixed top-4 right-4 z-50">
      <div className="relative h-8 w-fit max-w-8 overflow-hidden rounded-full border bg-background/95 shadow-lg backdrop-blur transition-[max-width] duration-200 ease-out group-focus-within:max-w-xs group-hover:max-w-xs">
        <div className="flex h-full items-center overflow-hidden pr-8 pl-3">
          <span className="mr-2 max-w-0 overflow-hidden whitespace-nowrap text-muted-foreground text-sm opacity-0 transition-[max-width,opacity] duration-200 ease-out group-focus-within:max-w-xs group-focus-within:opacity-100 group-hover:max-w-xs group-hover:opacity-100">
            Previewing as <span className="font-medium text-primary">{session.user.name}</span>. Go back.
          </span>
        </div>
        <Button
          aria-label="Return to admin"
          className="absolute top-0 right-0 rounded-full p-0"
          disabled={isPending}
          onClick={handleStopImpersonating}
          size="icon-sm"
          variant="secondary"
        >
          <Undo2Icon />
        </Button>
      </div>
    </div>
  );
}
