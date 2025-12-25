import { Wrench, Tv, TreeDeciduous, Heart } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const serviceCategories = [
  {
    icon: Wrench,
    title: "Home Repairs & Maintenance",
    services: [
      "Furniture assembly (beds, desks, shelves, outdoor sets)",
      "TV & wall mounting (smart TVs, shelves, mirrors, art)",
      "Appliance hookup (washers/dryers – surface connections)",
      "Blinds & curtain rod installation",
      "Drywall patching (small holes, touch-ups)",
      "Door & window adjustments (squeaks, screens, weather strips)",
      "Caulking & sealing (windows, tubs, doors)",
      "Interior touch-up painting (walls, trim, cabinets)",
      "Minor furniture repair (glue, sand scratches, tighten wobbles)",
      "Filter replacements (AC/water filters)",
      "Light bulb & battery changes (hard-to-reach, smoke detectors)",
      "Mailbox & sign fixes (tighten, paint, simple parts)",
      "Pest barrier setup (door sweeps, window strips)",
      "Storm kit assembly & install (ties, covers, window films)",
    ],
  },
  {
    icon: Tv,
    title: "Technology & WiFi Help",
    services: [
      "Wireless smart device setup (doorbells, lights, cameras)",
      "Home network help (routers, WiFi extenders, troubleshooting)",
      "TV remote & streaming setup (apps, troubleshooting)",
      "Quick home photos & video tours (for rentals/sales)",
    ],
  },
  {
    icon: TreeDeciduous,
    title: "Outdoor & Porch Help",
    services: [
      "Exterior pressure washing (siding, driveways, decks, skirting)",
      "Fence & gate minor repairs (paint touch-ups, latch fixes)",
      "Light yard cleanup (trim bushes, mulch beds, debris removal)",
      "Gutter cleaning (ladder access)",
      "Holiday light hanging & take-down",
      "Window washing (interior/exterior)",
      "Awning & canopy cleaning & tweaks",
      "Skirting touch-ups (vinyl panels – repairs/replace sections)",
      "Porch & step rail tweaks (tighten only)",
      "Plant care service (water/trim porch plants)",
    ],
  },
  {
    icon: Heart,
    title: "Senior Assistance & Extras",
    services: [
      "Interior organizing (closets, kitchens, sheds – sort/label)",
      "Junk sorting & valuation (declutter, price for sales)",
      "Basic pet gate & enclosure setup",
      "Bicycle & scooter tune-ups (chain lube, tire inflation)",
      "Errand add-on (pick up supplies/store runs)",
    ],
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-section px-4 bg-secondary">
      <div className="container max-w-4xl mx-auto">
        <h2 className="font-heading text-heading-md text-center text-foreground mb-4">
          Services We Provide
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          All services are fully legal for unlicensed work in Florida. Minor and cosmetic jobs only — no structural, electrical, or plumbing work.
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
                <ul className="grid sm:grid-cols-2 gap-3 pt-2">
                  {category.services.map((service, serviceIndex) => (
                    <li 
                      key={serviceIndex}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <span className="text-primary mt-1">✓</span>
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default ServicesSection;
