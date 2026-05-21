import Link from "next/link";
import React from "react";
import { createClient } from "@/lib/supabase/server";

export async function PropertyCategoriesSection() {
  const supabase = await createClient();

  // Fetch only property_details linked to published listings to aggregate counts
  const { data: properties } = await supabase
    .from("property_details")
    .select(`
      property_types(name),
      listings!inner(status)
    `)
    .eq("listings.status", "published");

  // Aggregate counts by property type name
  const counts: Record<string, number> = {};
  if (properties) {
    for (const prop of properties) {
      // Supabase types might infer this as an array or object depending on schema
      const pt = prop.property_types as { name: string } | { name: string }[] | null;
      const typeName = Array.isArray(pt) ? pt[0]?.name : pt?.name;

      if (typeName) {
        counts[typeName] = (counts[typeName] || 0) + 1;
      }
    }
  }

  // Pre-defined metadata for categories requested by user
  // Map "Houses" to "Villa" or generic "House" if they overlap.
  const categories = [
    {
      title: "Apartments",
      dbType: "Apartment",
      description: "Modern living spaces",
      icon: "🏢",
      color: "bg-blue-50 text-blue-600",
      link: "type=Apartment",
    },
    {
      title: "Houses",
      dbType: "House", // Typically mapped to Villa or specific house type
      description: "Perfect for families",
      icon: "🏠",
      color: "bg-emerald-50 text-emerald-600",
      link: "type=House",
    },
    {
      title: "Villas",
      dbType: "Villa",
      description: "Luxury and space",
      icon: "🏡",
      color: "bg-purple-50 text-purple-600",
      link: "type=Villa",
    },
    {
      title: "Land",
      dbType: "Land",
      description: "Build your dream",
      icon: "🌍",
      color: "bg-orange-50 text-orange-600",
      link: "type=Land",
    },
    {
      title: "Condominiums",
      dbType: "Condominium",
      description: "Community lifestyle",
      icon: "🏘️",
      color: "bg-slate-100 text-slate-600",
      link: "type=Condominium",
    },
    {
      title: "Commercial",
      dbType: "Commercial",
      description: "For your business",
      icon: "🏪",
      color: "bg-teal-50 text-teal-600",
      link: "type=Commercial",
    },
    {
      title: "Offices",
      dbType: "Office",
      description: "Professional workspaces",
      icon: "💼",
      color: "bg-sky-50 text-sky-600",
      link: "type=Office",
    },
    {
      title: "Warehouses",
      dbType: "Warehouse",
      description: "Storage and logistics",
      icon: "🏭",
      color: "bg-indigo-50 text-indigo-600",
      link: "type=Warehouse",
    },
  ];

  return (
    <section className="car-categories" id="browse-property-categories">
      <div className="car-categories__inner">
        <div className="car-categories__header">
          <div>
            <h2 className="car-categories__title">Browse Properties by Category</h2>
            <p className="car-categories__subtitle">Find the perfect property for your needs</p>
          </div>
          <Link href="/properties" className="car-categories__view-all">
            View all categories →
          </Link>
        </div>

        <div className="car-categories__grid">
          {categories.map((cat) => {
            const count = counts[cat.dbType] || 0;
            return (
              <Link
                key={cat.title}
                href={`/properties?${cat.link}`}
                className="car-category-card group"
              >
                <div className={`car-category-card__icon ${cat.color}`}>
                  <span aria-hidden="true">{cat.icon}</span>
                </div>
                <div className="car-category-card__content">
                  <h3 className="car-category-card__title">
                    {cat.title}
                  </h3>
                  <p className="car-category-card__desc">
                    {cat.description}
                  </p>
                  {count > 0 ? (
                    <span className="text-sm font-medium text-blue-600 mt-1 block">
                      {count} Available
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
