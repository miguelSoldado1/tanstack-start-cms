import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageLayout } from "@/components/page-layout";
import { UserTable } from "@/components/user/user-table";
import { getUser } from "@/server/server-functions/auth-functions";

export const Route = createFileRoute("/_dashboard/user")({
  component: RouteComponent,
  beforeLoad: () => getUser(),
});

const TITLE = "Users";
const DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris a lectus consequat, sollicitudin elit eu, dapibus augue. Duis luctus eros velit, in posuere diam egestas sit amet.";

function RouteComponent() {
  return (
    <PageLayout>
      <PageHeader description={DESCRIPTION} title={TITLE} />
      <UserTable />
    </PageLayout>
  );
}
