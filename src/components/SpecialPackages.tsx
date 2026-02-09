import { Gift, MapPin } from "lucide-react";

const SpecialPackages = () => {
  return (
    <section id="packages" className="py-section px-4">
      {/* Service Area - Simple List */}
      <div className="bg-background py-10">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 text-primary font-semibold mb-2">
            <MapPin className="w-4 h-4" />
            Service Areas
          </span>
          <h2 className="font-heading text-xl text-foreground mb-2">
            Proudly Serving
          </h2>
          <p className="text-muted-foreground mb-6">
            We're expanding! Currently serving these areas in Hillsborough & Pasco Counties.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Land O' Lakes", "Lutz", "Wesley Chapel", "New Tampa", "Carrollwood", "Odessa", "Trinity"].map((area, index) => (
              <span key={index} className="bg-primary/10 text-primary px-4 py-2 rounded-full font-medium">
                {area}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Don't see your area? <a href="#contact" className="text-primary underline">Contact us</a> — we may still be able to help!
          </p>
        </div>
      </div>

      {/* Referral Rewards Section */}
      <div className="bg-accent/10 py-8">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 text-accent font-semibold mb-2">
              <Gift className="w-4 h-4" />
              Referrals
            </span>
            <h2 className="font-heading text-xl text-foreground mb-2">
              Refer a Neighbor & Get Rewarded!
            </h2>
            <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
              Know a neighbor, friend, or family member in the community who could use a hand? Refer them to us and you'll both benefit.
            </p>

            <div className="flex flex-row items-center justify-center gap-4 mb-4">
              <div className="bg-card border-2 border-accent rounded-lg px-4 py-3 text-center min-w-[140px]">
                <span className="font-heading text-2xl text-accent">25% OFF</span>
                <p className="text-muted-foreground text-xs mt-0.5">Your next service</p>
              </div>
              <div className="bg-card border-2 border-primary rounded-lg px-4 py-3 text-center min-w-[140px]">
                <span className="font-heading text-2xl text-primary">25% OFF</span>
                <p className="text-muted-foreground text-xs mt-0.5">Their first service</p>
              </div>
            </div>

            <p className="text-foreground font-medium text-sm mb-1">
              Just have your neighbor mention your name when they call or text!
            </p>
            <p className="text-muted-foreground text-xs">
              Referral discount applies after new service is completed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialPackages;
