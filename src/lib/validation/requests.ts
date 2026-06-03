import { z } from "zod";

const PHONE_RE = /^(\+251|0)?[79]\d{8}$/; // Ethiopian mobile

export const requestSchema = z.object({
  listing_id: z.string().uuid(),
  name: z.string().trim().min(2, "Name is too short").max(80),
  phone: z.string().trim().regex(PHONE_RE, "Enter a valid Ethiopian phone number"),
  email: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  message: z.string().trim().max(2000).optional().nullable(),
  request_type: z.enum(["rental","purchase","viewing","info"]),
  start_date: z.string().date().optional().nullable(),
  end_date: z.string().date().optional().nullable(),
  offered_price: z.coerce.number().int().positive().optional().nullable(),
}).superRefine((v, ctx) => {
  const today = new Date(); today.setHours(0,0,0,0);

  if (v.start_date) {
    const start = new Date(v.start_date);
    if (start < today) ctx.addIssue({ code: "custom", path: ["start_date"], message: "Start date can't be in the past" });
  }
  if (v.start_date && v.end_date) {
    if (new Date(v.end_date) <= new Date(v.start_date)) {
      ctx.addIssue({ code: "custom", path: ["end_date"], message: "End date must be after the start date" });
    }
  }
  if (v.request_type === "rental" && !v.start_date) {
    ctx.addIssue({ code: "custom", path: ["start_date"], message: "Start date is required for rentals" });
  }
});