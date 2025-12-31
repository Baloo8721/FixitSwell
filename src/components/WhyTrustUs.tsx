import { Heart, Clock, MessageCircle, DollarSign, ShieldCheck, BadgeCheck, Wrench } from "lucide-react";

const trustPoints = [
  {
    icon: Heart,
    text: "Former paramedic with years of real-world problem-solving experience",
  },
  {
    icon: Wrench,
    text: "Years of hands-on experience helping with everyday home tasks, repairs, and tech support",
  },
  {
    icon: Clock,
    text: "Patient and never rushing",
  },
  {
    icon: MessageCircle,
    text: "No confusing tech talk — clear, simple explanations",
  },
  {
    icon: DollarSign,
    text: "Clear pricing — no surprise charges",
  },
  {
    icon: ShieldCheck,
    text: "Your safety is always the priority",
  },
  {
    icon: BadgeCheck,
    text: "No upselling — just honest help",
  },
];

const WhyTrustUs = () => {
  return (
    <section className="py-section px-4 bg-primary/5">
      <div className="container max-w-4xl mx-auto">
        <h2 className="font-heading text-heading-md text-center text-foreground mb-4">
          Why Seniors Trust Us
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          With a background in emergency medicine, I understand what it means to truly help people.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {trustPoints.map((point, index) => (
            <div 
              key={index}
              className="group flex items-center gap-4 p-5 rounded-xl border bg-card border-border 
                         hover:bg-medic/10 hover:border-medic/20 hover:scale-[1.02] 
                         transition-all duration-300 ease-out cursor-default"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
                              bg-secondary text-primary 
                              group-hover:bg-medic group-hover:text-medic-foreground 
                              transition-all duration-300 ease-out">
                <point.icon className="w-5 h-5" />
              </div>
              <span className="text-lg text-muted-foreground group-hover:text-foreground transition-colors duration-300 ease-out">
                {point.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyTrustUs;
