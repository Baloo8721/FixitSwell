import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ServicesSection from "@/components/ServicesSection";
import SpecialPackages from "@/components/SpecialPackages";
import WhyTrustUs from "@/components/WhyTrustUs";
import BookingCalendar from "@/components/BookingCalendar";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { ServicesOverlayProvider } from "@/components/ServicesOverlay";
import { CalendarDays } from "lucide-react";

const Index = () => {
  return (
    <ServicesOverlayProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <HowItWorks />
          <section id="services">
            <ServicesSection />
          </section>
          <section id="packages">
            <SpecialPackages />
          </section>
          <WhyTrustUs />
          
          {/* Booking Calendar Section */}
          <section id="booking" className="py-section px-4 bg-secondary/30">
            <div className="container max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-2 text-primary font-semibold mb-2">
                  <CalendarDays className="w-5 h-5" />
                  Easy Online Booking
                </span>
                <h2 className="font-heading text-heading-md text-foreground">
                  Schedule Your Appointment
                </h2>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-lg">
                  Pick a date and time that works for you. It's simple — just like it should be.
                </p>
              </div>
              
              <BookingCalendar />
              
              <p className="text-center text-muted-foreground mt-8">
                Prefer to call? <a href="tel:+18137381655" className="text-primary underline font-medium">Click here to call us</a>
              </p>
            </div>
          </section>
          
          <CallToAction />
        </main>
        <Footer />
      </div>
    </ServicesOverlayProvider>
  );
};

export default Index;
