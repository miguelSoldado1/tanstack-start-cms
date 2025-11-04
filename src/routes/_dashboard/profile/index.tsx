import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageLayout } from "@/components/page-layout";
import { DeleteAccountForm } from "@/components/profile/delete-account-form";
import { UpdateNameForm } from "@/components/profile/update-name-form";
import { UpdatePasswordForm } from "@/components/profile/update-password-form";
import { getUser } from "@/server/server-functions/auth-functions";

export const Route = createFileRoute("/_dashboard/profile/")({
  component: RouteComponent,
  beforeLoad: () => getUser(),
});

const TITLE = "Profile";
const DESCRIPTION = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur gravida dignissim scelerisque.";

function RouteComponent() {
  return (
    <PageLayout>
      <PageHeader description={DESCRIPTION} title={TITLE} />
      <section className="container space-y-6 rounded-xl p-6">
        <UpdateNameForm />
        <UpdatePasswordForm />
        <DeleteAccountForm />
      </section>
    </PageLayout>
  );
}
