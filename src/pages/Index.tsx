import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ServicesSection from "@/components/ServicesSection";
import SpecialPackages from "@/components/SpecialPackages";
import WhyTrustUs from "@/components/WhyTrustUs";
import SafetyNote from "@/components/SafetyNote";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import { ServicesOverlayProvider } from "@/components/ServicesOverlay";

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
          <SafetyNote />
          <CallToAction />
        </main>
        <Footer />
      </div>
    </ServicesOverlayProvider>
  );
};

export default Index;
