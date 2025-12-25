import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import ServicesSection from "@/components/ServicesSection";
import SpecialPackages from "@/components/SpecialPackages";
import WhyTrustUs from "@/components/WhyTrustUs";
import SafetyNote from "@/components/SafetyNote";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import ServicesOverlay from "@/components/ServicesOverlay";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ServicesOverlay />
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
  );
};

export default Index;
