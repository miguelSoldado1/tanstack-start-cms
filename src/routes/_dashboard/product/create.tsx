import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageLayout } from "@/components/page-layout";
import { ProductCreateForm } from "@/components/product/product-create-form";
import { getUser } from "@/server/server-functions/auth-functions";

export const Route = createFileRoute("/_dashboard/product/create")({
  component: RouteComponent,
  beforeLoad: () => getUser(),
});

const TITLE = "Create Product";
const DESCRIPTION = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur gravida dignissim scelerisque.";

function RouteComponent() {
  return (
    <PageLayout>
      <PageHeader backUrl="/product" description={DESCRIPTION} title={TITLE} />
      <ProductCreateForm />
    </PageLayout>
  );
}
