import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { PageHeader, PageLayout } from "@/components/page-layout";
import { ProductTable } from "@/components/product/product-table";
import { Button } from "@/components/ui/button";
import { getUser } from "@/server/server-functions/auth-functions";

export const Route = createFileRoute("/_dashboard/product/")({
  component: RouteComponent,
  beforeLoad: () => getUser(),
});

const TITLE = "Products";
const DESCRIPTION = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur gravida dignissim scelerisque.";

function RouteComponent() {
  return (
    <PageLayout>
      <PageHeader description={DESCRIPTION} title={TITLE}>
        <Button asChild>
          <Link to="/product/create">
            <PlusIcon className="size-4" />
            Add Product
          </Link>
        </Button>
      </PageHeader>
      <ProductTable />
    </PageLayout>
  );
}
