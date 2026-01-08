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
    category: "Mounting",
    services: [
      "TV Mount (Up to 65\") — $175",
      "TV Mount (70\"+ or Brick/Stone) — $250",
      "Soundbar / Speaker Mount — $85",
      "Large Mirror / Heavy Art — $110",
      "Small Picture / Art Hanging — $45",
    ],
  },
  {
    category: "Assembly",
    services: [
      "Desk / Table / Shelf Assembly — $135",
      "Bed Frame Assembly — $160",
      "Patio Set / Outdoor Furniture — $225",
      "Custom Carpentry (Tables/Desks) — $650",
    ],
  },
  {
    category: "Plumbing",
    services: [
      "Faucet Replacement — $165",
      "Shower Head Replacement — $75",
      "Garbage Disposal Install — $185",
      "Toilet Repair (Valve/Flapper/Grout) — $135",
      "Toilet Replacement (Full Install) — $275",
      "Drain Snaking / Clog Removal — $110",
      "Caulking (Tub/Shower/Kitchen) — $160",
    ],
  },
  {
    category: "Electrical",
    services: [
      "Ceiling Fan Install — $185",
      "Light Fixture Swap / Exterior Light — $125",
      "Outlet or Switch Replacement — $55",
      "Light Bulb Replacement (High/Hard) — $75",
      "Smoke Detector Unit Swap — $75",
      "Smoke Detector Battery (Whole House) — $95",
      "Flood Light / Motion Sensor — $155",
    ],
  },
  {
    category: "Interior Repair",
    services: [
      "Drywall Patch / Wall Repair — $115",
      "Door Lock / Deadbolt Swap — $85",
      "Closet Door Repair / Track Adjust — $95",
      "Blind / Curtain Rod Install — $75",
      "Baseboard / Trim Repair — $140",
      "Cabinet Hinge Repair / Adjust — $45",
      "Furniture Repair (Glue/Sand/Tighten) — $85",
      "Door Sweep / Window Strip / Barrier — $85",
    ],
  },
  {
    category: "Painting",
    services: [
      "Wall Painting (Small Room) — $375",
      "Wall Painting (Large Room) — $550",
      "Ceiling Painting — $225",
      "Cabinet Painting / Refinishing — $110/door",
      "Furniture Paint & Seal — $175",
      "Interior/Exterior Trim Touchups — $150",
      "Whole House Interior — $2.50/sq ft",
      "Whole House Exterior — $3.50/sq ft",
    ],
  },
  {
    category: "Appliance Care",
    services: [
      "Appliance Install (Fridge/Micro/DW) — $150",
      "Washer / Dryer Hookup — $165",
      "Old Appliance / Trash Removal — $95",
      "Dryer Vent Clean (Pipe & Filter) — $145",
      "Appliance Deep Clean (Oven/Fridge) — $125",
      "Filter Service (HVAC/Water/Fridge) — $85",
      "HVAC Drip Line (Vac & Vinegar) — $120",
    ],
  },
  {
    category: "Outdoor",
    services: [
      "Gutter Cleaning & Minor Repair — $195",
      "Pressure Wash Driveway — $225",
      "Pressure Wash Windows / Exterior — $450",
      "Fence / Gate / Deck Repair — $185",
      "Irrigation / Sprinkler Repair — $135",
      "Roof Debris Clean & Leak Patch — $250",
      "Roof Elastic / Waterproof Coating — $1,800",
    ],
  },
  {
    category: "Seasonal",
    services: [
      "Storm Prep (Boards/Bags/Tie Downs) — $350",
      "Storm Takedown & Storage — $200",
      "Holiday Light Setup — $300",
      "Holiday Takedown & Packing — $150",
    ],
  },
  {
    category: "Cleaning & Organizing",
    services: [
      "Kitchen / Cupboard / Pantry Org — $250",
      "Closet / Utility / Laundry Org — $185",
      "Garage / Shed / Item Sort — $300",
      "Junk Removal (Small Load) — $150",
      "Furniture Rearrange / Declutter — $75/hr",
      "Item Valuation / Garage Sale Help — $85/hr",
      "Standard House Clean (Sweep/Mop/Vac) — $175",
    ],
  },
  {
    category: "Safety & Senior Support",
    services: [
      "Grab Bar / Handrail Install — $125",
      "Fire Extinguisher Mount & Check — $65",
      "Home Hazard Audit (Trip/Elec/Fire) — $150",
      "Non-Slip Mats / Night Light Setup — $95",
    ],
  },
  {
    category: "Concierge & Extras",
    services: [
      "Delivery / Contractor Wait Time — $65/hr",
      "Real Estate Photo / Video / Drone — $450",
      "Pet Gate / Enclosure / Custom Home — $115",
      "Monthly Yard / Litter Clean — $75",
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
                  <strong className="text-foreground">Pricing Note:</strong> Prices shown are labor only. 
                  Materials/parts extra. Senior & military discount: 10% off.
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
