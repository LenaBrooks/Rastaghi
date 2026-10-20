import { v2 as cloudinary } from "cloudinary";

export type MediaKind = "image" | "audio" | "video";

const ALLOWED_TYPES: Record<MediaKind, Set<string>> = {
  image: new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ]),
  audio: new Set([
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/x-m4a",
    "audio/aac",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/webm",
  ]),
  video: new Set([
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
  ]),
};

export const CLOUDINARY_MAX_BYTES: Record<MediaKind, number> = {
  image: 8 * 1024 * 1024,
  audio: 25 * 1024 * 1024,
  video: 100 * 1024 * 1024,
};

const KIND_LABEL: Record<MediaKind, string> = {
  image: "تصویر",
  audio: "صوت",
  video: "ویدیو",
};

const KIND_LIMIT_LABEL: Record<MediaKind, string> = {
  image: "۸ مگابایت",
  audio: "۲۵ مگابایت",
  video: "۱۰۰ مگابایت",
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not set in environment.`);
  }
  return value;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim(),
  );
}

function configure() {
  cloudinary.config({
    cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: requireEnv("CLOUDINARY_API_KEY"),
    api_secret: requireEnv("CLOUDINARY_API_SECRET"),
    secure: true,
  });
}

export function parseMediaKind(value: unknown): MediaKind | null {
  if (value === "image" || value === "audio" || value === "video") {
    return value;
  }
  return null;
}

function mimeFromExtension(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "mp3":
      return "audio/mpeg";
    case "m4a":
      return "audio/mp4";
    case "aac":
      return "audio/aac";
    case "wav":
      return "audio/wav";
    case "ogg":
      return "audio/ogg";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    default:
      return "";
  }
}

export function assertAllowedMedia(file: File, kind: MediaKind) {
  const mime = mimeFromExtension(file);
  if (!ALLOWED_TYPES[kind].has(mime)) {
    if (kind === "image") {
      throw new Error("فقط JPEG، PNG، WebP یا GIF مجاز است.");
    }
    if (kind === "audio") {
      throw new Error("فقط MP3، M4A، AAC، WAV، OGG یا WebM صوتی مجاز است.");
    }
    throw new Error("فقط MP4، WebM یا MOV مجاز است.");
  }
  const max = CLOUDINARY_MAX_BYTES[kind];
  if (file.size <= 0 || file.size > max) {
    throw new Error(
      `حجم ${KIND_LABEL[kind]} باید کمتر از ${KIND_LIMIT_LABEL[kind]} باشد.`,
    );
  }
}

/** @deprecated Prefer assertAllowedMedia(file, "image") */
export function assertAllowedImage(file: File) {
  assertAllowedMedia(file, "image");
}

export type CloudinaryUploadResult = {
  url: string;
  publicId: string;
  resourceType: string;
  width?: number;
  height?: number;
};

export async function uploadMediaToCloudinary(
  file: File,
  kind: MediaKind,
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary پیکربندی نشده است.");
  }

  assertAllowedMedia(file, kind);
  configure();

  const folder = process.env.CLOUDINARY_FOLDER?.trim() || "rastaghi";
  const bytes = Buffer.from(await file.arrayBuffer());
  // Cloudinary stores audio under the video resource type.
  const resourceType = kind === "image" ? "image" : "video";

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
    resource_type?: string;
    width?: number;
    height?: number;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        overwrite: false,
        unique_filename: true,
      },
      (error, uploaded) => {
        if (error || !uploaded?.secure_url || !uploaded.public_id) {
          reject(error ?? new Error("آپلود ناموفق بود."));
          return;
        }
        resolve({
          secure_url: uploaded.secure_url,
          public_id: uploaded.public_id,
          resource_type: uploaded.resource_type,
          width: uploaded.width,
          height: uploaded.height,
        });
      },
    );
    stream.end(bytes);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type || resourceType,
    width: result.width,
    height: result.height,
  };
}

export async function uploadImageToCloudinary(
  file: File,
): Promise<{ url: string; publicId: string; width?: number; height?: number }> {
  const uploaded = await uploadMediaToCloudinary(file, "image");
  return {
    url: uploaded.url,
    publicId: uploaded.publicId,
    width: uploaded.width,
    height: uploaded.height,
  };
}
