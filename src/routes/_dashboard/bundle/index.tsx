import { createFileRoute } from "@tanstack/react-router";
import { ProductBundleCreateForm } from "@/components/bundle/product-bundle-create-form";
import { ProductBundleTable } from "@/components/bundle/product-bundle-table";
import { PageHeader, PageLayout } from "@/components/page-layout";

export const Route = createFileRoute("/_dashboard/bundle/")({
  component: RouteComponent,
});

const TITLE = "Bundles";
const DESCRIPTION = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur gravida dignissim scelerisque.";

function RouteComponent() {
  return (
    <PageLayout>
      <PageHeader description={DESCRIPTION} title={TITLE}>
        <ProductBundleCreateForm />
      </PageHeader>
      <ProductBundleTable />
    </PageLayout>
  );
}
