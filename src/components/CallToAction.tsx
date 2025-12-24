import { Phone, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-section-lg px-4 bg-primary">
      <div className="container max-w-3xl mx-auto text-center">
        <h2 className="font-heading text-heading-md md:text-heading-lg text-primary-foreground mb-4">
          Need Help Today?
        </h2>
        <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
          Give us a call or send a text. We&apos;re here to make your day easier.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button 
            asChild
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-xl px-10 py-7 rounded-xl shadow-lg"
          >
            <a href="tel:+1234567890">
              <Phone className="w-6 h-6 mr-3" />
              Call Now
            </a>
          </Button>
          <Button 
            asChild
            size="lg" 
            variant="outline"
            className="border-2 border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary text-xl px-10 py-7 rounded-xl"
          >
            <a href="sms:+1234567890">
              <MessageCircle className="w-6 h-6 mr-3" />
              Text for Help
            </a>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-primary-foreground/70">
          <Clock className="w-5 h-5" />
          <span>Same-day or next-day availability</span>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
