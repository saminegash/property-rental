// src/app/dashboard/owner/listings/new/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { createListing } from "../actions";

type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "condominium"
  | "studio"
  | "land"
  | "commercial"
  | "warehouse"
  | "vehicle";
type ListingType = "rent" | "sale";

export default function NewListingPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dashboard-title mb-1">Create New Listing</h1>
          <p className="dashboard-hint">
            Fill in the details below. Your listing will be sent for admin
            review.
          </p>
        </div>
        <Link
          href="/dashboard/owner/listings"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to Listings
        </Link>
      </div>

      <div className="dashboard-card p-4 sm:p-6">
        <form action={createListing} noValidate className="space-y-5">
          <ListingFormFields />

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row">
            <Link
              href="/dashboard/owner/listings"
              className="auth-button auth-button--secondary text-center"
            >
              Cancel
            </Link>
            <button type="submit" className="auth-button">
              Submit for Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ListingFormFields({
  defaults = {},
}: {
  defaults?: Record<string, string | number | null | undefined>;
}) {
  const d = defaults;
  const [propertyType, setPropertyType] = useState<PropertyType>(
    (d.property_type as PropertyType) || "apartment",
  );
  const [listingType, setListingType] = useState<ListingType>(
    (d.listing_type as ListingType) || "rent",
  );

  const isVehicle = propertyType === "vehicle";
  const isLand = propertyType === "land";
  const isProperty = !isVehicle; // houses, apartments, commercial, land, etc.

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Listing type FIRST so the form can adapt */}
      <Select
        id="listing_type"
        label="I want to *"
        required
        value={listingType}
        onChange={(v) => setListingType(v as ListingType)}
      >
        <option value="rent">Rent it out</option>
        <option value="sale">Sell it</option>
      </Select>

      <Select
        id="property_type"
        label="Category *"
        required
        value={propertyType}
        onChange={(v) => setPropertyType(v as PropertyType)}
      >
        <optgroup label="Property">
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="condominium">Condominium</option>
          <option value="studio">Studio</option>
          <option value="land">Land</option>
          <option value="commercial">Commercial</option>
          <option value="warehouse">Warehouse</option>
        </optgroup>
        <optgroup label="Vehicle">
          <option value="vehicle">Car / Vehicle</option>
        </optgroup>
      </Select>

      <Text
        id="title"
        label="Title *"
        required
        minLength={5}
        maxLength={120}
        className="sm:col-span-2"
        placeholder={
          isVehicle
            ? "e.g. 2019 Toyota RAV4 — Low Mileage"
            : "e.g. 3-Bedroom Apartment in Bole"
        }
        defaultValue={d.title as string}
      />

      <Textarea
        id="description"
        label="Description"
        rows={4}
        className="sm:col-span-2"
        maxLength={2000}
        placeholder={
          isVehicle
            ? "Condition, service history, features, why you're selling…"
            : "Amenities, condition, nearby landmarks, lease terms…"
        }
        defaultValue={d.description as string}
      />

      <Number
        id="price"
        label={
          listingType === "rent"
            ? isVehicle
              ? "Price per day (ETB) *"
              : "Monthly rent (ETB) *"
            : "Asking price (ETB) *"
        }
        required
        min={1}
        placeholder="e.g. 50000"
        defaultValue={d.price ? String(d.price) : ""}
      />

      {listingType === "sale" && (
        <label className="flex items-center gap-2 text-sm self-end">
          <input
            type="checkbox"
            name="price_negotiable"
            defaultChecked
            className="h-4 w-4 rounded border-slate-300"
          />
          Price is negotiable
        </label>
      )}

      {/* Location (vehicles still have a city / pickup location) */}
      <Text
        id="city"
        label="City"
        placeholder="e.g. Addis Ababa"
        defaultValue={d.city as string}
      />
      <Text
        id="sub_city"
        label={isVehicle ? "Pickup area" : "Sub-city / Area"}
        placeholder={isVehicle ? "e.g. Bole" : "e.g. Bole"}
        defaultValue={d.sub_city as string}
      />

      {/* ───── Vehicle-only ───── */}
      {isVehicle && (
        <>
          <Text
            id="vehicle_make"
            label="Make *"
            required
            placeholder="Toyota"
          />
          <Text
            id="vehicle_model"
            label="Model *"
            required
            placeholder="RAV4"
          />
          <Number
            id="year_built"
            label="Year *"
            required
            min={1980}
            max={new Date().getFullYear() + 1}
            placeholder="2019"
          />
          <Number
            id="mileage_km"
            label="Mileage (km)"
            min={0}
            max={1000000}
            placeholder="65000"
          />
          <Select id="transmission" label="Transmission">
            <option value="">Select…</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </Select>
          <Select id="fuel_type" label="Fuel">
            <option value="">Select…</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
            <option value="electric">Electric</option>
          </Select>
          <Select id="body_type" label="Body type" className="sm:col-span-2">
            <option value="">Select…</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="hatchback">Hatchback</option>
            <option value="pickup">Pickup / Truck</option>
            <option value="van">Van / Minibus</option>
            <option value="coupe">Coupe</option>
          </Select>
        </>
      )}

      {/* ───── Property (non-land, non-vehicle) ───── */}
      {isProperty && !isLand && (
        <>
          <Number
            id="bedrooms"
            label="Bedrooms"
            min={0}
            max={20}
            placeholder="3"
            defaultValue={d.bedrooms ? String(d.bedrooms) : ""}
          />
          <Number
            id="bathrooms"
            label="Bathrooms"
            min={0}
            max={20}
            placeholder="2"
            defaultValue={d.bathrooms ? String(d.bathrooms) : ""}
          />
          <Number
            id="area_sqm"
            label="Area (m²)"
            min={1}
            max={100000}
            placeholder="120"
            defaultValue={d.area_sqm ? String(d.area_sqm) : ""}
          />
          <Number
            id="parking_spaces"
            label="Parking spaces"
            min={0}
            max={20}
            placeholder="1"
          />
          <Number
            id="year_built"
            label="Year built"
            min={1900}
            max={new Date().getFullYear()}
            placeholder="2018"
          />
          <Select id="furnished" label="Furnished">
            <option value="">Select…</option>
            <option value="unfurnished">Unfurnished</option>
            <option value="semi">Semi-furnished</option>
            <option value="fully">Fully furnished</option>
          </Select>
        </>
      )}

      {/* ───── Land-only ───── */}
      {isLand && (
        <>
          <Number
            id="area_sqm"
            label="Area (m²) *"
            required
            min={1}
            placeholder="500"
          />
          <Select id="land_use" label="Allowed use">
            <option value="">Select…</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="mixed">Mixed-use</option>
            <option value="agricultural">Agricultural</option>
          </Select>
        </>
      )}

      {/* ───── Rent-only extras ───── */}
      {listingType === "rent" && !isVehicle && (
        <>
          <Number
            id="security_deposit_amount"
            label="Security deposit (ETB)"
            min={0}
            placeholder="e.g. 50000"
          />
          <Number
            id="min_lease_months"
            label="Minimum lease (months)"
            min={1}
            max={60}
            placeholder="6"
          />
          <DateInput
            id="available_from"
            label="Available from"
            min={new Date().toISOString().slice(0, 10)}
          />
        </>
      )}

      {listingType === "rent" && isVehicle && (
        <DateInput
          id="available_from"
          label="Available from"
          min={new Date().toISOString().slice(0, 10)}
        />
      )}
    </div>
  );
}

