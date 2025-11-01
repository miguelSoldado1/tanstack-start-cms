import { GalleryVerticalEndIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AuthHeaderProps {
  children: ReactNode;
}

export function AuthHeader({ children }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <GalleryVerticalEndIcon className="size-6" />
      {children}
    </div>
  );
}

interface AuthHeaderTitleProps {
  children: ReactNode;
}

export function AuthHeaderTitle({ children }: AuthHeaderTitleProps) {
  return <h1 className="font-bold text-xl">{children}</h1>;
}

interface AuthHeaderDescriptionProps {
  children: ReactNode;
}

export function AuthHeaderDescription({ children }: AuthHeaderDescriptionProps) {
  return <p className="text-center text-muted-foreground text-sm">{children}</p>;
}
