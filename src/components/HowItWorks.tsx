import { Phone, Clock, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Phone,
    title: "Call or Text",
    description: "Tell us what you need help with — no question is too small.",
  },
  {
    icon: Clock,
    title: "We Arrive On Time",
    description: "Friendly, respectful service at your convenience.",
  },
  {
    icon: CheckCircle,
    title: "Job Done Safely",
    description: "No mess, no stress — just quality work you can trust.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-section px-4 bg-background">
      <div className="container max-w-5xl mx-auto">
        <h2 className="font-heading text-heading-md text-center text-foreground mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-6"
            >
              {/* Step number with icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
                  <step.icon className="w-9 h-9 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </span>
              </div>

              <h3 className="font-heading text-heading-sm text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-body">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