/* Small typed input helpers — all mobile-first, all use form-input class */
type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};
type TextareaFieldProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

function Text(p: InputFieldProps) {
  return (
    <div className={p.className}>
      <label htmlFor={p.id} className="form-label">
        {p.label}
      </label>
      <input {...p} type="text" name={p.id} className="form-input w-full" />
    </div>
  );
}
function Number(p: InputFieldProps) {
  return (
    <div className={p.className}>
      <label htmlFor={p.id} className="form-label">
        {p.label}
      </label>
      <input
        {...p}
        type="number"
        name={p.id}
        inputMode="numeric"
        className="form-input w-full"
      />
    </div>
  );
}
function DateInput(p: InputFieldProps) {
  return (
    <div className={p.className}>
      <label htmlFor={p.id} className="form-label">
        {p.label}
      </label>
      <input {...p} type="date" name={p.id} className="form-input w-full" />
    </div>
  );
}
function Textarea(p: TextareaFieldProps) {
  return (
    <div className={p.className}>
      <label htmlFor={p.id} className="form-label">
        {p.label}
      </label>
      <textarea {...p} name={p.id} className="form-input w-full resize-y" />
    </div>
  );
}
function Select({
  id,
  label,
  required,
  value,
  onChange,
  children,
  className,
}: {
  id: string;
  label: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <select
        id={id}
        name={id}
        required={required}
        defaultValue={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="form-input form-select w-full"
      >
        {children}
      </select>
    </div>
  );
}
