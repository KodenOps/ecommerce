import {
  allowMethods,
  requireAdminSession,
  sameOrigin,
  sendJson,
} from "@/lib/apiHelpers";
import { uploadDataUrl } from "@/lib/supabase/storage";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;

  const session = await requireAdminSession(req, res);
  if (!session) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const body = req.body || {};
  const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
  const name = typeof body.name === "string" ? body.name : "product-image";

  if (!dataUrl) {
    return sendJson(res, 400, { error: "Please choose an image to upload." });
  }

  const uploaded = await uploadDataUrl(session.supabase, {
    bucket: "products",
    userId: session.profile.id,
    dataUrl,
    name,
    options: { maxBytes: 5 * 1024 * 1024 },
  });

  if (!uploaded) {
    return sendJson(res, 400, { error: "Upload a PNG, JPG or WebP image under 5MB." });
  }

  const imageUrl = session.supabase.storage.from("products").getPublicUrl(uploaded.path).data?.publicUrl || uploaded.path;

  return sendJson(res, 200, {
    imageUrl,
    path: uploaded.path,
    name: uploaded.name,
  });
}
