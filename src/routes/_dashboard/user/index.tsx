import { createFileRoute } from "@tanstack/react-router";
import { UserTable } from "@/components/auth/user/user-table";
import { PageHeader, PageLayout } from "@/components/page-layout";
import { requireUserAccess } from "@/server/server-functions/auth-functions";

export const Route = createFileRoute("/_dashboard/user/")({
  component: RouteComponent,
  beforeLoad: () => requireUserAccess({ data: { role: "admin" } }),
});

const TITLE = "Users";
const DESCRIPTION = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur gravida dignissim scelerisque.";

function RouteComponent() {
  return (
    <PageLayout>
      <PageHeader description={DESCRIPTION} title={TITLE} />
      <UserTable />
    </PageLayout>
  );
}
