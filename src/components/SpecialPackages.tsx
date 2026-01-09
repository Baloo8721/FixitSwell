import { useState, useEffect } from "react";
import { Star, Heart, Wrench, Sun, Home, Users, Camera, Calendar, Smartphone, ShieldCheck, Gift, MapPin, Clock, Zap, Plus, Minus, Send, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitQuoteRequest } from "@/lib/supabase";
import lakeshoreMap from "@/assets/lakeshore villas.png";

// All Bundled Packages (9 total)
const allPackages = [
  {
    icon: Wrench,
    name: "Basic Home Tune-Up",
    price: "$150–$250",
    duration: "2 hours",
    features: [
      "Light bulb replacement",
      "Battery changes (smoke detectors)",
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
    price: "$200–$600",
    duration: "Full day",
    features: [
      "Discounted for 3–5 neighbors",
      "Same-day multi-home service",
      "Great for mobile home parks",
      "Coordinate & save!",
    ],
    popular: false,
  },
  {
    icon: ShieldCheck,
    name: "Senior Safety Overhaul",
    price: "$375",
    duration: "3 hours",
    features: [
      "Install 2 grab bars",
      "Full home hazard audit",
      "Night light setup",
      "Smoke alarm battery swap",
    ],
    popular: false,
  },
  {
    icon: Smartphone,
    name: "Tech Refresh Bundle",
    price: "$250",
    duration: "2 hours",
    features: [
      "Video doorbell install",
      "Smart lock install",
      "30-min device training",
    ],
    popular: false,
  },
  {
    icon: Zap,
    name: "Curb Appeal Bundle",
    price: "$350",
    duration: "3.5 hours",
    features: [
      "Pressure wash driveway/patio",
      "Clean exterior windows",
      "Refresh house numbers/mailbox",
    ],
    popular: false,
  },
  {
    icon: Sun,
    name: "Storm Season Ready",
    price: "$450",
    duration: "4 hours",
    features: [
      "Gutter clean",
      "Tie-down inspection & tighten",
      "Window/shutter check",
      "Yard debris removal",
    ],
    popular: false,
  },
];

// Services available for custom monthly plan
const customPlanServices = [
  { name: "Light Bulb Replacement (High/Hard)", price: 75, time: 30 },
  { name: "Smoke Detector Battery Swap", price: 95, time: 45 },
  { name: "Filter Service (HVAC/Water/Fridge)", price: 85, time: 30 },
  { name: "Small Picture / Art Hanging", price: 45, time: 15 },
  { name: "Cabinet Hinge Repair / Adjust", price: 45, time: 30 },
  { name: "Furniture Repair (Glue/Sand/Tighten)", price: 85, time: 60 },
  { name: "Blind / Curtain Rod Install", price: 75, time: 30 },
  { name: "Door Lock / Deadbolt Swap", price: 85, time: 30 },
  { name: "Outlet or Switch Replacement", price: 55, time: 15 },
  { name: "Shower Head Replacement", price: 75, time: 30 },
  { name: "Caulking Touch-up", price: 80, time: 45 },
  { name: "Phone / Tablet / Device Help", price: 85, time: 45 },
  { name: "Tech Troubleshooting (30 min)", price: 50, time: 30 },
  { name: "Non-Slip Mats / Night Light Setup", price: 95, time: 60 },
  { name: "Fire Extinguisher Mount & Check", price: 65, time: 30 },
  { name: "HVAC Drip Line Flush", price: 120, time: 60 },
];

// Monthly Subscription Plans
const monthlyPlans = [
  {
    icon: ShieldCheck,
    name: "Safety First",
    price: "$125/month",
    duration: "1.5 hrs/visit",
    features: [
      "Smoke detector check",
      "Light bulb changes",
      "Air filter swap",
      "Hazard audit",
      "Fire extinguisher check",
    ],
    popular: false,
    bestFor: "Seniors living alone",
    isCustom: false,
  },
  {
    icon: Smartphone,
    name: "Tech & Comfort",
    price: "$145/month",
    duration: "1.5 hrs/visit",
    features: [
      "Wi-Fi check & updates",
      "Smart home maintenance",
      "AC drip line flush",
      "Appliance filter clean",
      "Remote control help",
    ],
    popular: true,
    bestFor: "Tech-frustrated residents",
    isCustom: false,
  },
  {
    icon: Wrench,
    name: "Custom Monthly Plan",
    price: "You Build It!",
    duration: "Based on services",
    features: [
      "Pick your own services",
      "Same tasks each month",
      "Add or adjust anytime",
      "We quote your custom plan",
    ],
    popular: false,
    bestFor: "Your unique needs",
    isCustom: true,
  },
];

const SpecialPackages = () => {
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  // Listen for event to open custom plan builder from other components
  useEffect(() => {
    const handleOpenBuilder = () => setShowCustomBuilder(true);
    window.addEventListener('openCustomPlanBuilder', handleOpenBuilder);
    return () => window.removeEventListener('openCustomPlanBuilder', handleOpenBuilder);
  }, []);
  const [quoteName, setQuoteName] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteEmail, setQuoteEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleService = (serviceName: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceName) 
        ? prev.filter(s => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const selectedTotal = customPlanServices
    .filter(s => selectedServices.includes(s.name))
    .reduce((sum, s) => sum + s.price, 0);

  const selectedTime = customPlanServices
    .filter(s => selectedServices.includes(s.name))
    .reduce((sum, s) => sum + s.time, 0);

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
  };

  const handleRequestQuote = async () => {
    if (!quoteName.trim() || selectedServices.length === 0) return;
    
    setIsSubmitting(true);
    const { error } = await submitQuoteRequest({
      name: quoteName.trim(),
      email: quoteEmail.trim() || undefined,
      phone: quotePhone.trim() || undefined,
      services: selectedServices,
      estimatedTotal: selectedTotal,
      estimatedTime: formatTime(selectedTime)
    });

    setIsSubmitting(false);
    
    if (!error) {
      setSubmitted(true);
      setTimeout(() => {
        setShowCustomBuilder(false);
        setSubmitted(false);
        setSelectedServices([]);
        setQuoteName('');
        setQuotePhone('');
        setQuoteEmail('');
      }, 2000);
    }
  };

  return (
    <section id="packages" className="py-section px-4">
      {/* One-Time Packages - All 9 in unified section */}
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

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {allPackages.map((pkg, index) => (
              <Card 
                key={index}
                className={`relative border-2 transition-shadow hover:shadow-lg ${
                  pkg.popular 
                    ? 'border-accent shadow-md' 
                    : 'border-border'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-3 sm:left-6 bg-accent text-accent-foreground px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                    Popular
                  </span>
                )}
                <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      pkg.popular ? 'bg-accent/10' : 'bg-secondary'
                    }`}>
                      <pkg.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        pkg.popular ? 'text-accent' : 'text-primary'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="font-heading text-sm sm:text-base leading-tight">
                        {pkg.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {pkg.duration}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="mb-2 sm:mb-3">
                    <span className="font-heading text-lg sm:text-xl text-primary">
                      {pkg.price}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {pkg.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex}
                        className="flex items-start gap-1.5 text-muted-foreground text-xs sm:text-sm"
                      >
                        <span className="text-primary mt-0.5 text-xs">✓</span>
                        <span className="leading-tight">{feature}</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {monthlyPlans.map((plan, index) => (
              <Card 
                key={index}
                className={`relative border-2 transition-shadow hover:shadow-lg bg-card ${
                  plan.popular 
                    ? 'border-primary shadow-md' 
                    : plan.isCustom
                    ? 'border-accent/50 border-dashed'
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
                      plan.popular ? 'bg-primary/10' : plan.isCustom ? 'bg-accent/10' : 'bg-secondary'
                    }`}>
                      <plan.icon className={`w-6 h-6 ${
                        plan.isCustom ? 'text-accent' : 'text-primary'
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
                    <span className={`font-heading text-2xl ${plan.isCustom ? 'text-accent' : 'text-primary'}`}>
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
                        <span className={plan.isCustom ? 'text-accent' : 'text-primary'}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {plan.isCustom && (
                    <Button 
                      onClick={() => setShowCustomBuilder(true)}
                      className="w-full mt-4 bg-accent hover:bg-accent/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Build Your Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </div>

      {/* Custom Plan Builder Modal */}
      <Dialog open={showCustomBuilder} onOpenChange={setShowCustomBuilder}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <Wrench className="w-5 h-5 text-accent" />
              Build Your Custom Plan
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Select services for your monthly visit
            </p>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0 pr-2">
            <div className="space-y-1.5">
              {customPlanServices.map((service, idx) => (
                <label 
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedServices.includes(service.name)
                      ? 'bg-accent/10 border-accent'
                      : 'bg-card border-border hover:bg-muted/50'
                  }`}
                >
                  <Checkbox 
                    checked={selectedServices.includes(service.name)}
                    onCheckedChange={() => toggleService(service.name)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-tight">{service.name}</p>
                  </div>
                  <span className="text-xs font-medium text-primary">${service.price}</span>
                </label>
              ))}
            </div>
          </ScrollArea>

          {/* Summary & Contact Info - Always visible at bottom */}
          <div className="border-t pt-3 space-y-2 flex-shrink-0 bg-background">
            {submitted ? (
              <div className="text-center py-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <p className="font-heading text-base text-foreground">Quote Request Sent!</p>
                <p className="text-xs text-muted-foreground">We'll get back to you soon.</p>
              </div>
            ) : (
              <>
                {/* Compact summary row */}
                <div className="flex items-center justify-between text-xs bg-muted/30 rounded-lg px-3 py-2">
                  <span>{selectedServices.length} services</span>
                  <span>{formatTime(selectedTime)}</span>
                  <span className="font-heading text-accent text-sm">${selectedTotal}/mo</span>
                </div>

                {/* Compact form */}
                <div className="grid grid-cols-3 gap-2">
                  <Input 
                    placeholder="Name *" 
                    value={quoteName}
                    onChange={(e) => setQuoteName(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input 
                    placeholder="Phone" 
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <Input 
                    placeholder="Email" 
                    type="email"
                    value={quoteEmail}
                    onChange={(e) => setQuoteEmail(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9"
                    onClick={() => setSelectedServices([])}
                    disabled={selectedServices.length === 0 || isSubmitting}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Button 
                    className="flex-1 h-9 bg-accent hover:bg-accent/90"
                    onClick={handleRequestQuote}
                    disabled={selectedServices.length === 0 || !quoteName.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {isSubmitting ? 'Sending...' : 'Request Quote'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
