import { cn } from "@/lib/utils";

interface ImageWithOverlayProps {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  rounded?: string;
}

export default function ImageWithOverlay({
  src,
  alt,
  className,
  overlay = false,
  rounded = "rounded-3xl",
}: ImageWithOverlayProps) {
  return (
    <div className={cn("relative overflow-hidden", rounded, className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      {overlay && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-terrava-dark/60 via-terrava-dark/10 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
