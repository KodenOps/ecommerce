import {
  createServerSupabase,
  getSessionProfile,
  toPublicUser,
} from "./supabase/server";

const safeNext = (next, fallback) => {
  const value = typeof next === "string" ? next : "";
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
};

/**
 * Pages Router guard. Loads the Supabase session on the server so protected
 * routes never render before we know who is asking.
 */
export async function pageSession(ctx) {
  const supabase = createServerSupabase(ctx.req, ctx.res);
  const { user, profile } = await getSessionProfile(supabase);
  return { supabase, user, profile };
}

export async function userPageProps(ctx, options = {}) {
  const { fallback = "/Account", requireAdmin = false, onlyGuests = false } = options;
  const { supabase, user, profile } = await pageSession(ctx);
  const nextPath = safeNext(ctx.query?.next, fallback);

  if (onlyGuests) {
    if (user) return { redirect: { destination: nextPath, permanent: false } };
    return { props: { user: null } };
  }

  if (!user || !profile) {
    const target = ctx.resolvedUrl || fallback;
    return {
      redirect: { destination: `/Login?next=${encodeURIComponent(target)}`, permanent: false },
    };
  }

  if (requireAdmin && profile.role !== "ADMIN") {
    return {
      redirect: {
        destination: `/Admin/Login?error=forbidden&next=${encodeURIComponent(ctx.resolvedUrl || "/Admin/Dashboard")}`,
        permanent: false,
      },
    };
  }

  return { props: { user: toPublicUser(supabase, profile) } };
}

/** Every /Admin page except sign-in uses this. */
export function adminPageProps(ctx) {
  return userPageProps(ctx, { fallback: "/Admin/Dashboard", requireAdmin: true });
}

/** Redirects non-admins away from the admin sign-in page. */
export function adminLoginProps(ctx) {
  const redirect = safeNext(ctx.query?.next, "/Admin");
  return pageSession(ctx).then(({ user, profile }) => {
    if (user && profile?.role === "ADMIN") {
      return { redirect: { destination: redirect, permanent: false } };
    }
    return { props: { user: null } };
  });
}
