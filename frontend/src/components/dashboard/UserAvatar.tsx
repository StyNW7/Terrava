import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";

interface UserAvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  online?: boolean;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-16 w-16 text-lg",
};

/** Avatar of the signed-in user: the photo chosen in Settings, or their initials. */
export default function UserAvatar({ initials, size = "md", className, online = true }: UserAvatarProps) {
  const { settings } = useSettings();
  const photo = settings.profile.avatarUrl;
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {photo ? (
        <img src={photo} alt="" className={cn("rounded-full object-cover ring-2 ring-white", sizes[size])} />
      ) : (
        <span
          className={cn(
            "flex items-center justify-center rounded-full bg-gradient-to-br from-terrava-light to-terrava-soft font-semibold text-terrava-primary ring-2 ring-white",
            sizes[size]
          )}
        >
          {initials}
        </span>
      )}
      {online && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-terrava-success"
          aria-hidden="true"
        />
      )}
    </span>
  );
}
