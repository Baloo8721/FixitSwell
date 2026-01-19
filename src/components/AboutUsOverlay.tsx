import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Heart, Shield, Users, Wrench, CalendarDays, Phone, MessageSquare, Mail } from "lucide-react";
import { useState } from "react";
import logo1 from "@/assets/FIXITSWELLLOGO.png";
import logo2 from "@/assets/Fixitswelllogo2.png";

interface AboutUsOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AboutUsOverlay = ({ open, onOpenChange }: AboutUsOverlayProps) => {
  const [showAltLogo, setShowAltLogo] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="font-heading text-heading-md text-foreground">
            About FixitSwell
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            Your trusted neighbors, here to help
          </DialogDescription>
        </DialogHeader>

        {/* Logo/Image Section - click to toggle between versions */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowAltLogo(!showAltLogo)}
            className="cursor-pointer bg-transparent border-none p-0"
            title="Click to switch logo style"
          >
            <img 
              src={showAltLogo ? logo2 : logo1} 
              alt="FixitSwell" 
              className="w-full max-w-xl h-auto object-contain rounded-xl transition-all duration-300"
            />
          </button>
        </div>

        {/* Bio Content */}
        <div className="space-y-6 text-center px-4">
          <div className="bg-secondary/50 rounded-xl p-6 border border-border">
            <h3 className="font-heading text-xl text-foreground mb-4">
              Meet Your Home Helpers
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              We're a <span className="text-primary font-semibold">family-owned business</span> with 
              deep roots in this community. Owned and operated by 
              <span className="text-primary font-semibold"> a former medic and handyman</span>, alongside 
              <span className="text-primary font-semibold"> his brother-in-law — a multi-tradesman 
              with over 30 years of hands-on experience</span>.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're local. Our family lives here — in fact, 
              <span className="text-primary font-semibold"> we have multiple family 
              members who live in this community</span>. This isn't just a business — 
              it's our way of giving back to the neighbors we care about.
            </p>
          </div>

          {/* Trust Points */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-medic/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-medic" />
              </div>
              <h4 className="font-heading text-base text-foreground mb-1">Trustworthy</h4>
              <p className="text-sm text-muted-foreground">Background in emergency services</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wrench className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-heading text-base text-foreground mb-1">Experienced</h4>
              <p className="text-sm text-muted-foreground">30+ years of hands-on work</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-heading text-base text-foreground mb-1">Local</h4>
              <p className="text-sm text-muted-foreground">Family ties to the community</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-trust/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-trust" />
              </div>
              <h4 className="font-heading text-base text-foreground mb-1">No Pressure</h4>
              <p className="text-sm text-muted-foreground">No pushy sales, ever</p>
            </div>
          </div>

          {/* Closing Statement */}
          <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
            <p className="text-xl text-foreground font-heading italic">
              "Just old-fashioned help for folks who need it."
            </p>
            <p className="text-muted-foreground mt-2">
              — The FixitSwell Family
            </p>
          </div>

          {/* Action links */}
          <div className="border-t border-border pt-4 mt-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a 
                href="#booking" 
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <CalendarDays className="w-4 h-4" />
                Book Now
              </a>
              <a 
                href="tel:+18137381655" 
                className="inline-flex items-center gap-1.5 bg-secondary text-foreground px-3 py-2 rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <Phone className="w-4 h-4 text-primary" />
                Call
              </a>
              <a 
                href="sms:+18137381655" 
                className="inline-flex items-center gap-1.5 bg-secondary text-foreground px-3 py-2 rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-primary" />
                Text
              </a>
              <a 
                href="#message-form" 
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center gap-1.5 bg-secondary text-foreground px-3 py-2 rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <Mail className="w-4 h-4 text-primary" />
                Message
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AboutUsOverlay;

