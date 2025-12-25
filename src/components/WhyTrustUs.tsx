import { Heart, Clock, MessageCircle, DollarSign, ShieldCheck, BadgeCheck, Wrench } from "lucide-react";

const trustPoints = [
  {
    icon: Heart,
    text: "Former paramedic — trained to care for people",
    highlight: true,
  },
  {
    icon: Wrench,
    text: "Decades of hands-on maintenance experience",
    highlight: true,
  },
  {
    icon: Clock,
    text: "Patient & never rushing",
    highlight: false,
  },
  {
    icon: MessageCircle,
    text: "No confusing tech talk — plain English only",
    highlight: false,
  },
  {
    icon: DollarSign,
    text: "Clear pricing — no surprise charges",
    highlight: false,
  },
  {
    icon: ShieldCheck,
    text: "Your safety is always my priority",
    highlight: false,
  },
  {
    icon: BadgeCheck,
    text: "No upselling — just honest help",
    highlight: false,
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
              className={`flex items-center gap-4 p-5 rounded-xl transition-colors ${
                point.highlight 
                  ? 'bg-medic/10 border border-medic/20' 
                  : 'bg-card border border-border'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                point.highlight 
                  ? 'bg-medic text-medic-foreground' 
                  : 'bg-secondary text-primary'
              }`}>
                <point.icon className="w-5 h-5" />
              </div>
              <span className={`text-lg ${
                point.highlight ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
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
