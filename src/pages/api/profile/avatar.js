import { allowMethods, dbError, sameOrigin, sendJson } from "@/lib/apiHelpers";
import { requireSession } from "@/lib/apiHelpers";
import { uploadDataUrl, removeObject } from "@/lib/supabase/storage";
import { avatarPublicUrl } from "@/lib/supabase/server";

export const config = {
  api: { bodyParser: { sizeLimit: "6mb" } },
};

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST", "DELETE"])) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const session = await requireSession(req, res);
  if (!session) return;
  const { supabase, profile } = session;

  if (req.method === "DELETE") {
    if (profile.avatar_path) {
      await removeObject(supabase, "avatars", profile.avatar_path);
    }
    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar_path: null })
      .eq("id", profile.id)
      .select("*")
      .single();
    if (error) return dbError(res, error, "We could not remove your photo.");
    return sendJson(res, 200, { avatarUrl: avatarPublicUrl(supabase, data) });
  }

  const uploaded = await uploadDataUrl(supabase, {
    bucket: "avatars",
    userId: profile.id,
    dataUrl: req.body?.dataUrl,
    name: req.body?.name || "avatar",
    options: { maxBytes: 5 * 1024 * 1024 },
  });

  if (!uploaded) {
    return sendJson(res, 400, { error: "Upload a PNG, JPG or WebP image under 5MB." });
  }

  const previous = profile.avatar_path;
  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_path: uploaded.path })
    .eq("id", profile.id)
    .select("*")
    .single();

  if (error) {
    await removeObject(supabase, "avatars", uploaded.path);
    return dbError(res, error, "We could not save your photo.");
  }

  if (previous && previous !== uploaded.path) {
    await removeObject(supabase, "avatars", previous);
  }

  return sendJson(res, 200, { avatarUrl: avatarPublicUrl(supabase, data) });
}
