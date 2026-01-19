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
    category: "Tech & Security",
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
    category: "Mounting",
    services: [
      "TV Mount (Up to 65\")",
      "TV Mount (70\"+ or Brick/Stone)",
      "Soundbar / Speaker Mount",
      "Large Mirror / Heavy Art",
      "Small Picture / Art Hanging",
    ],
  },
  {
    category: "Assembly",
    services: [
      "Desk / Table / Shelf Assembly",
      "Bed Frame Assembly",
      "Patio Set / Outdoor Furniture",
      "Custom Carpentry (Tables/Desks)",
    ],
  },
  {
    category: "Plumbing",
    services: [
      "Faucet Replacement",
      "Shower Head Replacement",
      "Garbage Disposal Install",
      "Toilet Repair (Valve/Flapper/Grout)",
      "Toilet Replacement (Full Install)",
      "Drain Snaking / Clog Removal",
      "Caulking (Tub/Shower/Kitchen)",
    ],
  },
  {
    category: "Electrical",
    services: [
      "Ceiling Fan Install",
      "Light Fixture Swap / Exterior Light",
      "Outlet or Switch Replacement",
      "Light Bulb Replacement (High/Hard)",
      "Smoke Detector Unit Swap",
      "Smoke Detector Battery (Whole House)",
      "Flood Light / Motion Sensor",
    ],
  },
  {
    category: "Interior Repair",
    services: [
      "Drywall Patch / Wall Repair",
      "Door Lock / Deadbolt Swap",
      "Closet Door Repair / Track Adjust",
      "Blind / Curtain Rod Install",
      "Baseboard / Trim Repair",
      "Cabinet Hinge Repair / Adjust",
      "Furniture Repair (Glue/Sand/Tighten)",
      "Door Sweep / Window Strip / Barrier",
    ],
  },
  {
    category: "Painting",
    services: [
      "Wall Painting (Small Room)",
      "Wall Painting (Large Room)",
      "Ceiling Painting",
      "Cabinet Painting / Refinishing",
      "Furniture Paint & Seal",
      "Interior/Exterior Trim Touchups",
      "Whole House Interior",
      "Whole House Exterior",
    ],
  },
  {
    category: "Appliance Care",
    services: [
      "Appliance Install (Fridge/Micro/DW)",
      "Washer / Dryer Hookup",
      "Old Appliance / Trash Removal",
      "Dryer Vent Clean (Pipe & Filter)",
      "Appliance Deep Clean (Oven/Fridge)",
      "Filter Service (HVAC/Water/Fridge)",
      "HVAC Drip Line (Vac & Vinegar)",
    ],
  },
  {
    category: "Outdoor",
    services: [
      "Gutter Cleaning & Minor Repair",
      "Pressure Wash Driveway",
      "Pressure Wash Windows / Exterior",
      "Fence / Gate / Deck Repair",
      "Irrigation / Sprinkler Repair",
      "Roof Debris Clean & Leak Patch",
      "Roof Elastic / Waterproof Coating",
    ],
  },
  {
    category: "Seasonal",
    services: [
      "Storm Prep (Boards/Bags/Tie Downs)",
      "Storm Takedown & Storage",
      "Holiday Light Setup",
      "Holiday Takedown & Packing",
    ],
  },
  {
    category: "Cleaning & Organizing",
    services: [
      "Kitchen / Cupboard / Pantry Org",
      "Closet / Utility / Laundry Org",
      "Garage / Shed / Item Sort",
      "Junk Removal (Small Load)",
      "Furniture Rearrange / Declutter",
      "Item Valuation / Garage Sale Help",
      "Standard House Clean (Sweep/Mop/Vac)",
    ],
  },
  {
    category: "Safety & Senior Support",
    services: [
      "Grab Bar / Handrail Install",
      "Fire Extinguisher Mount & Check",
      "Home Hazard Audit (Trip/Elec/Fire)",
      "Non-Slip Mats / Night Light Setup",
    ],
  },
  {
    category: "Concierge & Extras",
    services: [
      "Delivery / Contractor Wait Time",
      "Real Estate Photo / Video / Drone",
      "Pet Gate / Enclosure / Custom Home",
      "Monthly Yard / Litter Clean",
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
              
              {/* Service note */}
              <div className="bg-secondary/50 rounded-lg p-4 mt-6">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Contact us for a free quote. 
                  Senior & military discount: 10% off.
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
