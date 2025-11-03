import { type LinkProps, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { tryCatch } from "@/try-catch";

interface UseDeleteEntityProps<T> {
  mutateAsync: () => Promise<T>;
  invalidate: () => unknown;
  onSuccess?: (data: T) => unknown;
  redirectHref?: LinkProps["to"];
  entityName?: string;
}

export function useDeleteEntity<T>(props: UseDeleteEntityProps<T>) {
  const { redirectHref, mutateAsync, invalidate, entityName = "item", onSuccess } = props;
  const navigate = useNavigate();

  async function handleDelete() {
    const result = await tryCatch(mutateAsync());
    if (result.error) {
      return toast.error(`Failed to delete ${entityName}`, {
        description: result.error?.message ?? "An unknown error occurred.",
      });
    }

    toast.success(`Successfully deleted ${entityName}`);
    if (onSuccess) onSuccess(result.data);
    invalidate();

    if (redirectHref) {
      navigate({ to: redirectHref });
    }
  }

  return handleDelete;
}
