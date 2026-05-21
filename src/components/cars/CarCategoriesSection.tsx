import Link from "next/link";
import React from "react";

export function CarCategoriesSection() {
  const categories = [
    {
      title: "Economy Cars",
      description: "Affordable and fuel-efficient",
      icon: "🚗",
      color: "bg-blue-50 text-blue-600",
      link: "economy",
    },
    {
      title: "SUVs",
      description: "Spacious and powerful",
      icon: "🚙",
      color: "bg-emerald-50 text-emerald-600",
      link: "suv",
    },
    {
      title: "Luxury Cars",
      description: "Premium comfort and style",
      icon: "✨",
      color: "bg-purple-50 text-purple-600",
      link: "luxury",
    },
    {
      title: "With Driver",
      description: "Relax and let us drive",
      icon: "👨‍✈️",
      color: "bg-orange-50 text-orange-600",
      link: "driver=with",
    },
    {
      title: "Without Driver",
      description: "Drive yourself anywhere",
      icon: "🔑",
      color: "bg-slate-100 text-slate-600",
      link: "driver=without",
    },
    {
      title: "Delivery Available",
      description: "Cars brought to your door",
      icon: "📍",
      color: "bg-teal-50 text-teal-600",
      link: "delivery=true",
    },
    {
      title: "Electric Cars",
      description: "Eco-friendly driving",
      icon: "⚡",
      color: "bg-green-50 text-green-600",
      link: "electric",
    },
    {
      title: "Minibus / Van",
      description: "Perfect for large groups",
      icon: "🚐",
      color: "bg-indigo-50 text-indigo-600",
      link: "minibus",
    },
  ];

  return (
    <section className="car-categories" id="browse-categories">
      <div className="car-categories__inner">
        <div className="car-categories__header">
          <div>
            <h2 className="car-categories__title">Browse by Category</h2>
            <p className="car-categories__subtitle">Find the perfect rental for your needs</p>
          </div>
          <Link href="/cars" className="car-categories__view-all">
            View all categories →
          </Link>
        </div>

        <div className="car-categories__grid">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={`/cars?${cat.link}`}
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
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
