import Link from "next/link";
import Image from "next/image";

interface FooterProps {
  lang: string;
  dict: {
    tagline: string;
    terms: string;
    privacy: string;
    contact: string;
    allRightsReserved: string;
  };
}

export default function Footer({ lang, dict }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-blue-900 text-blue-100">
      <div className="mx-auto px-4 sm:px-6 py-6">
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
              <span className="font-semibold text-white">
                MyEthioProperties
              </span>
              <span className="text-blue-200">
                {dict.tagline}
              </span>
            </div>
          </div>

          {/* Contact */}
          <div className="text-xs text-blue-200 sm:text-sm">
            <p>📞 +251 9XX-XXX-XXX</p>
            <p>✉ info@myethioproperties.com</p>
          </div>

          {/* Links */}
          <div className="flex gap-4 text-xs text-blue-200 sm:text-sm font-medium">
            <Link href={`/${lang}/terms`} className="hover:text-white">
              {dict.terms}
            </Link>
            <Link href={`/${lang}/privacy`} className="hover:text-white">
              {dict.privacy}
            </Link>
            <Link href={`/${lang}/contact`} className="hover:text-white">
              {dict.contact}
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-blue-200 sm:text-sm">
            © {year} MyEthioProperties. {dict.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
