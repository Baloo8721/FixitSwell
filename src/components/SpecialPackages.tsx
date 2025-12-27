import { Star, Heart, Wrench, Sun, Home, Users, Camera, Calendar, Smartphone, ShoppingBag, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <>
      {/* One-Time Packages Section */}
      <section id="packages" className="py-section px-4 bg-background">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-accent font-semibold text-lg mb-2">
              <Star className="w-6 h-6" />
              Value Packages
            </span>
            <h2 className="font-heading text-heading-md text-foreground">
              One-Time Bundled Specials
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-lg">
              Save time and money with our bundled services. Clear pricing, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <span className="absolute -top-3 left-6 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-base font-medium">
                    Most Popular
                  </span>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                        pkg.popular ? 'bg-accent/10' : 'bg-secondary'
                      }`}>
                        <pkg.icon className={`w-7 h-7 ${
                          pkg.popular ? 'text-accent' : 'text-primary'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="font-heading text-xl">
                          {pkg.name}
                        </CardTitle>
                        <p className="text-base text-muted-foreground">
                          {pkg.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="font-heading text-3xl text-primary">
                      {pkg.price}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex}
                        className="flex items-center gap-3 text-muted-foreground text-base"
                      >
                        <span className="text-primary text-lg">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Monthly Plans Section - Different Background for Separation */}
      <section className="py-section px-4 bg-primary/5 border-y-4 border-primary/20">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-primary font-semibold text-lg mb-2">
              <Calendar className="w-6 h-6" />
              Monthly Plans
            </span>
            <h2 className="font-heading text-heading-md text-foreground">
              Ongoing Support & Peace of Mind
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-lg">
              One visit per month. Priority scheduling. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
                  <span className="absolute -top-3 left-6 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-base font-medium">
                    Recommended
                  </span>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                      plan.popular ? 'bg-primary/10' : 'bg-secondary'
                    }`}>
                      <plan.icon className={`w-7 h-7 ${
                        plan.popular ? 'text-primary' : 'text-primary'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="font-heading text-xl">
                        {plan.name}
                      </CardTitle>
                      <p className="text-base text-muted-foreground">
                        {plan.duration}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <span className="font-heading text-3xl text-primary">
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-sm text-accent font-semibold mb-4">
                    Best for: {plan.bestFor}
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex}
                        className="flex items-center gap-3 text-muted-foreground text-base"
                      >
                        <span className="text-primary text-lg">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add-ons note */}
          <div className="mt-12 text-center bg-card border-2 border-border rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="font-heading text-xl text-foreground mb-4">Add-Ons Available</h3>
            <ul className="text-muted-foreground space-y-2 text-base">
              <li>Extra hour: $50–$100</li>
              <li>Emergency/same-day visit: +$50–$100</li>
              <li>Batteries & parts supplied at cost + small markup</li>
              <li>Senior & military discount: 10% off</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Referral Rewards Section */}
      <section className="py-section px-4 bg-accent/10 border-y-4 border-accent/30">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-6">
            <Gift className="w-10 h-10 text-accent" />
          </div>
          <h2 className="font-heading text-heading-md text-foreground mb-4">
            Refer a Friend & Get Rewarded!
          </h2>
          <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto">
            Know a neighbor, friend, or family member who could use our help? 
            Refer them to us and you'll both benefit!
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
            <Card className="border-2 border-accent/40 bg-card">
              <CardContent className="p-6 text-center">
                <p className="font-heading text-3xl text-accent mb-2">$25 OFF</p>
                <p className="text-muted-foreground text-lg">Your next service</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-accent/40 bg-card">
              <CardContent className="p-6 text-center">
                <p className="font-heading text-3xl text-accent mb-2">$25 OFF</p>
                <p className="text-muted-foreground text-lg">Their first service</p>
              </CardContent>
            </Card>
          </div>
          <p className="text-muted-foreground mt-8 text-lg">
            Just have your friend mention your name when they call or text!
          </p>
        </div>
      </section>
    </>
  );
};

export default SpecialPackages;
