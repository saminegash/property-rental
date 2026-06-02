"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock, ArrowLeft } from "lucide-react";
import { resetPassword } from "../actions";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setLoading(true);

    const result = await resetPassword(formData);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(true);
    }
    
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-blue-50/60 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Lock className="h-6 w-6 text-blue-600" aria-hidden="true" />
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Reset Password
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success ? (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <p className="text-sm font-medium text-green-800">
              Check your email for a reset link.
            </p>
            <p className="mt-2 text-xs text-green-700">
              If you don't see it, check your spam folder.
            </p>
          </div>
        ) : (
          <form action={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Email address"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending Link..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
