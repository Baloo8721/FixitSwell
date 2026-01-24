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
    category: "Assembly, Mounting & Setups",
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
      "Washer / Dryer Hookup",
      "Wall Painting (Small Room)",
      "Wall Painting (Large Room)",
      "Ceiling Painting",
    ],
  },
  {
    category: "Maintenance, Repairs & To-Do Lists",
    services: [
      "Faucet Replacement",
      "Shower Head Replacement",
      "Garbage Disposal Install",
      "Toilet Repair (Valve/Flapper)",
      "Toilet Replacement (Full Install)",
      "Drain Snaking / Clog Removal",
      "Caulking (Tub/Shower/Kitchen)",
      "Outlet or Switch Replacement",
      "Drywall Patch / Wall Repair",
      "Cabinet Hinge Repair",
      "Interior/Exterior Trim Touchups",
      "Baseboard / Trim Repair",
      "Door Lock / Deadbolt Swap",
      "Closet Door Repair / Track Adjust",
      "Door Sweep / Window Strip / Barrier",
      "Furniture Repair (Glue/Sand/Tighten)",
      "Dryer Vent Clean",
      "Fence / Gate / Deck Repair",
      "Irrigation / Sprinkler Repair",
      "Roof Debris Clean & Leak Patch",
      "Mobile Home Roof Coating (UV-Reflective & Waterproof)",
      "Cabinet Painting / Refinishing",
      "To-Do Lists & Touch-Ups",
    ],
  },
  {
    category: "Pressure Washing & Home Cleaning",
    services: [
      "Pressure Wash Driveway",
      "Pressure Wash Carports & Walkways",
      "Pressure Wash Windows / Exterior",
      "Roof Cleaning",
      "Gutter Cleaning & Minor Repair",
      "Standard House Clean",
      "Appliance Deep Clean (Oven/Fridge)",
      "Filter Service (HVAC/Water/Fridge)",
      "HVAC Drip Line (Vac & Vinegar)",
    ],
  },
  {
    category: "Safety & Senior Support, Tech Help",
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
      "Smoke Detector Unit Swap",
      "Light Bulb Replacement (High/Hard)",
      "Flood Light / Motion Sensor",
      "Wellness Check-ins & Snowbird Monitoring",
      "Delivery / Contractor Wait Time",
    ],
  },
  {
    category: "Outdoor, Yard & Seasonal",
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
    category: "Organizing & General Help",
    services: [
      "Kitchen / Cupboard / Pantry Org",
      "Closet / Utility / Laundry Org",
      "Storage & Room Organizing",
      "Garage / Shed / Item Sort",
      "Heavy Lifting & Sorting",
      "Junk Removal (Small Load)",
      "Old Appliance / Trash Removal",
      "Furniture Rearrange / Declutter",
      "Item Valuation / Garage Sale Help",
      "Real Estate Photo / Video / Drone",
      "\"I Just Need an Extra Hand\" Help",
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
        <DialogContent className="max-w-lg sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-center">Complete Service List</DialogTitle>
            <p className="text-sm text-muted-foreground text-center">Everything we can help with</p>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {serviceCategories.map((cat, catIndex) => (
                <div key={catIndex} className="bg-secondary/30 rounded-xl p-4">
                  <h3 className="font-heading text-base text-primary mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    {cat.category}
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {cat.services.map((service, serviceIndex) => (
                      <li
                        key={serviceIndex}
                        className="flex items-start gap-2 text-foreground"
                      >
                        <span className="text-primary mt-0.5 flex-shrink-0 text-sm">✓</span>
                        <span className="text-sm leading-snug">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Service note */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-foreground text-center">
                  <strong>Free quotes!</strong> Senior & military discount: 10% off.
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
