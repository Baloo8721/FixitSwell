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
          Friendly Help for Everyday Home Tasks
        </h1>

        <p className="text-body-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Your friendly neighborhood handyman — helping with everyday <span className="font-semibold text-foreground">home tasks, tech help, and fixes big & small</span>,
          done right, done kindly, by someone who truly cares.
        </p>

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

        {/* Wellness & Safety badges row */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="inline-flex flex-col items-center bg-primary/10 text-primary px-4 py-2 rounded-full font-medium">
            <div className="flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2" />
              <span>Wellness & Safety Checks</span>
            </div>
            <span className="text-xs text-primary/70">Family updates for peace of mind</span>
          </div>
          <div className="inline-flex flex-col items-center bg-primary/10 text-primary px-4 py-2 rounded-full font-medium">
            <div className="flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              <span>Tailored Maintenance</span>
            </div>
            <span className="text-xs text-primary/70">Customized to your needs</span>
          </div>
        </div>

        {/* Paramedic trust badge */}
        <div className="mt-6 inline-flex items-center bg-medic/10 text-medic px-4 py-2 rounded-lg font-medium">
          <span>Run & Operated by a Former Paramedic & Professional Maintenance Team — Your Safety Is Our Priority</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
