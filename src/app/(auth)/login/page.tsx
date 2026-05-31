"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  ClipboardList,
  TrendingUp,
  ShieldCheck,
  Handshake,
  Lock,
} from "lucide-react";
import { login } from "../actions";

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-blue-50/60 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid lg:grid-cols-2">
        {/* Left: elegant cityscape illustration + feature cards (desktop only) */}
        <aside className="relative hidden lg:block min-h-[560px]">
          {/* SVG hero — replaces /luxury.jpg */}
          <Image
            src="/auth-hero.svg"
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 0vw"
            priority
          />
          {/* Subtle inner shadow so the right edge blends into the form panel */}
          <div className="absolute inset-y-0 right-0 w-24 bg-linear-to-l from-white/15 to-transparent pointer-events-none" />

          <div className="relative z-10 flex h-full flex-col p-8 xl:p-10">
            <div className="flex items-center gap-2 text-white drop-shadow-lg">
              <Image
                src="/logo.webp"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-xl font-bold">MyEthioProperties</span>
            </div>

            <div className="mt-10 space-y-3">
              <OverlayFeatureCard
                icon={<ClipboardList className="h-5 w-5 text-blue-600" />}
                title="Manage Requests"
                description="Review your property inquiries easily."
              />
              <OverlayFeatureCard
                icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
                title="Track Property Listings"
                description="Monitor your for-sale or for-rent properties."
              />
              <OverlayFeatureCard
                icon={<ShieldCheck className="h-5 w-5 text-blue-600" />}
                title="Admin-reviewed Communication"
                description="All messages are verified for safety."
              />
              <OverlayFeatureCard
                icon={<Handshake className="h-5 w-5 text-blue-600" />}
                title="Safe Rent/Buy Process"
                description="A secure platform for reliable transactions."
              />
            </div>
          </div>
        </aside>

        {/* Right: login form */}
        <div className="flex items-center bg-slate-50/60 p-6 sm:p-8 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                <Lock className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
            </div>

            <h1 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome Back
            </h1>
            <p className="mt-2 text-center text-sm text-slate-600">
              Continue your secure property journey.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </div>
            )}

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
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPwd ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete="current-password"
                    placeholder="Password"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <div className="mt-1.5 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging In..." : "Log In"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
              <span className="h-px flex-1 bg-slate-200" />
              <span>or continue with</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-blue-600 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

function OverlayFeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/30 bg-white/95 p-3.5 shadow-lg backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
