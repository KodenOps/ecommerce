import { allowMethods, dbError, sameOrigin, sendJson } from "@/lib/apiHelpers";
import { requireSession } from "@/lib/apiHelpers";
import { passwordProblem } from "@/lib/validation";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const session = await requireSession(req, res);
  if (!session) return;
  const { supabase, profile } = session;

  const currentPassword = String(req.body?.currentPassword ?? "");
  const newPassword = String(req.body?.newPassword ?? "");

  if (!currentPassword) {
    return sendJson(res, 400, { error: "Enter your current password." });
  }
  const problem = passwordProblem(newPassword);
  if (problem) return sendJson(res, 400, { error: problem });

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: currentPassword,
  });
  if (verifyError) {
    return sendJson(res, 400, { error: "Your current password is not correct." });
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return dbError(res, error, "We could not update your password.");

  return sendJson(res, 200, { ok: true });
}
