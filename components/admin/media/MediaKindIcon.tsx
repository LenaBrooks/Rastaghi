import { ImageIcon } from "@/components/lucide/ImageIcon";
import { MicIcon } from "@/components/lucide/MicIcon";
import { VideoIcon } from "@/components/lucide/VideoIcon";
import type { MediaKind } from "@/lib/cloudinary";

type MediaKindIconProps = {
  kind: MediaKind;
  size?: number;
};

export function MediaKindIcon({ kind, size = 20 }: MediaKindIconProps) {
  if (kind === "video") {
    return <VideoIcon size={size} strokeWidth={1.75} aria-hidden />;
  }
  if (kind === "audio") {
    return <MicIcon size={size} strokeWidth={1.75} aria-hidden />;
  }
  return <ImageIcon size={size} strokeWidth={1.75} aria-hidden />;
}
