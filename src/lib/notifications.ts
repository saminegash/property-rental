"use server";

import { formatPrice } from "@/lib/format";

interface NotificationPayload {
  type: "rental" | "sale";
  category: "property" | "car";
  renterName: string;
  renterPhone: string;
  renterEmail?: string;
  message?: string;
  listingTitle?: string;
  startDate?: string;
  endDate?: string;
  preferredViewingDate?: string;
  budgetAmount?: number;
}

// Simple HTML escaping helper to prevent injection from user forms
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendAdminNotification(payload: NotificationPayload) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@myethioproperties.com";
  const adminPhone = process.env.ADMIN_NOTIFICATION_PHONE || "Not Configured";
  const resendApiKey = process.env.RESEND_API_KEY;

  // Twilio credentials
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_NUMBER;

  // Escape user inputs safely for HTML interpolation
  const escapedName = escapeHtml(payload.renterName);
  const escapedPhone = escapeHtml(payload.renterPhone);
  const escapedEmail = payload.renterEmail ? escapeHtml(payload.renterEmail) : "N/A";
  const escapedMessage = payload.message ? escapeHtml(payload.message) : "No message left.";
  const escapedTitle = payload.listingTitle ? escapeHtml(payload.listingTitle) : "Unknown Listing";
  const escapedStartDate = payload.startDate ? escapeHtml(payload.startDate) : "";
  const escapedEndDate = payload.endDate ? escapeHtml(payload.endDate) : "";
  const escapedPreferredViewingDate = payload.preferredViewingDate ? escapeHtml(payload.preferredViewingDate) : "";

  const subject = `⚠️ Alert: New ${payload.type.toUpperCase()} Inquiry for ${payload.category.toUpperCase()}!`;

  const htmlBody = `
    <h2>New Marketplace Inquiry</h2>
    <hr />
    <p><strong>Category:</strong> ${payload.category.toUpperCase()}</p>
    <p><strong>Inquiry Type:</strong> ${payload.type.toUpperCase()}</p>
    <p><strong>Listing Title:</strong> ${escapedTitle}</p>
    <br />
    <h3>Requester Details:</h3>
    <p><strong>Name:</strong> ${escapedName}</p>
    <p><strong>Phone:</strong> ${escapedPhone}</p>
    <p><strong>Email:</strong> ${escapedEmail}</p>
    <br />
    <h3>Request Context:</h3>
    ${escapedStartDate ? `<p><strong>Start Date:</strong> ${escapedStartDate}</p>` : ""}
    ${escapedEndDate ? `<p><strong>End Date:</strong> ${escapedEndDate}</p>` : ""}
    ${escapedPreferredViewingDate ? `<p><strong>Preferred Viewing Date:</strong> ${escapedPreferredViewingDate}</p>` : ""}
    ${payload.budgetAmount ? `<p><strong>Budget:</strong> ${formatPrice(payload.budgetAmount)}</p>` : ""}
    <p><strong>Message:</strong> ${escapedMessage}</p>
    <br />
    <p style="color: #666; font-size: 0.8rem;">Submitted via MyEthioProperties Trust & Safety Notification Layer.</p>
  `;

  const textBody = `
    New Marketplace Inquiry Alert!
    Category: ${payload.category.toUpperCase()} (${payload.type.toUpperCase()})
    Listing: ${payload.listingTitle || "Unknown"}    
    Name: ${payload.renterName}
    Phone: ${payload.renterPhone}
    Email: ${payload.renterEmail || "N/A"}
    
    ${payload.startDate ? `Start: ${payload.startDate}` : ""}
    ${payload.endDate ? `End: ${payload.endDate}` : ""}
    ${payload.preferredViewingDate ? `Preferred Date: ${payload.preferredViewingDate}` : ""}
    ${payload.budgetAmount ? `Budget: ${formatPrice(payload.budgetAmount)}` : ""}
    Message: ${payload.message || "None"}
  `.trim().replace(/\n\s*\n/g, '\n');

  console.log(`[NOTIFICATION SYSTEM] Dispatching alerts for ${payload.renterName}...`);

  // 1. Dispatch Admin Email via Resend Fetch REST API (fail-safe)
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "notifications@myethioproperties.com",
          to: [adminEmail],
          subject: subject,
          html: htmlBody,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[NOTIFICATION ERROR] Resend email dispatch failed: ${errText}`);
      } else {
        console.log(`[NOTIFICATION SUCCESS] Admin email alert sent to ${adminEmail}`);
      }
    } catch (err) {
      console.error("[NOTIFICATION ERROR] Exception during Resend email dispatch:", err);
    }
  } else {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "********************************************************************************\n" +
        "🚨 CRITICAL CONFIGURATION ERROR: RESEND_API_KEY IS MISSING IN PRODUCTION!\n" +
        "🚨 ADMIN EMAIL ALERTS CANNOT BE SENT! THIS IS A SEVERE OPERATIONAL FAILURE.\n" +
        "********************************************************************************"
      );
    } else {
      console.warn(`[NOTIFICATION MOCK EMAIL] Resend API Key is missing. Email would have been sent to: ${adminEmail}`);
      console.log(`[MOCK EMAIL SUBJECT]: ${subject}`);
      console.log(`[MOCK EMAIL TEXT]:\n${textBody}`);
    }
  }

  // 2. Dispatch Admin SMS Alert via Twilio REST API
  const smsText = `Alert: New ${payload.type} inquiry from ${payload.renterName} (${payload.renterPhone}) regarding "${payload.listingTitle || "listing"}". Review in Admin panel.`;

  if (twilioSid && twilioAuthToken && twilioFrom && adminPhone !== "Not Configured") {
    try {
      // Perform basic auth encoding for Twilio without external packages
      const basicAuth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString("base64");
      
      const params = new URLSearchParams();
      params.append("To", adminPhone);
      params.append("From", twilioFrom);
      params.append("Body", smsText);

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[NOTIFICATION ERROR] Twilio SMS dispatch failed: ${errText}`);
      } else {
        console.log(`[NOTIFICATION SUCCESS] Admin SMS alert sent to ${adminPhone}`);
      }
    } catch (err) {
      console.error("[NOTIFICATION ERROR] Exception during Twilio SMS dispatch:", err);
    }
  } else {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "********************************************************************************\n" +
        "🚨 OPERATIONAL WARNING: TWILIO SMS CREDENTIALS ARE MISSING IN PRODUCTION!\n" +
        "🚨 ADMIN SMS ALERTS CANNOT BE SENT. RUNNING IN MOCK MODE.\n" +
        "********************************************************************************"
      );
    }
    console.log(`[NOTIFICATION SMS MOCK] SMS notification dispatched to admin (${adminPhone}):`);
    console.log(`[SMS PAYLOAD]: ${smsText}`);
  }
}
