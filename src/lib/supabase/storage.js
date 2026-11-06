const IMAGE_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
};

const DATA_URL = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/i;

export function parseDataUrl(dataUrl, options = {}) {
  const { maxBytes = 5 * 1024 * 1024, allowPdf = false } = options;
  const match = DATA_URL.exec(String(dataUrl || "").trim());
  if (!match) return null;

  let mime = match[1].toLowerCase();
  if (mime === "image/jpg") mime = "image/jpeg";

  let extension = IMAGE_TYPES[mime];
  if (!extension && allowPdf && mime === "application/pdf") extension = "pdf";
  if (!extension) return null;

  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > maxBytes) return null;

  return { buffer, mime, extension, size: buffer.length };
}

/**
 * Uploads a data URL into a Supabase Storage bucket under the user's folder.
 * Returns the object path plus metadata for the database row.
 */
export async function uploadDataUrl(supabase, { bucket, userId, dataUrl, name, options }) {
  const parsed = parseDataUrl(dataUrl, options);
  if (!parsed) return null;

  const safeName = String(name || "file")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9_-]/gi, "")
    .slice(0, 40) || "file";
  const path = `${userId}/${safeName}-${Date.now()}.${parsed.extension}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, parsed.buffer, { contentType: parsed.mime, upsert: false });

  if (error) throw error;

  return {
    path,
    mime: parsed.mime,
    size: parsed.size,
    name: String(name || `${safeName}.${parsed.extension}`).slice(0, 120),
  };
}

export async function downloadObject(supabase, bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) return null;
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function removeObject(supabase, bucket, path) {
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]).catch(() => {});
}
