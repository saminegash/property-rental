"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasRole } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const isAdmin = await hasRole(user.id, "admin");
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }
}

export async function updateRequestStatus(requestId: string, newStatus: string) {
  await ensureAdmin();

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("rental_requests")
    .update({ status: newStatus })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/requests");
  return { success: true };
}

export async function updateRequestAdminNotes(requestId: string, notes: string) {
  await ensureAdmin();

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("rental_requests")
    .update({ admin_notes: notes })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/requests");
  return { success: true };
}

export async function updateRequestOwnerNotes(requestId: string, notes: string) {
  await ensureAdmin();

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("rental_requests")
    .update({ owner_response_notes: notes })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/requests");
  return { success: true };
}

export async function generateCommission(requestId: string) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  // 1. Fetch request to get dates and listing ID
  const { data: request, error: requestError } = await adminClient
    .from("rental_requests")
    .select("start_date, end_date, listing_id")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    return { error: "Failed to fetch rental request" };
  }

  // 2. Fetch rental terms to calculate base amount accurately
  const { data: terms, error: termsError } = await adminClient
    .from("rental_terms")
    .select("daily_price, weekly_price, monthly_price")
    .eq("listing_id", request.listing_id)
    .single();

  if (termsError || !terms) {
    return { error: "Failed to fetch rental terms" };
  }

  // 3. Calculate days
  const start = new Date(request.start_date);
  const end = new Date(request.end_date);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const days = diffDays > 0 ? diffDays : 1; // Minimum 1 day

  // 4. Calculate commission base amount
  let baseAmount = 0;
  if (days >= 30 && terms.monthly_price) {
    const months = Math.floor(days / 30);
    const remainder = days % 30;
    baseAmount = (months * terms.monthly_price) + (remainder * (terms.daily_price || 0));
  } else if (days >= 7 && terms.weekly_price) {
    const weeks = Math.floor(days / 7);
    const remainder = days % 7;
    baseAmount = (weeks * terms.weekly_price) + (remainder * (terms.daily_price || 0));
  } else {
    baseAmount = days * (terms.daily_price || 0);
  }

  // 5. Calculate 5% fixed commission
  const commissionAmount = Math.round(baseAmount * 0.05);

  // 6. Insert into commissions table
  const { error: insertError } = await adminClient
    .from("commissions")
    .insert({
      rental_request_id: requestId,
      commission_rate: 5.00,
      commission_base_amount: baseAmount,
      commission_amount: commissionAmount,
      commission_status: "pending"
    });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/admin/requests");
  return { success: true };
}

export async function updateCommissionStatus(commissionId: string, status: string) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("commissions")
    .update({ commission_status: status })
    .eq("id", commissionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/requests");
  return { success: true };
}
