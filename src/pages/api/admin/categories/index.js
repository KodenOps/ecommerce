import { allowMethods, dbError, readString, requireAdminSession, sameOrigin, sendJson } from "@/lib/apiHelpers";
import { cleanText } from "@/lib/validation";
import { loadAllCategories } from "@/api/categories";

const readCategoryRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    code: cleanText(row.code, 40) || row.code,
    name: cleanText(row.name, 80) || row.name,
    color: cleanText(row.color, 20) || row.color || "#1a1a1a",
    description: cleanText(row.description, 500) || row.description || "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST", "DELETE"])) return;

  const session = await requireAdminSession(req, res);
  if (!session) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  if (req.method === "GET") {
    const categories = loadAllCategories(session.supabase).map(readCategoryRow);
    return sendJson(res, 200, { categories });
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const code = cleanText(body.code, 40);
    const name = cleanText(body.name, 80);
    const color = cleanText(body.color, 20);
    const description = cleanText(body.description, 500);

    if (!code) return sendJson(res, 400, { error: "Add a category code, e.g. skincare." });
    if (!name) return sendJson(res, 400, { error: "Add a category name, e.g. Skincare." });
    if (color && !/^#[0-9a-fA-F]{3,4}$/.test(color) && !/^#[0-9a-fA-F]{6}$/i.test(color) && !/^#[0-9a-fA-F]{8}$/i.test(color)) {
      return sendJson(res, 400, { error: "Use a hex colour, e.g. #1a1a1a." });
    }

    const payload = {
      code,
      name,
      color: color || "#1a1a1a",
      description: description || "",
    };

    const { data, error } = await session.supabase
      .from("categories")
      .upsert({ ...payload, updated_at: new Date().toISOString() }, { onConflict: "code" })
      .select("*")
      .single();

    if (error) return dbError(res, error, "Could not save that category.");
    return sendJson(res, 201, { category: readCategoryRow(data) });
  }

  if (req.method === "DELETE") {
    const body = req.body || {};
    const code = cleanText(body.code, 40);
    if (!code) return sendJson(res, 400, { error: "Pass the category code to delete." });

    const { error } = await session.supabase.from("categories").delete().eq("code", code);
    if (error) return dbError(res, error, "Could not delete that category.");
    return sendJson(res, 200, { deleted: code });
  }
}
