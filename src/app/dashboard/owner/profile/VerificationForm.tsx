"use client";

import { useState } from "react";
import { requestOwnerVerification } from "./actions";
import { useRouter } from "next/navigation";

export default function VerificationForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRequest() {
    setIsPending(true);
    setError(null);
    const result = await requestOwnerVerification();
    
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
    setIsPending(false);
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        To ensure the safety of our marketplace, we require all property owners to be verified. 
        Click the button below to initiate the manual verification process. Our Trust & Safety team will contact you to verify your identity and ownership documents.
      </p>
      
      {error && (
        <div className="auth-error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <button
        onClick={handleRequest}
        disabled={isPending}
        className="auth-button"
        style={{ width: "auto", padding: "0.75rem 1.5rem" }}
      >
        {isPending ? "Submitting Request..." : "Request Manual Verification"}
      </button>
      
      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "1rem" }}>
        Alternatively, you can contact us directly at <a href="mailto:support@myethioproperties.com" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>support@myethioproperties.com</a>.
      </p>
    </div>
  );
}
