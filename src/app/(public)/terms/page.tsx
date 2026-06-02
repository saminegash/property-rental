import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | MyEthioProperties",
  description: "Terms of Service for MyEthioProperties.",
};

export default function TermsPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
          <p className="text-slate-500 mb-8">Last updated: June 2026</p>
          
          <div className="prose prose-slate max-w-none">
            <p>
              Welcome to MyEthioProperties. By accessing or using our website, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>

            <h3>1. Acceptance of Terms</h3>
            <p>
              By creating an account, posting a listing, or submitting an inquiry, you agree to these terms. If you do not agree, please do not use our services.
            </p>

            <h3>2. User Accounts</h3>
            <p>
              You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h3>3. Listings and Content</h3>
            <p>
              Property owners and agents must ensure that all listings are accurate, up-to-date, and do not violate any local laws. We reserve the right to review, edit, or remove any listing at our discretion.
            </p>

            <h3>4. Privacy</h3>
            <p>
              Your use of the service is also governed by our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>

            <h3>5. Contact Us</h3>
            <p>
              If you have any questions about these Terms, please contact us at support@myethioproperties.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
