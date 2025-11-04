import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "sonner";
import { getProduct, publishProduct, unpublishProduct } from "@/server/server-functions/product-functions";
import { tryCatch } from "@/try-catch";
import { Button } from "../ui/button";

interface PublishProductButtonProps {
  id: number;
}

export function PublishProductButton({ id }: PublishProductButtonProps) {
  const getProductFn = useServerFn(getProduct);
  const query = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductFn({ data: { id } }),
  });

  const publishMutation = useMutation({ mutationFn: useServerFn(publishProduct) });
  const unpublishMutation = useMutation({ mutationFn: useServerFn(unpublishProduct) });

  const isPublished = query.data?.published;
  const isLoading = query.isPending || publishMutation.isPending || unpublishMutation.isPending;

  async function handleTogglePublish() {
    const mutation = isPublished ? unpublishMutation : publishMutation;
    const action = isPublished ? "unpublish" : "publish";

    const { error } = await tryCatch(mutation.mutateAsync({ data: { id } }));
    if (error) {
      return toast.error(`Failed to ${action} product`, {
        description: error.message,
      });
    }

    toast.success(`Product ${action}ed successfully`);
    query.refetch();
  }

  return (
    <Button disabled={isLoading} onClick={handleTogglePublish}>
      {isPublished ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      {isPublished ? "Unpublish Product" : "Publish Product"}
    </Button>
  );
}
