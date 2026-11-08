import {
  allowMethods,
  dbError,
  sameOrigin,
  sendJson,
  requireSession,
} from "@/lib/apiHelpers";
import { cleanText, normalizePhone } from "@/lib/validation";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "PATCH"])) return;

  const session = await requireSession(req, res);
  if (!session) return;
  const { supabase, profile, publicUser } = session;

  if (req.method === "GET") {
    const [{ data: addresses }, { data: orders }] = await Promise.all([
      supabase.from("addresses").select("*").order("is_default", { ascending: false }),
      supabase
        .from("orders")
        .select("id, total, status, payment_status, placed_at, reference")
        .order("placed_at", { ascending: false }),
    ]);

    const orderList = orders || [];
    const paid = orderList.filter((order) => order.payment_status === "PAID");

    return sendJson(res, 200, {
      user: publicUser,
      addresses: (addresses || []).map((address) => ({
        id: address.id,
        label: address.label,
        fullName: address.full_name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        country: address.country,
        isDefault: address.is_default,
      })),
      stats: {
        orders: orderList.length,
        spent: paid.reduce((sum, order) => sum + order.total, 0),
        lastOrderAt: orderList[0]?.placed_at ?? null,
        lastReference: orderList[0]?.reference ?? null,
      },
    });
  }

  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const body = req.body || {};
  const updates = {};

  if (body.firstName !== undefined) {
    const value = cleanText(body.firstName, 50);
    if (!value) return sendJson(res, 400, { error: "First name cannot be empty." });
    updates.first_name = value;
  }
  if (body.lastName !== undefined) {
    const value = cleanText(body.lastName, 50);
    if (!value) return sendJson(res, 400, { error: "Last name cannot be empty." });
    updates.last_name = value;
  }
  if (body.phone !== undefined) {
    const phone = normalizePhone(body.phone);
    if (!phone) {
      return sendJson(res, 400, {
        error: "Enter a valid Nigerian mobile number, e.g. 0803 000 0000.",
      });
    }
    if (phone !== profile.phone) {
      const { data: available } = await supabase.rpc("phone_available", { p_phone: phone });
      if (available === false) {
        return sendJson(res, 409, { error: "That phone number belongs to another account." });
      }
      updates.phone = phone;
    }
  }
  if (body.marketingOptIn !== undefined) {
    updates.marketing_opt_in = Boolean(body.marketingOptIn);
  }
  if (body.pushOptIn !== undefined) {
    updates.push_opt_in = Boolean(body.pushOptIn);
  }

  if (!Object.keys(updates).length) {
    return sendJson(res, 400, { error: "Nothing to update." });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", profile.id)
    .select("*")
    .single();

  if (error) return dbError(res, error, "We could not save your details.");

  return sendJson(res, 200, {
    user: {
      ...publicUser,
      firstName: data.first_name,
      lastName: data.last_name,
      fullName: `${data.first_name} ${data.last_name}`.trim(),
      phone: data.phone,
      marketingOptIn: data.marketing_opt_in,
      pushOptIn: data.push_opt_in ?? false,
    },
  });
}
