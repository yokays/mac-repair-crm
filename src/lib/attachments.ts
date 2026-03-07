import { mkdir, writeFile, unlink, stat } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "data", "attachments");

const ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/png": ".png",
  "image/jpeg": ".jpg",
};
const ALLOWED_TYPES = ["Devis", "Facture", "Photo", "Autre"];

export async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export function validateFileType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

export function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

export function validateAttachmentType(type: string): boolean {
  return ALLOWED_TYPES.includes(type);
}

export async function saveFile(buffer: Buffer, mimeType: string): Promise<string> {
  await ensureUploadDir();
  const ext = MIME_TO_EXT[mimeType] || "";
  const storedName = `${uuidv4()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, storedName);
  await writeFile(filePath, buffer);
  return storedName;
}

export function getFilePath(storedName: string): string {
  return path.join(UPLOAD_DIR, storedName);
}

export async function deleteFile(storedName: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, storedName);
  try {
    await stat(filePath);
    await unlink(filePath);
  } catch {
    // File already deleted
  }
}
