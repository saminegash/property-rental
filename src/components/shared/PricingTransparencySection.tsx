import React from "react";

export function PricingTransparencySection() {
  const pricingItems = [
    {
      title: "Listing Price",
      description: "The base price for renting or purchasing the property. Set entirely by the owner.",
      icon: "🏠",
      color: "bg-blue-50 text-blue-600",
      highlight: false,
    },
    {
      title: "Admin Coordination",
      description: "Our admin team reviews every request and coordinates between you and the owner at no extra cost.",
      icon: "🤝",
      color: "bg-orange-50 text-orange-600",
      highlight: false,
    },
    {
      title: "Security Deposit",
      description: "A fully refundable deposit held to cover potential damages. Returned after your lease or rental ends.",
      icon: "🛡️",
      color: "bg-emerald-50 text-emerald-600",
      highlight: false,
    },
    {
      title: "Viewing & Delivery",
      description: "Optional fee set by the owner if you want a viewing arranged or keys delivered to your location.",
      icon: "📍",
      color: "bg-purple-50 text-purple-600",
      highlight: false,
    },
    {
      title: "Platform Commission",
      description: "A small fixed commission on the base listing price only. All other fees are fully excluded.",
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
            No hidden fees. Understand exactly what makes up your total cost.
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
