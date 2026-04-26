import { Phone, MessageCircle, Heart, MapPin, DollarSign, ShieldCheck, Mail, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative bg-secondary py-section-lg px-4 overflow-hidden">
      {/* Subtle decorative element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container max-w-4xl mx-auto text-center relative z-10">
        <h1 className="font-heading text-heading-lg md:text-heading-xl text-foreground mb-6 text-balance">
          Reliable Help for Every Home & Property
        </h1>

        <div className="text-body-lg text-muted-foreground mb-4 max-w-2xl mx-auto text-center">
          <p className="font-semibold text-foreground mb-3">Your Neighborhood Handyman —</p>
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center bg-card text-foreground px-4 py-2 rounded-full text-base font-medium shadow-sm border border-border">
              Furniture Assembly
            </div>
            <div className="inline-flex items-center justify-center bg-card text-foreground px-4 py-2 rounded-full text-base font-medium shadow-sm border border-border">
              Home Maintenance & To-Do Lists
            </div>
            <div className="inline-flex items-center justify-center bg-card text-foreground px-4 py-2 rounded-full text-base font-medium shadow-sm border border-border">
              Repairs & Upgrades
            </div>
            <div className="inline-flex items-center justify-center bg-card text-foreground px-4 py-2 rounded-full text-base font-medium shadow-sm border border-border">
              Rental Property Turnovers
            </div>
            <div className="inline-flex items-center justify-center bg-card text-foreground px-4 py-2 rounded-full text-base font-medium shadow-sm border border-border">
              Projects Big or Small
            </div>
          </div>
          <p className="mt-4 font-semibold text-foreground">Done Right, Done Kindly — Because Your Home Matters.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["Residential", "Mobile Homes", "Senior Living", "Rental Properties"].map((type, index) => (
            <span key={index} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              {type}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <a
            href="#booking"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-base font-medium hover:bg-primary/90 transition-colors shadow-lg"
          >
            <CalendarDays className="w-5 h-5" />
            Book Now
          </a>
          <a
            href="tel:+18137381655"
            className="inline-flex items-center gap-2 bg-card text-foreground px-5 py-3 rounded-full text-base font-medium hover:bg-card/80 transition-colors shadow-md border border-border"
          >
            <Phone className="w-5 h-5 text-primary" />
            Call
          </a>
          <a
            href="sms:+18137381655"
            className="inline-flex items-center gap-2 bg-card text-foreground px-5 py-3 rounded-full text-base font-medium hover:bg-card/80 transition-colors shadow-md border border-border"
          >
            <MessageCircle className="w-5 h-5 text-primary" />
            Text
          </a>
          <a
            href="#message-form"
            className="inline-flex items-center gap-2 bg-card text-foreground px-5 py-3 rounded-full text-base font-medium hover:bg-card/80 transition-colors shadow-md border border-border"
          >
            <Mail className="w-5 h-5 text-primary" />
            Message
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>Local Service</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Senior-Friendly</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span>Clear Pricing</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-medic" />
            <span>No Pushy Sales</span>
          </div>
        </div>

        {/* Wellness & Safety combined badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-4 bg-primary/10 text-primary px-5 py-2 rounded-full font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm">Wellness & Safety Checks</span>
            </div>
            <span className="text-primary/30">•</span>
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Tailored Maintenance</span>
            </div>
          </div>
        </div>

        {/* Paramedic trust badge */}
        <div className="mt-6 inline-flex items-center bg-medic/10 text-medic px-4 py-2 rounded-lg font-medium">
          <span>Run & Operated by a Former Paramedic & Professional Maintenance Team — Your Safety Is Our Priority</span>
        </div>
      </div>
    </section >
  );
};

export default HeroSection;
