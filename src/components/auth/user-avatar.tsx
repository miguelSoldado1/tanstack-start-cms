import { Facehash } from "facehash";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const FACEHASH_COLORS = ["#0f766e", "#f59e0b", "#2563eb", "#ef4444", "#7c3aed"];

interface UserAvatarProps {
  name: string;
  image?: string | null;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ name, image, className, imageClassName, fallbackClassName }: UserAvatarProps) {
  const imageSrc = image?.trim() || undefined;

  return (
    <Avatar className={className}>
      <AvatarImage alt={name} className={cn("object-cover", imageClassName)} src={imageSrc} />
      <AvatarFallback className={cn("bg-transparent p-0", fallbackClassName)}>
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
