import { Star, Heart, Wrench, Wifi, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const packages = [
  {
    icon: Heart,
    name: "Senior Assist Package",
    price: "$100",
    description: "1 Hour of Helping Hands",
    features: [
      "Battery replacements throughout home",
      "Medication cabinet organizing",
      "Light lifting & moving items",
      "Basic tech help",
    ],
    popular: true,
  },
  {
    icon: Wrench,
    name: "Basic Home Tune-Up",
    price: "$150",
    description: "Keep Your Home Running Smooth",
    features: [
      "Light bulb replacement (all rooms)",
      "Air filter changes",
      "Door & cabinet adjustments",
      "Safety device checks",
    ],
    popular: false,
  },
  {
    icon: Wifi,
    name: "WiFi & Tech Boost",
    price: "$150–$250",
    description: "Get Connected & Stay Connected",
    features: [
      "Internet speed optimization",
      "TV streaming setup",
      "Phone & tablet help",
      "Smart device installation",
    ],
    popular: false,
  },
  {
    icon: Shield,
    name: "Security Starter Bundle",
    price: "$200–$300",
    description: "Peace of Mind for Your Home",
    features: [
      "Wireless camera setup",
      "Motion sensor lights",
      "Video doorbell installation",
      "Basic monitoring walkthrough",
    ],
    popular: false,
  },
];

const SpecialPackages = () => {
  return (
    <section className="py-section px-4 bg-background">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-accent font-semibold mb-2">
            <Star className="w-5 h-5" />
            Popular Senior Specials
          </span>
          <h2 className="font-heading text-heading-md text-foreground">
            Value Packages
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Save time and money with our bundled services designed just for seniors.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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
                      <CardTitle className="font-heading text-xl">
                        {pkg.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {pkg.description}
                      </p>
                    </div>
                  </div>
                  <span className="font-heading text-2xl text-primary">
                    {pkg.price}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {pkg.features.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex}
                      className="flex items-center gap-2 text-muted-foreground"
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
