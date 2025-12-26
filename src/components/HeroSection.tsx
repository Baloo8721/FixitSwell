import { Phone, MessageCircle, Heart, MapPin, DollarSign, ShieldCheck } from "lucide-react";
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
          Helping seniors with small home jobs, tech help, and everyday fixes — 
          done right, done kindly, by someone who truly cares.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Button 
            asChild
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 rounded-xl shadow-lg"
          >
            <a href="tel:+1234567890">
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </a>
          </Button>
          <Button 
            asChild
            size="lg" 
            variant="outline"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-6 rounded-xl"
          >
            <a href="sms:+1234567890">
              <MessageCircle className="w-5 h-5 mr-2" />
              Text for Help
            </a>
          </Button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>Local Florida Service</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Senior-Focused</span>
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

        {/* Paramedic trust badge */}
        <div className="inline-flex items-center gap-2 bg-medic/10 text-medic px-4 py-2 rounded-full font-medium">
          <Heart className="w-5 h-5" />
          <span>Ran & Operated by Former Paramedic — Your Safety Is My Priority</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
