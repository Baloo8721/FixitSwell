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
    title: "Assembly, Mounting & Setups",
    services: [
      "TV Mount (Up to 65\")",
      "Soundbar / Speaker Mount",
      "Large Mirror / Heavy Art",
      "Small Picture / Art Hanging",
      "Desk / Table / Shelf Assembly",
      "Bed Frame Assembly",
      "Patio Set / Outdoor Furniture",
      "Custom Carpentry (Tables/Desks)",
      "Blind / Curtain Rod Install",
      "Ceiling Fan Install",
      "Light Fixture Swap",
      "Video Doorbell / Ring Install",
      "Smart Door Lock / Deadbolt Install",
      "Security Camera / Wifi Cam Setup",
      "Grab Bar / Handrail Install",
      "Fire Extinguisher Mount & Check",
      "Pet Gate / Enclosure Install",
      "Appliance Install (Fridge/Micro/DW)",
      "Wall Painting (Small Room)",
    ],
  },
  {
    icon: Tv,
    title: "Maintenance, Repairs & To-Do Lists",
    services: [
      "Faucet Replacement",
      "Shower Head Replacement",
      "Garbage Disposal Install",
      "Toilet Repair (Valve/Flapper)",
      "Drain Snaking / Clog Removal",
      "Outlet or Switch Replacement",
      "Drywall Patch / Wall Repair",
      "Cabinet Hinge Repair",
      "Interior/Exterior Trim Touchups",
      "Dryer Vent Clean",
      "Fence / Gate / Deck Repair",
      "Irrigation / Sprinkler Repair",
      "Roof Debris Clean & Leak Patch",
      "Mobile Home Roof Coating (UV-Reflective & Waterproof)",
      "To-Do Lists & Touch-Ups",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Pressure Washing & Home Cleaning",
    services: [
      "Pressure Wash Driveway",
      "Pressure Wash Carports & Walkways",
      "Pressure Wash Windows / Exterior",
      "Roof Cleaning",
      "Gutter Cleaning & Minor Repair",
      "Standard House Clean",
    ],
  },
  {
    icon: Heart,
    title: "Safety & Senior Support, Tech Help",
    services: [
      "Smart Thermostat Setup",
      "Wifi Extender / Mesh Setup",
      "Tech Troubleshooting / Help",
      "Streaming / TV App / Remote Setup",
      "Phone / Tablet / Device Help",
      "Free Scam & Fraud Awareness Training",
      "Home Hazard Audit (Trip/Elec/Fire)",
      "Handrails / Fall / Anti-Slip Solutions",
      "Non-Slip Mats / Night Light Setup",
      "Smoke Detector Battery (Whole House)",
      "Light Bulb Replacement (High/Hard)",
      "Wellness Check-ins & Snowbird Monitoring",
      "Delivery / Contractor Wait Time",
    ],
  },
  {
    icon: Leaf,
    title: "Outdoor, Yard & Seasonal",
    services: [
      "Light Yard Cleanup & Gardening",
      "Landscaping & Pet Waste Cleanup",
      "Monthly Yard / Litter Clean",
      "Storm Prep (Boards/Bags/Tie Downs)",
      "Storm Takedown & Storage",
      "Holiday Light Setup",
      "Holiday Takedown & Packing",
    ],
  },
  {
    icon: Sparkles,
    title: "Organizing & General Help",
    services: [
      "Kitchen / Cupboard / Pantry Org",
      "Closet / Utility / Laundry Org",
      "Storage & Room Organizing",
      "Garage / Shed / Item Sort",
      "Heavy Lifting & Sorting",
      "Junk Removal (Small Load)",
      "Furniture Rearrange / Declutter",
      "Item Valuation / Garage Sale Help",
      "Real Estate Photo / Video / Drone",
      "\"I Just Need an Extra Hand\" Help",
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
          No surprises. All work stays within safe, appropriate limits — light repairs, cosmetic fixes, and helpful support. We work With all Budgets, Contact us for a free quote
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
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 pt-2">
                  {category.services.map((service, serviceIndex) => (
                    <li
                      key={serviceIndex}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <span className="text-primary mt-0.5 text-base flex-shrink-0">✓</span>
                      <span className="text-sm leading-snug">{service}</span>
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
