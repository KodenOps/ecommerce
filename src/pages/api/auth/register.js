import {
  allowMethods,
  dbError,
  readString,
  sameOrigin,
  sendJson,
} from "@/lib/apiHelpers";
import { createServerSupabase, getSessionProfile, toPublicUser } from "@/lib/supabase/server";
import {
  cleanText,
  isEmail,
  normalizeEmail,
  normalizePhone,
  passwordProblem,
} from "@/lib/validation";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) return;
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request blocked." });

  const body = req.body || {};
  const firstName = cleanText(body.firstName, 50);
  const lastName = cleanText(body.lastName, 50);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);
  const password = String(body.password ?? "");
  const marketingOptIn = body.marketingOptIn !== false;

  if (!firstName || !lastName) {
    return sendJson(res, 400, { error: "Enter your first and last name." });
  }
  if (!isEmail(email)) {
    return sendJson(res, 400, { error: "Enter a valid email address." });
  }
  if (!phone) {
    return sendJson(res, 400, {
      error: "Enter a valid Nigerian mobile number, e.g. 0803 000 0000.",
    });
  }
  const problem = passwordProblem(password);
  if (problem) return sendJson(res, 400, { error: problem });

  const supabase = createServerSupabase(req, res);

  const { data: available, error: phoneError } = await supabase.rpc("phone_available", {
    p_phone: phone,
  });
  if (phoneError && phoneError.code !== "PGRST202") {
    return dbError(res, phoneError, "We could not check that phone number. Try again.");
  }
  if (available === false) {
    return sendJson(res, 409, {
      error: "That phone number is already registered. Sign in instead.",
    });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone,
        marketing_opt_in: marketingOptIn,
      },
    },
  });

  if (error) {
    const message = String(error.message || "");
    if (/already registered|already exists/i.test(message)) {
      return sendJson(res, 409, { error: "An account with this email already exists." });
    }
    if (/database error/i.test(message)) {
      return sendJson(res, 409, {
        error: "That phone number or email is already in use.",
      });
    }
    if (/rate limit|too many/i.test(message)) {
      return sendJson(res, 429, { error: "Too many attempts. Please wait a minute and try again." });
    }
    return dbError(res, error, "We could not create your account. Please try again.");
  }

  if (!data.session) {
    return sendJson(res, 201, {
      requiresConfirmation: true,
      email,
      message:
        "Account created. Check your email to confirm your address, then sign in with your phone number and password.",
    });
  }

  const { profile } = await getSessionProfile(supabase);
  return sendJson(res, 201, { user: toPublicUser(supabase, profile), requiresConfirmation: false });
}
