import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageLayout } from "@/components/page-layout";
import { ProductTable } from "@/components/product/product-table";

export const Route = createFileRoute("/_dashboard/product/")({
  component: RouteComponent,
});

const TITLE = "Products";
const DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris a lectus consequat, sollicitudin elit eu, dapibus augue. Duis luctus eros velit, in posuere diam egestas sit amet.";

function RouteComponent() {
  return (
    <PageLayout>
      <PageHeader description={DESCRIPTION} title={TITLE} />
      <ProductTable />
    </PageLayout>
  );
}
