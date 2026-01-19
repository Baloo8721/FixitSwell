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
      "TV Mount (Up to 65\")",
      "TV Mount (70\"+ or Brick/Stone)",
      "Soundbar / Speaker Mount",
      "Large Mirror / Heavy Art",
      "Small Picture / Art Hanging",
      "Desk / Table / Shelf Assembly",
      "Bed Frame Assembly",
      "Patio Set / Outdoor Furniture",
      "Custom Carpentry (Tables/Desks)",
    ],
  },
  {
    icon: Tv,
    title: "Technology & WiFi Help",
    services: [
      "Video Doorbell / Ring Install",
      "Smart Door Lock / Deadbolt Install",
      "Security Camera / Wifi Cam Setup",
      "Smart Thermostat Setup",
      "Wifi Extender / Mesh Setup",
      "Tech Troubleshooting / Help",
      "Streaming / TV App / Remote Setup",
      "Phone / Tablet / Device Help",
      "Scam & Fraud Awareness Training",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Repairs & Honey-Do Fixes",
    services: [
      "Faucet Replacement",
      "Shower Head Replacement",
      "Garbage Disposal Install",
      "Toilet Repair (Valve/Flapper)",
      "Drain Snaking / Clog Removal",
      "Ceiling Fan Install",
      "Light Fixture Swap",
      "Outlet or Switch Replacement",
      "Drywall Patch / Wall Repair",
      "Blind / Curtain Rod Install",
      "Cabinet Hinge Repair",
      "Wall Painting (Small Room)",
      "Interior/Exterior Trim Touchups",
      "Appliance Install (Fridge/Micro/DW)",
      "Dryer Vent Clean",
    ],
  },
  {
    icon: Heart,
    title: "Safety & Senior Support",
    services: [
      "Grab Bar / Handrail Install",
      "Fire Extinguisher Mount & Check",
      "Home Hazard Audit (Trip/Elec/Fire)",
      "Non-Slip Mats / Night Light Setup",
      "Smoke Detector Battery (Whole House)",
      "Light Bulb Replacement (High/Hard)",
      "Delivery / Contractor Wait Time",
    ],
  },
  {
    icon: Leaf,
    title: "Outdoor & Seasonal",
    services: [
      "Gutter Cleaning & Minor Repair",
      "Pressure Wash Driveway",
      "Pressure Wash Windows / Exterior",
      "Fence / Gate / Deck Repair",
      "Irrigation / Sprinkler Repair",
      "Roof Debris Clean & Leak Patch",
      "Storm Prep (Boards/Bags/Tie Downs)",
      "Storm Takedown & Storage",
      "Holiday Light Setup",
      "Holiday Takedown & Packing",
    ],
  },
  {
    icon: Sparkles,
    title: "Organizing & Extras",
    services: [
      "Kitchen / Cupboard / Pantry Org",
      "Closet / Utility / Laundry Org",
      "Garage / Shed / Item Sort",
      "Junk Removal (Small Load)",
      "Furniture Rearrange / Declutter",
      "Item Valuation / Garage Sale Help",
      "Standard House Clean",
      "Pet Gate / Enclosure Install",
      "Monthly Yard / Litter Clean",
      "Real Estate Photo / Video / Drone",
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
