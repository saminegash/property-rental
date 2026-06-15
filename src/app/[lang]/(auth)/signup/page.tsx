"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  ClipboardCheck,
  Percent,
  BadgeCheck,
} from "lucide-react";
import { signup } from "../actions";
import { COMMISSION_COPY } from "@/lib/commission";

type Role = "user" | "owner";

export default function SignupPage() {
  const [role, setRole] = useState<Role>("user");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-blue-50/60 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        {/* Left: feature panel with architectural blueprint background (desktop only) */}
        <aside className="relative hidden lg:flex flex-col justify-between p-8 xl:p-10 border-r border-slate-200 overflow-hidden">
          {/* SVG decoration */}
          <Image
            src="/auth-pattern.svg"
            alt=""
            fill
            className="object-cover z-0"
            sizes="(min-width: 1024px) 42vw, 0vw"
            priority
          />
          {/* Light wash to keep cards crisp on top */}
          <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-[2px] z-0" />

          <div className="relative space-y-4">
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5 text-blue-600" />}
              title="Verified Owner Flow"
              description="Identity verification ensures property legitimacy."
            />
            <FeatureCard
              icon={<ClipboardCheck className="h-5 w-5 text-blue-600" />}
              title="Admin-Reviewed Requests"
              description="We confirm details before sharing contact."
            />
            <FeatureCard
              icon={<Percent className="h-5 w-5 text-blue-600" />}
              title="Transparent Commission"
              description={COMMISSION_COPY.description}
            />
          </div>

          <div className="relative mt-8 rounded-xl bg-white/85 backdrop-blur-sm border border-slate-200 p-4 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900">
              {COMMISSION_COPY.signupCalloutTitle}
            </h4>
            <p className="mt-1 text-xs text-slate-600">
              {COMMISSION_COPY.signupCalloutBody}
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <BadgeCheck className="h-3.5 w-3.5 text-blue-600" />
              Trust badge
            </div>
          </div>
        </aside>

        {/* Right: form */}
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Image
              src="/logo.webp"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="text-xl font-bold text-slate-900">
              MyEthioProperties
            </span>
          </div>

          <div
            className="mx-auto flex w-full max-w-sm rounded-full bg-slate-100 p-1 mb-6"
            role="tablist"
            aria-label="What do you want to do?"
          >
            <button
              type="button"
              role="tab"
              aria-selected={role === "user"}
              onClick={() => setRole("user")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                role === "user"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              I want to rent/buy
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={role === "owner"}
              onClick={() => setRole("owner")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                role === "owner"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              I want to list property
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Create your secure property account.
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign up to access verified listings and manage requests safely.
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
            <input type="hidden" name="role" value={role} />

            <Field label="Full Name" htmlFor="full_name">
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                minLength={2}
                autoComplete="name"
                placeholder="Full Name"
                className={inputClass}
              />
            </Field>

            <Field label="Phone Number" htmlFor="phone">
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                  +251
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  autoComplete="tel-national"
                  placeholder="Phone Number"
                  pattern="^0?[0-9]{9}$"
                  className={`${inputClass} rounded-l-none`}
                />
              </div>
            </Field>

            <Field label="Email" htmlFor="email">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass}
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                show={showPwd}
                onToggle={() => setShowPwd((v) => !v)}
              />
            </Field>

            <Field label="Confirm Password" htmlFor="confirm_password">
              <PasswordInput
                id="confirm_password"
                name="confirm_password"
                placeholder="Confirm Password"
                autoComplete="new-password"
                show={showConfirmPwd}
                onToggle={() => setShowConfirmPwd((v) => !v)}
              />
            </Field>

            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="agree_terms"
                required
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-blue-600 hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-slate-700 mb-1.5"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function PasswordInput({
  id,
  name,
  placeholder = "Password",
  autoComplete,
  show,
  onToggle,
}: {
  id: string;
  name: string;
  placeholder?: string;
  autoComplete: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        required
        minLength={6}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${inputClass} pr-10`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <Eye className="h-4 w-4" aria-hidden="true" />
        ) : (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm p-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
