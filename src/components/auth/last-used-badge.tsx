import { ClientOnly } from "@tanstack/react-router";
import { Badge } from "../ui/badge";

export function LastUsedBadge() {
  return (
    <ClientOnly>
      <Badge className="-top-2 -right-2 absolute px-1.5 py-0 text-[10px]" variant="secondary">
        Last used
      </Badge>
    </ClientOnly>
  );
}
