import { createFileRoute } from "@tanstack/react-router";
import { CategoryCreateForm } from "@/components/category/category-create-form";
import { CategoryTable } from "@/components/category/category-table";
import { PageHeader, PageLayout } from "@/components/page-layout";

export const Route = createFileRoute("/_dashboard/category/")({
  component: RouteComponent,
});

const TITLE = "Categories";
const DESCRIPTION = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur gravida dignissim scelerisque.";

function RouteComponent() {
  return (
    <PageLayout>
      <PageHeader description={DESCRIPTION} title={TITLE}>
        <CategoryCreateForm />
      </PageHeader>
      <CategoryTable />
    </PageLayout>
  );
}
