import { createContext, useContext, useState, ReactNode } from "react";
import { ClipboardList, CalendarDays, Phone, MessageSquare, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const serviceCategories = [
  {
    category: "Assembly, Mounting & Setup",
    services: [
      "Furniture Assembly — Beds, desks, shelves, outdoor sets ($50–$150)",
      "TV & Wall Mounting — TVs, shelves, mirrors, soundbars ($75–$200)",
      "Appliance Hookups — Washers, dryers, microwaves, dishwashers ($80–$200)",
      "Blinds & Curtain Rod Installation",
    ],
  },
  {
    category: "Technology & WiFi Help",
    services: [
      "Smart Device Setup — Doorbells, cameras, lights, Wi-Fi extenders ($75–$200)",
      "Home Network & WiFi Troubleshooting",
      "Streaming, Remote & App Setup ($50–$150)",
      "Scam Awareness Tips",
    ],
  },
  {
    category: "Repairs & Honey-Do Fixes",
    services: [
      "Door & Window Adjustments — Squeaks, alignment, weather strips ($50–$200)",
      "Screen Repair & Replacement",
      "Minor Repairs — Hinges, knobs, caulking, small holes ($50–$150)",
      "Drywall Patching (small holes, touch-ups)",
      "Skirting & Exterior Fixes — Vinyl skirting, mailbox, porch rails ($80–$200)",
      "Interior/Exterior Touch-Up Painting ($150–$500)",
      "Minor Furniture Repair — Glue, sand scratches, tighten wobbles",
    ],
  },
  {
    category: "Safety & Senior Support",
    services: [
      "Grab Bars & Fall Prevention — Grab bars, non-slip mats, night lights ($100–$300)",
      "Light Bulb & Battery Changes — Hard-to-reach, smoke detectors ($40–$100)",
      "Filter Replacements — AC, water filters",
      "Pest Barrier Setup — Door sweeps, window strips",
      "Errands & Personal Assistance — Pharmacy/store runs, mail sorting ($30–$100/hr)",
      "Wait-at-Home Help — Wait for contractors/deliveries ($50–$150)",
    ],
  },
  {
    category: "Outdoor & Seasonal",
    services: [
      "Window Washing — Interior & exterior",
      "Pressure Washing — Driveways, patios, skirting ($80–$300)",
      "Gutter Cleaning — Single-story, ladder access ($100–$250)",
      "Awning & Canopy Cleaning",
      "Light Yard Cleanup — Trimming, weeding, mulch ($100–$300)",
      "Plant Care — Water & trim porch plants",
      "Fence & Gate Minor Repairs",
      "Storm & Hurricane Prep — Ties, covers, window films ($100–$300)",
      "Holiday Light Hanging & Take-Down",
    ],
  },
  {
    category: "Organizing & Extras",
    services: [
      "Interior & Garage Organizing — Closets, kitchens, sheds ($75–$500)",
      "Junk Sorting & Valuation — Declutter, price for sales",
      "Bicycle & Scooter Tune-Ups — Lube, inflate, adjust ($40–$100)",
      "Pet Gate & Enclosure Setup ($80–$150)",
      "Quick Home Photos & Video Tours",
    ],
  },
];

type ServicesOverlayContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ServicesOverlayContext = createContext<ServicesOverlayContextType | null>(null);

export const useServicesOverlay = () => {
  const context = useContext(ServicesOverlayContext);
  if (!context) {
    throw new Error("useServicesOverlay must be used within ServicesOverlayProvider");
  }
  return context;
};

export const ServicesOverlayProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <ServicesOverlayContext.Provider value={{ open, setOpen }}>
      {children}
      
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 flex flex-col items-center justify-center px-3 py-2 gap-0.5"
        aria-label="View all services"
      >
        <ClipboardList className="w-5 h-5" />
        <span className="text-[9px] font-medium leading-tight">All Services</span>
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Complete Service List</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[65vh] pr-4">
            <div className="space-y-6">
              {serviceCategories.map((cat, catIndex) => (
                <div key={catIndex}>
                  <h3 className="font-heading text-lg text-foreground mb-3 border-b border-border pb-2">
                    {cat.category}
                  </h3>
                  <ul className="space-y-2">
                    {cat.services.map((service, serviceIndex) => (
                      <li
                        key={serviceIndex}
                        className="flex items-start gap-2 text-muted-foreground py-1"
                      >
                        <span className="text-primary mt-0.5">✓</span>
                        <span className="text-sm leading-relaxed">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              {/* Pricing note */}
              <div className="bg-secondary/50 rounded-lg p-4 mt-6">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Pricing Note:</strong> Most jobs are $50–$200. 
                  Larger projects quoted upfront. Senior & military discount: 10% off.
                </p>
              </div>
            </div>
          </ScrollArea>
          
          {/* Action links */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a 
                href="#booking" 
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <CalendarDays className="w-4 h-4" />
                Book Now
              </a>
              <a 
                href="tel:+18137381655" 
                className="inline-flex items-center gap-1.5 bg-secondary text-foreground px-3 py-2 rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <Phone className="w-4 h-4 text-primary" />
                Call
              </a>
              <a 
                href="sms:+18137381655" 
                className="inline-flex items-center gap-1.5 bg-secondary text-foreground px-3 py-2 rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-primary" />
                Text
              </a>
              <a 
                href="#message-form" 
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 bg-secondary text-foreground px-3 py-2 rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <Mail className="w-4 h-4 text-primary" />
                Message
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ServicesOverlayContext.Provider>
  );
};

export default ServicesOverlayProvider;
