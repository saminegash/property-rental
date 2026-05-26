"use server";

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

export async function sendAdminNotification(payload: NotificationPayload) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@myethioproperties.com";
  const adminPhone = process.env.ADMIN_NOTIFICATION_PHONE || "Not Configured";
  const resendApiKey = process.env.RESEND_API_KEY;

  const subject = `⚠️ Alert: New ${payload.type.toUpperCase()} Inquiry for ${payload.category.toUpperCase()}!`;

  const htmlBody = `
    <h2>New Marketplace Inquiry</h2>
    <hr />
    <p><strong>Category:</strong> ${payload.category.toUpperCase()}</p>
    <p><strong>Inquiry Type:</strong> ${payload.type.toUpperCase()}</p>
    <p><strong>Listing Title:</strong> ${payload.listingTitle || "Unknown Listing"}</p>
    <br />
    <h3>Requester Details:</h3>
    <p><strong>Name:</strong> ${payload.renterName}</p>
    <p><strong>Phone:</strong> ${payload.renterPhone}</p>
    <p><strong>Email:</strong> ${payload.renterEmail || "N/A"}</p>
    <br />
    <h3>Request Context:</h3>
    ${payload.startDate ? `<p><strong>Start Date:</strong> ${payload.startDate}</p>` : ""}
    ${payload.endDate ? `<p><strong>End Date:</strong> ${payload.endDate}</p>` : ""}
    ${payload.preferredViewingDate ? `<p><strong>Preferred Viewing Date:</strong> ${payload.preferredViewingDate}</p>` : ""}
    ${payload.budgetAmount ? `<p><strong>Budget:</strong> ${payload.budgetAmount.toLocaleString()} ETB</p>` : ""}
    <p><strong>Message:</strong> ${payload.message || "No message left."}</p>
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
    ${payload.budgetAmount ? `Budget: ${payload.budgetAmount.toLocaleString()} ETB` : ""}
    Message: ${payload.message || "None"}
  `.trim().replace(/\n\s*\n/g, '\n');

  console.log(`[NOTIFICATION SYSTEM] Dispatching alerts for ${payload.renterName}...`);

  // 1. Dispatch Admin Email via Resend Fetch Rest API (fail-safe)
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
    console.warn(`[NOTIFICATION MOCK EMAIL] Resend API Key is missing. Email would have been sent to: ${adminEmail}`);
    console.log(`[MOCK EMAIL SUBJECT]: ${subject}`);
    console.log(`[MOCK EMAIL TEXT]:\n${textBody}`);
  }

  // 2. Dispatch Admin SMS Alert (Mock / SMS Gateway integration placeholder)
  console.log(`[NOTIFICATION SMS MOCK] SMS notification dispatched to admin (${adminPhone}):`);
  console.log(`[SMS PAYLOAD]: Alert: New ${payload.type} inquiry from ${payload.renterName} (${payload.renterPhone}) regarding ${payload.listingTitle || "listing"}. Review in Admin panel.`);
}
