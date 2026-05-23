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

const VALID_TRANSITIONS: Record<string, string[]> = {
  "new_request": ["admin_reviewing"],
  "admin_reviewing": ["owner_contacted", "rejected"],
  "owner_contacted": ["owner_available", "owner_unavailable"],
  "owner_available": ["renter_contacted"],
  "renter_contacted": ["awaiting_payment", "cancelled"],
  "awaiting_payment": ["confirmed"],
  "confirmed": ["active"],
  "active": ["completed", "disputed"],
  "disputed": ["completed", "cancelled"],
  "rejected": [],
  "owner_unavailable": [],
  "cancelled": [],
  "completed": [],
};

export async function updateRequestStatus(requestId: string, newStatus: string, overrideReason?: string) {
  await ensureAdmin();

  const adminClient = createAdminClient();

  // 1. Fetch current status
  const { data: request, error: fetchError } = await adminClient
    .from("rental_requests")
    .select("status, admin_notes")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    return { error: "Failed to fetch rental request" };
  }

  const currentStatus = request.status;
  
  // 2. Validate transition
  const validNextStatuses = VALID_TRANSITIONS[currentStatus] || [];
  const isValidTransition = validNextStatuses.includes(newStatus);

  if (!isValidTransition && currentStatus !== newStatus) {
    if (!overrideReason) {
      return { 
        error: `Invalid transition from '${currentStatus}' to '${newStatus}'.`,
        requiresOverride: true 
      };
    }
  }

  // 3. Prepare updates
  const updates: { status: string; admin_notes?: string } = { status: newStatus };
  
  // If it was an override, log the reason in admin_notes
  if (!isValidTransition && currentStatus !== newStatus && overrideReason) {
    const timestamp = new Date().toISOString();
    const overrideNote = `[${timestamp}] SYSTEM - Status Override (${currentStatus} → ${newStatus}): ${overrideReason}`;
    updates.admin_notes = request.admin_notes 
      ? `${request.admin_notes}\n\n${overrideNote}`
      : overrideNote;
  }
  
  // TODO: If a status_history table is created later, insert the transition record here.

  const { error } = await adminClient
    .from("rental_requests")
    .update(updates)
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

  // 2. Fetch rental terms — only base rental price feeds into commission
  const { data: terms, error: termsError } = await adminClient
    .from("rental_terms")
    .select("daily_price, weekly_price, monthly_price")
    .eq("listing_id", request.listing_id)
    .single();

  if (termsError || !terms) {
    return { error: "Failed to fetch rental terms" };
  }

  // 3. Calculate rental duration in days
  const start = new Date(request.start_date);
  const end = new Date(request.end_date);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const days = diffDays > 0 ? diffDays : 1; // Minimum 1 day

  // 4. Calculate base rental amount (rental price only — no driver/delivery/deposit)
  let baseAmount = 0;
  if (days >= 30 && terms.monthly_price) {
    const months = Math.floor(days / 30);
    const remainder = days % 30;
    baseAmount = months * terms.monthly_price + remainder * (terms.daily_price || 0);
  } else if (days >= 7 && terms.weekly_price) {
    const weeks = Math.floor(days / 7);
    const remainder = days % 7;
    baseAmount = weeks * terms.weekly_price + remainder * (terms.daily_price || 0);
  } else {
    baseAmount = days * (terms.daily_price || 0);
  }

  // 5. Apply fixed 5% commission per spec.md
  const commissionRate = 5.00;
  const commissionAmount = Math.round(baseAmount * 0.05);
  const commissionType = "percentage";

  // 6. Check if commission already exists for this request
  const { data: existing } = await adminClient
    .from("commissions")
    .select("id")
    .eq("rental_request_id", requestId)
    .single();

  if (existing) {
    return { error: "Commission has already been generated for this request" };
  }

  // 7. Insert into commissions table
  const { error: insertError } = await adminClient
    .from("commissions")
    .insert({
      rental_request_id: requestId,
      commission_rate: commissionRate,
      commission_base_amount: baseAmount,
      commission_amount: commissionAmount,
      commission_status: "pending",
      commission_type: commissionType,
      rental_days: days,
    });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/admin/requests");
  return {
    success: true,
    commission_amount: commissionAmount,
    commission_type: commissionType,
    rental_days: days,
  };
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

export async function generateSecurityDeposit(requestId: string) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  // 1. Fetch request to get listing ID
  const { data: request, error: requestError } = await adminClient
    .from("rental_requests")
    .select("listing_id")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    return { error: "Failed to fetch rental request" };
  }

  // 2. Fetch rental terms to get required deposit amount
  const { data: terms, error: termsError } = await adminClient
    .from("rental_terms")
    .select("security_deposit_amount")
    .eq("listing_id", request.listing_id)
    .single();

  if (termsError || !terms) {
    return { error: "Failed to fetch rental terms" };
  }

  // 3. Insert into security_deposits table
  const depositStatus = terms.security_deposit_amount > 0 ? "pending" : "not_required";

  const { error: insertError } = await adminClient
    .from("security_deposits")
    .insert({
      rental_request_id: requestId,
      deposit_amount: terms.security_deposit_amount,
      deposit_status: depositStatus
    });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/admin/requests");
  return { success: true };
}

export async function updateSecurityDeposit(depositId: string, updates: { deposit_status?: string, payment_method?: string, admin_notes?: string }) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("security_deposits")
    .update(updates)
    .eq("id", depositId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/requests");
  return { success: true };
}
