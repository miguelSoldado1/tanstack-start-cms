import { Facehash } from "facehash";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const FACEHASH_COLORS = ["#475569", "#1e40af", "#166534", "#991b1b", "#854d0e", "#6b21a8"];

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
