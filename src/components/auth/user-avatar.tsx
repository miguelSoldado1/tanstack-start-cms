import { Avatar, AvatarFallback, AvatarImage, Facehash } from "facehash";
import { cn } from "@/lib/utils";

const FACEHASH_COLORS = ["#475569", "#1e40af", "#166534", "#991b1b", "#854d0e", "#6b21a8"];

interface UserAvatarProps {
  name: string;
  image?: string | null;
  className?: string;
}

export function UserAvatar({ name, image, className }: UserAvatarProps) {
  const imageSrc = image?.trim() || undefined;

  return (
    <Avatar className={cn(className, "rounded-full")}>
      <AvatarImage alt={name} src={imageSrc} />
      <AvatarFallback>
        <Facehash
          colors={FACEHASH_COLORS}
          intensity3d="none"
          interactive={false}
          name={name}
          showInitial={false}
          size="100%"
        />
      </AvatarFallback>
    </Avatar>
  );
}
