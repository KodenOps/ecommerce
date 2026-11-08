"use strict";

import webpush from "web-push";

/**
 * VAPID keys come from the env vars WEBPUSH_VAPID_PUBLIC_KEY_BASE64URL and
 * WEBPUSH_VAPID_PRIVATE_KEY_BASE64URL. `web-push` accepts base64url-encoded
 * keys via setVapidDetails.
 */
let push = null;

function getPush() {
  if (!push) {
    const vapidPublic =
      process.env.WEBPUSH_VAPID_PUBLIC_KEY_BASE64URL || "";
    const vapidPrivate =
      process.env.WEBPUSH_VAPID_PRIVATE_KEY_BASE64URL || "";
    if (!vapidPublic || !vapidPrivate || !process.env.WEBPUSH_VAPID_EMAIL) {
      return null;
    }
    webpush.setVapidDetails(
      process.env.WEBPUSH_VAPID_EMAIL,
      vapidPublic,
      vapidPrivate
    );
    push = webpush;
  }
  return push;
}

/**
 * Send one notification to a browser subscription.
 * Returns true if the endpoint is still valid.
 */
export async function sendPush(subscription, title, body, icon) {
  push = getPush();
  if (!push) return true; // no push configured — not an error path here

  try {
    await push.sendNotification(subscription, JSON.stringify({
      title: title || "",
      body: body || "",
      icon: icon || "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: JSON.stringify({ type: "ANNOUNCEMENT" }),
    }));
    return true;
  } catch (err) {
    const status = err?.statusCode;
    if (status === 404 || status === 410) {
      return false; // endpoint is dead — caller should remove it
    }
    throw err;
  }
}
