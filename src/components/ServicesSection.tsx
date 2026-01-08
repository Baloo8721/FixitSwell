import { Wrench, Tv, Leaf, Heart, ShieldCheck, Sparkles, List } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useServicesOverlay } from "@/components/ServicesOverlay";

const serviceCategories = [
  {
    icon: Wrench,
    title: "Assembly, Mounting & Setup",
    services: [
      "TV Mount (Up to 65\") — $175",
      "TV Mount (70\"+ or Brick/Stone) — $250",
      "Soundbar / Speaker Mount — $85",
      "Large Mirror / Heavy Art — $110",
      "Small Picture / Art Hanging — $45",
      "Desk / Table / Shelf Assembly — $135",
      "Bed Frame Assembly — $160",
      "Patio Set / Outdoor Furniture — $225",
      "Custom Carpentry (Tables/Desks) — $650",
    ],
  },
  {
    icon: Tv,
    title: "Technology & WiFi Help",
    services: [
      "Video Doorbell / Ring Install — $125",
      "Smart Door Lock / Deadbolt Install — $115",
      "Security Camera / Wifi Cam Setup — $110",
      "Smart Thermostat Setup — $140",
      "Wifi Extender / Mesh Setup — $150",
      "Tech Troubleshooting / Help — $95/hr",
      "Streaming / TV App / Remote Setup — $120",
      "Phone / Tablet / Device Help — $85",
      "Scam & Fraud Awareness Training — $100",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Repairs & Honey-Do Fixes",
    services: [
      "Faucet Replacement — $165",
      "Shower Head Replacement — $75",
      "Garbage Disposal Install — $185",
      "Toilet Repair (Valve/Flapper) — $135",
      "Drain Snaking / Clog Removal — $110",
      "Ceiling Fan Install — $185",
      "Light Fixture Swap — $125",
      "Outlet or Switch Replacement — $55",
      "Drywall Patch / Wall Repair — $115",
      "Blind / Curtain Rod Install — $75",
      "Cabinet Hinge Repair — $45",
      "Wall Painting (Small Room) — $375",
      "Interior/Exterior Trim Touchups — $150",
      "Appliance Install (Fridge/Micro/DW) — $150",
      "Dryer Vent Clean — $145",
    ],
  },
  {
    icon: Heart,
    title: "Safety & Senior Support",
    services: [
      "Grab Bar / Handrail Install — $125",
      "Fire Extinguisher Mount & Check — $65",
      "Home Hazard Audit (Trip/Elec/Fire) — $150",
      "Non-Slip Mats / Night Light Setup — $95",
      "Smoke Detector Battery (Whole House) — $95",
      "Light Bulb Replacement (High/Hard) — $75",
      "Delivery / Contractor Wait Time — $65/hr",
    ],
  },
  {
    icon: Leaf,
    title: "Outdoor & Seasonal",
    services: [
      "Gutter Cleaning & Minor Repair — $195",
      "Pressure Wash Driveway — $225",
      "Pressure Wash Windows / Exterior — $450",
      "Fence / Gate / Deck Repair — $185",
      "Irrigation / Sprinkler Repair — $135",
      "Roof Debris Clean & Leak Patch — $250",
      "Storm Prep (Boards/Bags/Tie Downs) — $350",
      "Storm Takedown & Storage — $200",
      "Holiday Light Setup — $300",
      "Holiday Takedown & Packing — $150",
    ],
  },
  {
    icon: Sparkles,
    title: "Organizing & Extras",
    services: [
      "Kitchen / Cupboard / Pantry Org — $250",
      "Closet / Utility / Laundry Org — $185",
      "Garage / Shed / Item Sort — $300",
      "Junk Removal (Small Load) — $150",
      "Furniture Rearrange / Declutter — $75/hr",
      "Item Valuation / Garage Sale Help — $85/hr",
      "Standard House Clean — $175",
      "Pet Gate / Enclosure Install — $115",
      "Monthly Yard / Litter Clean — $75",
      "Real Estate Photo / Video / Drone — $450",
    ],
  },
];

const ServicesSection = () => {
  const { setOpen } = useServicesOverlay();

  return (
    <section id="services" className="py-section px-4 bg-secondary">
      <div className="container max-w-4xl mx-auto">
        <h2 className="font-heading text-heading-md text-center text-foreground mb-4">
          Services We Provide
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Clear pricing. No surprises. All work stays within safe, appropriate limits — light repairs, cosmetic fixes, and helpful support.
        </p>

        <Accordion type="single" collapsible className="space-y-4">
          {serviceCategories.map((category, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border-none rounded-xl shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-heading text-xl text-foreground">
                    {category.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <ul className="space-y-3 pt-2">
                  {category.services.map((service, serviceIndex) => (
                    <li
                      key={serviceIndex}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span className="text-primary mt-1 text-lg">✓</span>
                      <span className="text-base leading-relaxed">{service}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 mx-auto mt-10 text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <List className="w-5 h-5" />
          See full list of services
        </button>
      </div>
    </section>
  );
};

export default ServicesSection;
