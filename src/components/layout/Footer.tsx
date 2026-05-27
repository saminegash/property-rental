import Link from "next/link";
import Image from "next/image";

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund & Commission Policy" },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-blue-900 text-blue-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.webp"
              alt="MyEthioProperties"
              width={28}
              height={28}
              className="h-7 w-auto object-contain"
            />
            <div className="flex flex-col text-sm leading-tight">
              <span className="font-semibold text-white">MyEthioProperties</span>
              <span className="text-blue-200">
                Ethiopia&apos;s trusted marketplace for properties and cars.
              </span>
            </div>
          </div>

          {/* Contact */}
          <div className="text-xs text-blue-200 sm:text-sm">
            <p>📞 +251 9XX-XXX-XXX</p>
            <p>✉ info@myethioproperties.com</p>
          </div>

          {/* Copyright */}
          <p className="text-xs text-blue-200 sm:text-sm">
            © {year} MyEthioProperties. All rights reserved.
          </p>

          {/* Legal */}
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-blue-200 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
