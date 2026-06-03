"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Local digits (without the +251 country code).
// Ethiopian mobile numbers are typically 9 digits after the leading 0/9.
const PHONE_DIGITS_RE = /^[0-9]{9,10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sign up a new user.
 *
 * Form fields: full_name, phone, email, password, confirm_password, role, agree_terms.
 *
 * Persistence path:
 *   - email + password → auth.users (via supabase.auth.signUp)
 *   - full_name + role → raw_user_meta_data, consumed by the public.handle_new_user()
 *     trigger which writes them into public.profiles and public.user_roles
 *   - phone → written into public.profiles by a follow-up UPDATE here,
 *     since the trigger doesn't currently read phone from metadata
 */
export async function signup(formData: FormData) {
  const supabase = await createClient();

  const fullName = ((formData.get("full_name") as string) ?? "").trim();
  const rawPhone = ((formData.get("phone") as string) ?? "")
    .trim()
    .replace(/^\+251/, "")
    .replace(/[\s-]/g, "");
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirm_password") as string) ?? "";
  const role = formData.get("role") as string;
  const agreeTerms = formData.get("agree_terms");

  if (!fullName || fullName.length < 2) {
    return { error: "Please enter your full name." };
  }
  if (!PHONE_DIGITS_RE.test(rawPhone)) {
    return { error: "Please enter a valid phone number (9 digits after +251)." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }
  if (role !== "user" && role !== "owner") {
    return { error: "Please choose what you want to do on MyEthioProperties." };
  }
  if (!agreeTerms) {
    return { error: "You must agree to the Terms of Service and Privacy Policy." };
  }

  // Normalize to E.164. Drop a leading 0 if the user typed local-style "09…".
  const phoneE164 = `+251${rawPhone.replace(/^0/, "")}`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://myethioproperties.com";



  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
      data: {
        full_name: fullName,
        phone: phoneE164,
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // The trigger already created the profile row with full_name + email, and
  // assigned user/owner roles. Persist the phone, since the trigger doesn't
  // currently read it from raw_user_meta_data. RLS allows this because we
  // are now authenticated as the new user.
  if (data?.user?.id) {
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ phone: phoneE164 })
      .eq("user_id", data.user.id);
    if (updateErr) {
      // Non-fatal — user can fix this from their dashboard later.
      console.error("[signup] failed to persist phone:", updateErr.message);
    }
  }

  redirect("/dashboard");
}

/**
 * Log in an existing user.
 */
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

/**
 * Log out the current user.
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Send password reset email.
 */
export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();

  if (!email) {
    return { error: "Email is required." };
  }

  // Use the origin from headers to construct the redirect URL if possible,
  // but in Next.js Server Actions, we can just let Supabase use the default SITE_URL
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://myethioproperties.com"}/auth/callback?next=/dashboard/owner/profile`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
