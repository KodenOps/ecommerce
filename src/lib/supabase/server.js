import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (see supabase/README.md)."
    );
  }
  return { url, key };
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Request-scoped Supabase client that keeps the auth session in cookies.
 * Use in API routes and getServerSideProps so refreshes are written back.
 */
export function createServerSupabase(req, res) {
  const { url, key } = supabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(req.headers?.cookie ?? "")
          .filter((cookie) => cookie.name && typeof cookie.value === "string")
          .map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        if (!res?.setHeader) return;
        const serialized = cookiesToSet.map(({ name, value, options }) =>
          serializeCookieHeader(name, value, options)
        );
        res.setHeader("Set-Cookie", serialized);
      },
    },
  });
}

/** Loads the signed-in user together with their full profile row. */
export async function getSessionProfile(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}

export function avatarPublicUrl(supabase, profile) {
  if (!profile?.avatar_path) return null;
  const { data } = supabase.storage.from("avatars").getPublicUrl(profile.avatar_path);
  return data?.publicUrl ?? null;
}

export function toPublicUser(supabase, profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    fullName: `${profile.first_name} ${profile.last_name}`.trim(),
    phone: profile.phone,
    role: profile.role,
    isAdmin: profile.role === "ADMIN",
    avatarUrl: avatarPublicUrl(supabase, profile),
    marketingOptIn: Boolean(profile.marketing_opt_in),
    pushOptIn: Boolean(profile.push_opt_in ?? false),
    createdAt: profile.created_at,
  };
}
