import { Phone, Clock, MapPin, Heart } from "lucide-react";
import ContactForm from "./ContactForm";

const Footer = () => {
  return (
    <footer id="contact" className="bg-secondary py-section px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="font-heading text-heading-md text-foreground mb-6">
              Get In Touch
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Have a question or ready to schedule? Fill out the form or give us a call — 
              we&apos;re happy to help.
            </p>

            <div className="space-y-6">
              <a 
                href="tel:+18137381655"
                className="flex items-center gap-4 text-foreground hover:text-primary transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">(813) 738-1655</p>
                  <p className="text-sm text-muted-foreground">Call or text anytime</p>
                </div>
              </a>

              <div className="flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">8:30 AM – 2:30 PM</p>
                  <p className="text-sm text-muted-foreground">Monday – Saturday</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-foreground">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Central Florida</p>
                  <p className="text-sm text-muted-foreground">Mobile home parks & residential communities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <ContactForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
            <Heart className="w-4 h-4 text-medic" />
            <span>Serving Seniors with Care</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FixitSwell. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
