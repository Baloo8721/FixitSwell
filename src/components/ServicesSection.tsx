import { Wrench, Tv, Leaf, Heart, ShieldCheck, Sparkles, List, MapPin, Clock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useServicesOverlay } from "@/components/ServicesOverlay";
import lakeshoreMap from "@/assets/lakeshore villas.png";

const serviceCategories = [
  {
    icon: Wrench,
    title: "Assembly, Mounting & Setup",
    services: [
      "Furniture Assembly — Beds, desks, shelves, outdoor sets, IKEA/Wayfair items ($50–$150)",
      "TV & Wall Mounting — TVs, shelves, mirrors, soundbars (no wiring) ($75–$200)",
      "Appliance Hookups — Washers, dryers, microwaves, dishwashers ($80–$200)",
    ],
  },
  {
    icon: Tv,
    title: "Technology & WiFi Help",
    services: [
      "Smart Device Setup — Doorbells, cameras, lights, Wi-Fi extenders ($75–$200)",
      "Streaming & Remote Help — TV apps, phones, basic tech troubleshooting ($50–$150)",
      "Scam Awareness Tips — We help you stay safe online",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Repairs & Honey-Do Fixes",
    services: [
      "Door & Window Adjustments — Squeaks, alignment, weather strips, screens ($50–$200)",
      "Minor Repairs — Tighten hinges/knobs, caulking, patch small holes ($50–$150)",
      "Skirting & Exterior Fixes — Vinyl skirting, mailbox, porch rails ($80–$200)",
      "Interior/Exterior Touch-Up Painting — Walls, trim, doors ($150–$500)",
    ],
  },
  {
    icon: Heart,
    title: "Safety & Senior Support",
    services: [
      "Grab Bars & Fall Prevention — Install grab bars, non-slip mats, night lights ($100–$300)",
      "Light Bulb, Battery & Filter Changes — Hard-to-reach, smoke detectors, AC filters ($40–$100)",
      "Errands & Personal Assistance — Pharmacy/store runs, mail sorting ($30–$100/hr)",
      "Wait-at-Home Help — Wait for contractors/deliveries, lift items ($50–$150)",
    ],
  },
  {
    icon: Leaf,
    title: "Outdoor & Seasonal",
    services: [
      "Window & Pressure Washing — Windows, driveways, patios, skirting ($80–$300)",
      "Gutter Cleaning & Awning Care — Single-story gutters, soft wash awnings ($100–$250)",
      "Light Yard Cleanup — Trimming, weeding, mulch, porch plants ($100–$300)",
      "Storm & Holiday Prep — Hurricane prep, window films, holiday lights ($100–$300)",
    ],
  },
  {
    icon: Sparkles,
    title: "Organizing & Extras",
    services: [
      "Interior & Garage Organizing — Closets, kitchens, sheds, declutter ($75–$500)",
      "Junk Sorting & Valuation — Help price items for sales",
      "Bicycle & Scooter Tune-Ups — Basic lube, inflate, adjust ($40–$100)",
      "Pet Gate & Enclosure Setup — Non-permanent installs ($80–$150)",
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

        {/* Service Area - Compact */}
        <div className="mt-12 max-w-md mx-auto">
          <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
            {/* Header */}
            <div className="px-3 py-2 border-b border-border bg-primary/5">
              <h3 className="font-heading text-base text-center text-foreground flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Our Service Area
              </h3>
            </div>

            {/* Map Image - fills container edge to edge */}
            <div className="relative">
              <img
                src={lakeshoreMap}
                alt="Lakeshore Villas Community Map"
                className="w-full h-auto block"
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <div className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-2 py-1 rounded-full text-[10px] font-medium shadow-lg">
                  <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                  Exclusive Service Area
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 space-y-2">
              <div className="text-center">
                <h4 className="font-heading text-base text-foreground">Lakeshore Villas</h4>
                <p className="text-xs text-muted-foreground">Mobile home community in Tampa, FL</p>
              </div>
              <div className="flex items-center justify-center gap-1 text-sm">
                <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-foreground font-bold">Mon–Fri: 8:30 AM – 2:30 PM</span>
                <span className="text-muted-foreground">| Weekends: Contact us</span>
              </div>
              <p className="text-sm text-primary font-semibold text-center pt-2 border-t border-border">
                Local neighbors helping neighbors — no travel fees
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
