import React from "react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Choose a property",
      description: "Browse our marketplace and find the perfect home with transparent pricing and verified owners.",
    },
    {
      number: "2",
      title: "Send a request",
      description: "Submit a request for your selected dates. We do not process any payments at this stage.",
    },
    {
      number: "3",
      title: "Admin confirms with owner",
      description: "Our admin team securely contacts the owner and confirms the listing's availability for you.",
    },
    {
      number: "4",
      title: "Move in or collect",
      description: "Sign the agreement, complete the payment, and move in or collect your property.",
    },
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works__inner">
        <div className="how-it-works__header">
          <h2 className="how-it-works__title">How It Works</h2>
          <p className="how-it-works__subtitle">Finding your next home on MyEthioProperties is safe, simple, and transparent.</p>
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
