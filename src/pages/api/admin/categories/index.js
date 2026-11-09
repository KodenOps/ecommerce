import { allowMethods, dbError, readString, readInt, requireAdminSession, sameOrigin, sendJson } from "@/lib/apiHelpers";
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
    archived_at: row.archived_at ? new Date(row.archived_at).getTime() : null,
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
    const archivedAt = readInt(body.archivedAt, 0);

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
      archived_at: archivedAt ? new Date(archivedAt * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await session.supabase
      .from("categories")
      .upsert({ ...payload }, { onConflict: "code" })
      .select("*")
      .single();

    if (error) return dbError(res, error, "Could not save that category.");
    return sendJson(res, 201, { category: readCategoryRow(data) });
  }

  if (req.method === "DELETE") {
    const body = req.body || {};
    const code = cleanText(body.code, 40);
    if (!code) return sendJson(res, 400, { error: "Pass the category code to delete." });

    const { data: softDeleted } = await session.supabase
      .from("categories")
      .update({ archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("code", code)
      .select("id, name")
      .maybeSingle();

    if (softDeleted) {
      return sendJson(res, 200, { deleted: code, softDelete: true, name: softDeleted.name });
    }

    const { error } = await session.supabase.from("categories").delete().eq("code", code);
    if (error) return dbError(res, error, "Could not delete that category.");
    return sendJson(res, 200, { deleted: code, softDelete: false });
  }
}
