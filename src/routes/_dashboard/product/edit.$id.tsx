import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";
import { PageHeader, PageLayout } from "@/components/page-layout";
import { DeleteProductButton } from "@/components/product/delete-product-button";
import { ProductEditForm } from "@/components/product/product-edit-form";
import { PublishProductButton } from "@/components/product/publish-product-button";

export const Route = createFileRoute("/_dashboard/product/edit/$id")({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    const parsedProductId = z.coerce.number().positive().safeParse(params.id);
    if (!parsedProductId.success) {
      throw redirect({ to: "/product" });
    }

    return { productId: parsedProductId.data };
  },
});

const TITLE = "Edit Product";
const DESCRIPTION = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur gravida dignissim scelerisque.";

function RouteComponent() {
  const { productId } = Route.useRouteContext();

  return (
    <PageLayout>
      <PageHeader backUrl="/product" description={DESCRIPTION} title={TITLE}>
        <PublishProductButton id={productId} />
        <DeleteProductButton id={productId} />
      </PageHeader>
      <ProductEditForm id={productId} />
    </PageLayout>
  );
}
