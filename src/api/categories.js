import { createServerSupabase, getSessionProfile } from "@/lib/supabase/server";

export async function loadPublicCategories(req, res) {
  const supabase = createServerSupabase(req, res);
  const { data, error } = await supabase
    .rpc("categories_public")
    .select("*");
  if (error) {
    const fallback = await supabase.from("categories").select("*").order("name", { ascending: true });
    if (fallback.error) return null;
    return fallback.data || [];
  }
  return data || [];
}

export async function loadAllCategories(supabase) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, code, name, color, description")
    .order("name", { ascending: true });
  if (error) return [];
  return data || [];
}
