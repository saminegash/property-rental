"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import crypto from "crypto";

type EventType = "view" | "request_click" | "favorite_click" | "share_click";

export async function trackListingEvent(listing_id: string, event_type: EventType) {
  try {
    const supabase = await createClient();
    
    // Get user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    // To prevent spam and distinguish unique views without storing raw IPs,
    // we create a hashed session_id using IP + User-Agent + a secret salt.
    // If we don't have IP/UA, we just leave it null.
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown-ip";
    const userAgent = headersList.get("user-agent") || "unknown-ua";
    const isProd = process.env.NODE_ENV === "production";
    const salt = process.env.ANALYTICS_SALT;

    if (isProd && !salt) {
      console.error("CRITICAL SECURITY ERROR: ANALYTICS_SALT is missing in production! Analytics tracking bypassed to protect visitor privacy.");
      return;
    }

    const activeSalt = salt || "fallback-salt-do-not-use-in-prod";

    const hash = crypto.createHash('sha256');
    hash.update(`${ip}-${userAgent}-${activeSalt}`);
    const session_id = hash.digest('hex').substring(0, 32);

    const { error } = await supabase
      .from("listing_events")
      .insert({
        listing_id,
        event_type,
        viewer_id: user?.id || null,
        session_id
      });

    if (error) {
      console.warn("Analytics insertion failed:", error.message);
      // We don't throw here to avoid breaking the page
    }
  } catch (err) {
    console.error("Analytics tracking exception:", err);
    // Suppress error to avoid breaking the user flow
  }
}
