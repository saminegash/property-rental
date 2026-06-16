"use client";

import { useTransition, useState } from "react";
import { submitRequest } from "@/app/[lang]/(public)/actions";

interface RequestFormProps {
  listingId: string;
  listingType: "rent" | "sale";
  propertyType: string;
}

export function RequestForm({ listingId, listingType, propertyType }: RequestFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    formData.append("listing_id", listingId);
    
    // Automatically set request_type if not selected
    if (!formData.get("request_type")) {
      formData.append("request_type", listingType === "rent" ? "rental" : "purchase");
    }

    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await submitRequest(formData);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || "Failed to submit request. Please try again.");
      }
    });
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-green-900 mb-2">Request Submitted!</h3>
        <p className="text-sm text-green-700">
          We have received your request and will contact you shortly.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm font-medium text-green-700 hover:text-green-600 underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-1">
        {listingType === "rent" ? "Request to Rent" : "Inquire to Buy"}
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Fill out the form below and we'll get back to you.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form action={handleAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Abebe Kebede"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0911234567"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="abebe@example.com"
          />
        </div>

        <div>
          <label htmlFor="request_type" className="block text-sm font-medium text-gray-700 mb-1">
            Request Type *
          </label>
          <select
            id="request_type"
            name="request_type"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue={listingType === "rent" ? "rental" : "purchase"}
          >
            {listingType === "rent" ? (
              <option value="rental">Rental Inquiry</option>
            ) : (
              <option value="purchase">Purchase Inquiry</option>
            )}
            <option value="viewing">Schedule a Viewing</option>
            <option value="info">General Information</option>
          </select>
        </div>

        {listingType === "rent" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-gray-400 font-normal">(Opt)</span>
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-gray-400 font-normal">(Opt)</span>
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {listingType === "sale" && (
          <div>
            <label htmlFor="offered_price" className="block text-sm font-medium text-gray-700 mb-1">
              Offer Price (ETB) <span className="text-gray-400 font-normal">(Opt)</span>
            </label>
            <input
              type="number"
              id="offered_price"
              name="offered_price"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 5000000"
            />
          </div>
        )}

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="I'm interested in this property..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
