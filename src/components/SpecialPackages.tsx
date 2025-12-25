import { Star, Heart, Wrench, Sun, Home, Users, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const packages = [
  {
    icon: Heart,
    name: "Senior Assist Package",
    price: "$100",
    duration: "1 hour",
    features: [
      "Battery replacements throughout home",
      "Organizing help",
      "Light lifting & moving items",
      "Basic tech help",
    ],
    popular: true,
  },
  {
    icon: Wrench,
    name: "Basic Tune-Up",
    price: "$150",
    duration: "2 hours",
    features: [
      "Light bulb replacement",
      "Battery changes",
      "Filter replacements",
      "Door tweaks & adjustments",
    ],
    popular: false,
  },
  {
    icon: Sun,
    name: "Seasonal Prep",
    price: "$200",
    duration: "3 hours",
    features: [
      "Wash skirting",
      "Gutter cleaning",
      "Seals & caulking check",
      "Screen repairs",
    ],
    popular: false,
  },
  {
    icon: Home,
    name: "Quick Fix Bundle",
    price: "$250",
    duration: "4 hours",
    features: [
      "Skirting touch-ups",
      "Step & rail tweaks",
      "Mailbox fixes",
      "Decor hanging",
    ],
    popular: false,
  },
  {
    icon: Users,
    name: "Group Maintenance Day",
    price: "$200–$500",
    duration: "Full day",
    features: [
      "Discounted rates for 3-5 neighbors",
      "Same-day service",
      "Multiple homes, one visit",
      "Great for mobile home parks",
    ],
    popular: false,
  },
  {
    icon: Camera,
    name: "Mobile Home Staging",
    price: "$150–$300",
    duration: "Varies",
    features: [
      "Cosmetic touch-ups",
      "Organizing & decluttering",
      "Quick home photos",
      "Get your home sale-ready",
    ],
    popular: false,
  },
];

const SpecialPackages = () => {
  return (
    <section id="packages" className="py-section px-4 bg-background">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-accent font-semibold mb-2">
            <Star className="w-5 h-5" />
            Value Packages
          </span>
          <h2 className="font-heading text-heading-md text-foreground">
            Bundled Specials
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Save time and money with our bundled services designed just for seniors.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
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
    </section>
  );
};

export default SpecialPackages;
