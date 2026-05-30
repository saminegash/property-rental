"use client";

import { useState } from "react";
import { signup } from "../actions";
import Link from "next/link";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = await signup(formData);

    // If we get here, redirect didn't happen — there was an error
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="auth-card">
      <h2 className="auth-title">Create an account</h2>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="form-input"
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="form-input"
            placeholder="••••••••"
          />
        </div>

        <fieldset className="form-group">
          <legend className="form-label">I want to</legend>
          <div className="role-options">
            <label htmlFor="role-user" className="role-option">
              <input
                id="role-user"
                type="radio"
                name="role"
                value="user"
                defaultChecked
                className="role-radio"
              />
              <span className="role-card">
                <span className="role-icon">🔍</span>
                <span className="role-name">Rent a car</span>
                <span className="role-desc">Browse and request vehicles</span>
              </span>
            </label>

            <label htmlFor="role-owner" className="role-option">
              <input
                id="role-owner"
                type="radio"
                name="role"
                value="owner"
                className="role-radio"
              />
              <span className="role-card">
                <span className="role-icon">🚗</span>
                <span className="role-name">List my car</span>
                <span className="role-desc">Earn by renting your vehicle</span>
              </span>
            </label>
          </div>
        </fieldset>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account?{" "}
        <Link href="/login" className="auth-link">
          Log in
        </Link>
      </p>
    </div>
  );
}
