import { Phone, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactForm from "./ContactForm";
import AboutUsOverlay from "./AboutUsOverlay";
import { useState } from "react";

const CallToAction = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <section id="contact" className="py-section-lg px-4 bg-primary">
      <div className="container max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-heading text-heading-md md:text-heading-lg text-primary-foreground mb-4">
            Need Help Today?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Give us a call, send a text, or fill out the form below. We're here to make your day easier.
          </p>
        </div>

        {/* Quick Contact Buttons - Always side by side */}
        <div className="flex flex-row gap-3 justify-center mb-8">
          <Button 
            asChild
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-6 py-6 rounded-xl shadow-lg"
          >
            <a href="tel:+18137381655">
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </a>
          </Button>
          <Button 
            asChild
            size="lg" 
            variant="outline"
            className="border-2 border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary text-lg px-6 py-6 rounded-xl"
          >
            <a href="sms:+18137381655">
              <MessageCircle className="w-5 h-5 mr-2" />
              Text
            </a>
          </Button>
        </div>

        {/* Email link */}
        <div className="text-center mb-8">
          <a 
            href="mailto:FixitSwell@gmail.com" 
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span className="underline">FixitSwell@gmail.com</span>
          </a>
        </div>

        {/* Divider - scroll target for message links */}
        <div id="message-form" className="flex items-center gap-4 max-w-md mx-auto mb-10 pt-4 scroll-mt-24">
          <div className="flex-1 h-px bg-primary-foreground/30" />
          <span className="text-primary-foreground font-semibold text-base bg-primary-foreground/10 px-4 py-2 rounded-full">
            ✉️ Or Send Us a Message
          </span>
          <div className="flex-1 h-px bg-primary-foreground/30" />
        </div>

        {/* Contact Form */}
        <div className="max-w-lg mx-auto">
          <ContactForm />
        </div>

        {/* Footer notes */}
        <div className="text-center mt-8">
          <p className="text-primary-foreground/70 text-sm mt-3">
            Locally owned, family-run business
          </p>
          <button 
            onClick={() => setIsAboutOpen(true)}
            className="text-primary-foreground underline text-sm mt-2 hover:text-primary-foreground/80 transition-colors"
          >
            About Us
          </button>
        </div>
      </div>

      <AboutUsOverlay open={isAboutOpen} onOpenChange={setIsAboutOpen} />
    </section>
  );
};

export default CallToAction;
