import { Star, Heart, Wrench, Sun, Home, Users, Camera, Calendar, Smartphone, ShoppingBag, Gift, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import lakeshoreMap from "@/assets/lakeshore villas.png";

// One-Time Bundled Packages
const oneTimePackages = [
  {
    icon: Wrench,
    name: "Basic Home Tune-Up",
    price: "$150–$250",
    duration: "2 hours",
    features: [
      "Light bulb replacement",
      "Battery changes (smoke detectors, remotes)",
      "Filter replacements (AC/water)",
      "Door tweaks & adjustments",
    ],
    popular: true,
  },
  {
    icon: Sun,
    name: "Seasonal Prep Bundle",
    price: "$200–$350",
    duration: "3 hours",
    features: [
      "Gutter cleaning",
      "Seals & caulking check",
      "Skirting wash",
      "Storm or hurricane prep",
    ],
    popular: false,
  },
  {
    icon: Home,
    name: "Move-In/Move-Out Assist",
    price: "$200–$600",
    duration: "Half day",
    features: [
      "Furniture setup & assembly",
      "Light cleanup",
      "Minor fixes & touch-ups",
      "Organizing help",
    ],
    popular: false,
  },
  {
    icon: Camera,
    name: "Mobile Home Staging",
    price: "$150–$400",
    duration: "2–4 hours",
    features: [
      "Cosmetic touch-ups",
      "Organizing & decluttering",
      "Quick home photos",
      "Get your home sale-ready",
    ],
    popular: false,
  },
  {
    icon: Users,
    name: "Group Neighbor Day",
    price: "$200–$600/day",
    duration: "Full day",
    features: [
      "Discounted rates for 3–5 neighbors",
      "Same-day service for multiple homes",
      "Great for mobile home parks",
      "Coordinate with your neighbors & save!",
    ],
    popular: false,
  },
];

// Monthly Subscription Plans
const monthlyPlans = [
  {
    icon: Heart,
    name: "Home Check & Peace-of-Mind",
    price: "$99–$149/month",
    duration: "1–1.5 hrs/visit",
    features: [
      "Monthly safety walkthrough",
      "Check for leaks, doors, detectors",
      "Small adjustments included",
      "Peace of mind for you & family",
    ],
    popular: false,
    bestFor: "Seniors living alone",
  },
  {
    icon: Smartphone,
    name: "Tech + Home Support",
    price: "$119–$169/month",
    duration: "1–2 hrs/visit",
    features: [
      "Tech help (TV, phone, Wi-Fi)",
      "Scam awareness tips",
      "Minor home fixes included",
      "Patient, friendly teaching",
    ],
    popular: true,
    bestFor: "Tech-frustrated residents",
  },
  {
    icon: ShoppingBag,
    name: "Trusted Helper Plan",
    price: "$139–$199/month",
    duration: "1–2 hrs/visit",
    features: [
      "Errands & store runs",
      "Mail sorting & admin help",
      "Organizing assistance",
      "Wait for deliveries/contractors",
    ],
    popular: false,
    bestFor: "Busy or mobility-limited",
  },
];

const SpecialPackages = () => {
  return (
    <section id="packages" className="py-section px-4">
      {/* One-Time Packages - Light background */}
      <div className="bg-background py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-accent font-semibold mb-2">
              <Star className="w-5 h-5" />
              Value Packages
            </span>
            <h2 className="font-heading text-heading-md text-foreground">
              One-Time Bundled Specials
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Save time and money with our bundled services. Clear pricing, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {oneTimePackages.map((pkg, index) => (
              <Card 
                key={index}
                className={`relative border-2 transition-shadow hover:shadow-lg ${
                  pkg.popular 
                    ? 'border-accent shadow-md' 
                    : 'border-border'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-6 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        pkg.popular ? 'bg-accent/10' : 'bg-secondary'
                      }`}>
                        <pkg.icon className={`w-6 h-6 ${
                          pkg.popular ? 'text-accent' : 'text-primary'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="font-heading text-lg">
                          {pkg.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {pkg.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="font-heading text-2xl text-primary">
                      {pkg.price}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex}
                        className="flex items-center gap-2 text-muted-foreground text-sm"
                      >
                        <span className="text-primary">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Plans - Distinct secondary background with border */}
      <div className="bg-secondary/40 border-y-2 border-primary/20 py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-primary font-semibold mb-2">
              <Calendar className="w-5 h-5" />
              Monthly Plans
            </span>
            <h2 className="font-heading text-heading-md text-foreground">
              Ongoing Support & Peace of Mind
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              One visit per month. Priority scheduling. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {monthlyPlans.map((plan, index) => (
              <Card 
                key={index}
                className={`relative border-2 transition-shadow hover:shadow-lg bg-card ${
                  plan.popular 
                    ? 'border-primary shadow-md' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Recommended
                  </span>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      plan.popular ? 'bg-primary/10' : 'bg-secondary'
                    }`}>
                      <plan.icon className={`w-6 h-6 ${
                        plan.popular ? 'text-primary' : 'text-primary'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="font-heading text-lg">
                        {plan.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {plan.duration}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <span className="font-heading text-2xl text-primary">
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-xs text-accent font-medium mb-4">
                    Best for: {plan.bestFor}
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex}
                        className="flex items-center gap-2 text-muted-foreground text-sm"
                      >
                        <span className="text-primary">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </div>

      {/* Service Area - Compact */}
      <div className="bg-background py-12">
        <div className="container max-w-md mx-auto px-4">
          <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
            {/* Header */}
            <div className="px-3 py-2 border-b border-border bg-primary/5">
              <h3 className="font-heading text-base text-center text-foreground flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Our Service Area
              </h3>
            </div>

            {/* Map Image - fills container edge to edge */}
            <div className="relative">
              <img
                src={lakeshoreMap}
                alt="Lakeshore Villas Community Map"
                className="w-full h-auto block"
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <div className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-2 py-1 rounded-full text-[10px] font-medium shadow-lg">
                  <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                  Exclusive Service Area
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 space-y-2">
              <div className="text-center">
                <h4 className="font-heading text-base text-foreground">Lakeshore Villas</h4>
                <p className="text-xs text-muted-foreground">Mobile home community in Tampa, FL</p>
              </div>
              <div className="flex items-center justify-center gap-1 text-sm">
                <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-foreground font-bold">Mon–Fri: 8:30 AM – 2:30 PM</span>
                <span className="text-muted-foreground">| Weekends: Contact us</span>
              </div>
              <p className="text-sm text-primary font-semibold text-center pt-2 border-t border-border">
                Local neighbors helping neighbors — no travel fees
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Rewards Section */}
      <div className="bg-accent/10 py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 text-accent font-semibold mb-3">
              <Gift className="w-5 h-5" />
              Referrals
            </span>
            <h2 className="font-heading text-heading-md text-foreground mb-4">
              Refer a Friend & Get Rewarded!
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Know a neighbor, friend, or family member in the community who could use a hand? Refer them to us and you'll both benefit.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
              <div className="bg-card border-2 border-accent rounded-xl p-6 text-center min-w-[180px]">
                <span className="font-heading text-3xl text-accent">$25 OFF</span>
                <p className="text-muted-foreground text-sm mt-1">Your next service</p>
              </div>
              <div className="bg-card border-2 border-primary rounded-xl p-6 text-center min-w-[180px]">
                <span className="font-heading text-3xl text-primary">$25 OFF</span>
                <p className="text-muted-foreground text-sm mt-1">Their first service</p>
              </div>
            </div>
            
            <p className="text-foreground font-medium">
              Just have your friend mention your name when they call or text!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialPackages;
