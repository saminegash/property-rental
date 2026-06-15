import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | MyEthioProperties",
  description: "Privacy Policy for MyEthioProperties.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
          <p className="text-slate-500 mb-8">Last updated: June 2026</p>
          
          <div className="prose prose-slate max-w-none">
            <p>
              At MyEthioProperties, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>

            <h3>1. Information We Collect</h3>
            <p>
              We collect information that you provide directly to us, such as when you create or modify your account, request services, contact customer support, or otherwise communicate with us. This may include your name, email address, phone number, and any other information you choose to provide.
            </p>

            <h3>2. How We Use Your Information</h3>
            <p>
              We use the information we collect to provide, maintain, and improve our services, to process transactions, to send you related information, and to communicate with you about products, services, offers, promotions, and events.
            </p>

            <h3>3. Sharing of Information</h3>
            <p>
              We may share your information with property owners or potential renters/buyers as necessary to facilitate the services you request. We do not sell your personal information to third parties.
            </p>

            <h3>4. Security</h3>
            <p>
              We use reasonable administrative, technical, and physical security measures to protect your personal information.
            </p>

            <h3>5. Contact Us</h3>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at support@myethioproperties.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
