import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/product/edit/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_dashboard/product/edit/$id"!</div>;
}
