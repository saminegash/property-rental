import React from "react";

export function PropertyHowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Find your property",
      description: "Browse our marketplace and find the perfect apartment, house, or commercial space.",
    },
    {
      number: "2",
      title: "Send a request",
      description: "Submit a viewing or rental request. We do not process any payments at this stage.",
    },
    {
      number: "3",
      title: "Admin confirms with owner",
      description: "Our admin team securely contacts the property owner and confirms availability for you.",
    },
    {
      number: "4",
      title: "Close the deal",
      description: "Visit the property, sign the lease or sale agreement, and finalize the transaction securely.",
    },
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works__inner">
        <div className="how-it-works__header">
          <h2 className="how-it-works__title">How It Works</h2>
          <p className="how-it-works__subtitle">Renting or buying a property on MyProperties is safe, simple, and transparent.</p>
        </div>

        <div className="how-it-works__grid">
          {steps.map((step, idx) => (
            <div key={idx} className="how-it-works-step">
              <div className="how-it-works-step__number" aria-hidden="true">
                {step.number}
              </div>
              <h3 className="how-it-works-step__title">{step.title}</h3>
              <p className="how-it-works-step__desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
