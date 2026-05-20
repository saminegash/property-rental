import React from "react";

export function PricingTransparencySection() {
  const pricingItems = [
    {
      title: "Car Rental Price",
      description: "The base daily rate for renting the vehicle. Set entirely by the car owner.",
      icon: "🚗",
      color: "bg-blue-50 text-blue-600",
      highlight: false,
    },
    {
      title: "Driver Fee",
      description: "Optional daily fee if you choose to rent a vehicle with a professional driver.",
      icon: "👨‍✈️",
      color: "bg-orange-50 text-orange-600",
      highlight: false,
    },
    {
      title: "Security Deposit",
      description: "A fully refundable deposit held to cover potential damages. Returned after your trip.",
      icon: "🛡️",
      color: "bg-emerald-50 text-emerald-600",
      highlight: false,
    },
    {
      title: "Delivery Fee",
      description: "Optional fee set by the owner if you want the car delivered directly to your location.",
      icon: "📍",
      color: "bg-purple-50 text-purple-600",
      highlight: false,
    },
    {
      title: "Platform Commission",
      description: "We charge a fixed 5% commission only on the base rental price. Excludes all other fees.",
      icon: "💎",
      color: "bg-primary text-white",
      highlight: true,
    },
  ];

  return (
    <section className="pricing-transparency" id="pricing-transparency">
      <div className="pricing-transparency__inner">
        <div className="pricing-transparency__header">
          <h2 className="pricing-transparency__title">Transparent Pricing</h2>
          <p className="pricing-transparency__subtitle">
            No hidden fees. Understand exactly what makes up your total rental cost.
          </p>
        </div>

        <div className="pricing-transparency__grid">
          {pricingItems.map((item, idx) => (
            <div 
              key={idx} 
              className={`pricing-card ${item.highlight ? 'pricing-card--highlight' : ''}`}
            >
              <div className={`pricing-card__icon ${item.color}`} aria-hidden="true">
                {item.icon}
              </div>
              <h3 className="pricing-card__title">{item.title}</h3>
              <p className="pricing-card__desc">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
