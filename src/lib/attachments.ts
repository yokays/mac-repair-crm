import { put, del } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/png": ".png",
  "image/jpeg": ".jpg",
};
const ALLOWED_TYPES = ["Devis", "Facture", "Photo", "Autre"];

export function validateFileType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

export function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

export function validateAttachmentType(type: string): boolean {
  return ALLOWED_TYPES.includes(type);
}

export async function saveFile(buffer: Buffer, mimeType: string): Promise<{ storedName: string; url: string }> {
  const ext = MIME_TO_EXT[mimeType] || "";
  const storedName = `${uuidv4()}${ext}`;

  const blob = await put(`attachments/${storedName}`, buffer, {
    access: "public",
    contentType: mimeType,
  });

  return { storedName, url: blob.url };
}

export async function deleteFile(url: string): Promise<void> {
  try {
    await del(url);
  } catch {
    // File already deleted or not found
  }
}
