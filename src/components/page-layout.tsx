import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import { Button } from "./ui/button";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return <main className="flex-1 space-y-4 p-4 pt-6 md:px-6 md:py-8">{children}</main>;
}

interface PageHeaderProps extends LinkProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children, ...linkProps }: PageHeaderProps) {
  return (
    <section className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-4">
        {linkProps.to && (
          <Button asChild size="icon" variant="ghost">
            <Link {...linkProps}>
              <ChevronLeftIcon className="size-8" />
            </Link>
          </Button>
        )}
        <div>
          <h1 className="font-bold text-3xl tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </section>
  );
}
