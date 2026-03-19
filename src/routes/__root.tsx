import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRoute, HeadContent, Link, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { FileQuestionIcon } from "lucide-react";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Toaster } from "@/components/ui/sonner";
import { appConfig } from "@/config/app";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: appConfig.appName },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg" },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <NuqsAdapter>{children}</NuqsAdapter>
          {!import.meta.env.PROD && (
            <TanStackDevtools
              config={{
                position: "bottom-right",
              }}
              plugins={[
                { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
                { name: "Tanstack Query", render: <ReactQueryDevtoolsPanel /> },
              ]}
            />
          )}
          <Toaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Empty className="min-h-96 max-w-2xl border-destructive/30 shadow-sm">
        <EmptyHeader>
          <EmptyMedia className="rounded-2xl text-destructive [&_svg]:size-7" variant="icon">
            <FileQuestionIcon />
          </EmptyMedia>
          <EmptyTitle className="text-destructive">Page not found</EmptyTitle>
          <EmptyDescription>The page you requested does not exist or is no longer available.</EmptyDescription>
        </EmptyHeader>
        <Button asChild variant="destructive">
          <Link to="/">Go to dashboard</Link>
        </Button>
      </Empty>
    </main>
  );
}
