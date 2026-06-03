import { z } from "zod";

const PROPERTY_TYPES = ["apartment","house","villa","condominium","studio",
  "land","commercial","warehouse","vehicle"] as const;

const LISTING_TYPES = ["rent","sale"] as const;

const CURRENT_YEAR = new Date().getFullYear();

export const listingSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  property_type: z.enum(PROPERTY_TYPES),
  listing_type: z.enum(LISTING_TYPES),
  price: z.coerce.number().int().positive("Price must be greater than 0").max(10_000_000_000),
  city: z.string().trim().max(60).optional().nullable(),
  sub_city: z.string().trim().max(60).optional().nullable(),

  bedrooms: z.coerce.number().int().min(0).max(20).optional().nullable(),
  bathrooms: z.coerce.number().int().min(0).max(20).optional().nullable(),
  area_sqm: z.coerce.number().positive().max(100_000).optional().nullable(),
  parking_spaces: z.coerce.number().int().min(0).max(20).optional().nullable(),
  year_built: z.coerce.number().int().min(1900).max(CURRENT_YEAR + 1).optional().nullable(),

  // Vehicle fields → stored in details JSONB
  vehicle_make: z.string().trim().max(40).optional().nullable(),
  vehicle_model: z.string().trim().max(40).optional().nullable(),
  mileage_km: z.coerce.number().int().min(0).max(1_000_000).optional().nullable(),
  transmission: z.enum(["automatic","manual"]).optional().nullable(),
  fuel_type: z.enum(["petrol","diesel","hybrid","electric"]).optional().nullable(),
  body_type: z.string().trim().max(40).optional().nullable(),

  furnished: z.enum(["unfurnished","semi","fully"]).optional().nullable(),
  min_lease_months: z.coerce.number().int().min(1).max(60).optional().nullable(),
  security_deposit_amount: z.coerce.number().min(0).max(10_000_000_000).optional().nullable(),
  available_from: z.string().date().optional().nullable(),
  price_negotiable: z.coerce.boolean().optional(),
}).superRefine((v, ctx) => {
  // Vehicle requires make/model/year
  if (v.property_type === "vehicle") {
    if (!v.vehicle_make) ctx.addIssue({ code: "custom", path: ["vehicle_make"], message: "Required for vehicles" });
    if (!v.vehicle_model) ctx.addIssue({ code: "custom", path: ["vehicle_model"], message: "Required for vehicles" });
    if (!v.year_built) ctx.addIssue({ code: "custom", path: ["year_built"], message: "Required for vehicles" });
  }
  // Land requires area
  if (v.property_type === "land" && !v.area_sqm) {
    ctx.addIssue({ code: "custom", path: ["area_sqm"], message: "Land must have an area" });
  }
  // available_from must not be in the past
  if (v.available_from) {
    const today = new Date(); today.setHours(0,0,0,0);
    if (new Date(v.available_from) < today) {
      ctx.addIssue({ code: "custom", path: ["available_from"], message: "Must be today or a future date" });
    }
  }
});

export type ListingInput = z.infer<typeof listingSchema>;