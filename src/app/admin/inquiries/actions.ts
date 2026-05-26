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
  
  return user.id;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  "new_request": ["admin_reviewing"],
  "admin_reviewing": ["owner_contacted", "rejected"],
  "owner_contacted": ["owner_available", "owner_unavailable"],
  "owner_available": ["requester_contacted"],
  "requester_contacted": ["confirmed", "cancelled"],
  "confirmed": ["completed", "disputed"],
  "disputed": ["completed", "cancelled"],
  "rejected": [],
  "owner_unavailable": [],
  "cancelled": [],
  "completed": [],
};

export async function updateInquiryStatus(requestId: string, newStatus: string, overrideReason?: string) {
  const adminId = await ensureAdmin();
  const adminClient = createAdminClient();

  // 1. Fetch current status
  const { data: request, error: fetchError } = await adminClient
    .from("listing_requests")
    .select("status, admin_notes")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    return { error: "Failed to fetch inquiry" };
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
  
  if (currentStatus !== newStatus) {
    const { error: historyError } = await adminClient
      .from("request_status_history")
      .insert({
        request_id: requestId,
        request_table: "listing_requests",
        old_status: currentStatus,
        new_status: newStatus,
        changed_by: adminId,
        note: overrideReason || null,
        is_admin_override: !isValidTransition,
      });
      
    if (historyError) {
      console.error("Failed to insert status history:", historyError);
    }
  }

  const { error } = await adminClient
    .from("listing_requests")
    .update(updates)
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/inquiries");
  return { success: true };
}

export async function updateInquiryAdminNotes(requestId: string, notes: string) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("listing_requests")
    .update({ admin_notes: notes })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/inquiries");
  return { success: true };
}

export async function updateInquiryOwnerNotes(requestId: string, notes: string) {
  await ensureAdmin();
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("listing_requests")
    .update({ owner_response_notes: notes })
    .eq("id", requestId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/inquiries");
  return { success: true };
}

export async function getInquiryHistory(requestId: string) {
  await ensureAdmin();
  const adminClient = createAdminClient();
  
  const { data, error } = await adminClient
    .from("request_status_history")
    .select(`
      id,
      old_status,
      new_status,
      note,
      is_admin_override,
      created_at,
      changed_by
    `)
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });
    
  if (error) {
    return { error: error.message };
  }
  
  if (data && data.length > 0) {
    const userIds = [...new Set(data.map((h) => h.changed_by).filter(Boolean))];
    if (userIds.length > 0) {
      const { data: profiles } = await adminClient
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);
        
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
      
      const enrichedData = data.map((h) => ({
        ...h,
        changed_by_profile: h.changed_by ? profileMap.get(h.changed_by) : null
      }));
      return { data: enrichedData };
    }
  }
  
  return { data };
}
