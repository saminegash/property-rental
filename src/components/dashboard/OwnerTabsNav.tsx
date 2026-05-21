"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function OwnerTabsNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: "/dashboard/owner", exact: true },
    { name: "Cars", href: "/dashboard/owner/cars" },
    { name: "Properties", href: "/dashboard/owner/properties" },
    { name: "Requests", href: "/dashboard/owner/requests" },
    { name: "Earnings", href: "/dashboard/owner/earnings" },
    { name: "Analytics", href: "/dashboard/owner/analytics" },
    { name: "Profile", href: "/dashboard/owner/profile" },
  ];

  return (
    <div style={{ 
      display: "flex", 
      gap: "0.5rem", 
      overflowX: "auto", 
      paddingBottom: "1rem", 
      marginBottom: "2rem", 
      borderBottom: "1px solid var(--color-border)" 
    }}>
      {tabs.map((tab) => {
        const isActive = tab.exact 
          ? pathname === tab.href 
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.name}
            href={tab.href}
            style={{
              color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.9375rem",
              padding: "0.5rem 1rem",
              backgroundColor: isActive ? "var(--color-primary-light)" : "transparent",
              borderRadius: "var(--radius-md)",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease"
            }}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
