import { useState } from "react";
import { ClipboardList, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const allServices = [
  "Furniture assembly (beds, desks, shelves, outdoor sets)",
  "TV & wall mounting (smart TVs, shelves, mirrors, art)",
  "Appliance hookup (washers/dryers)",
  "Blinds & curtain rod installation",
  "Drywall patching (small holes, touch-ups)",
  "Door & window adjustments",
  "Caulking & sealing (windows, tubs, doors)",
  "Interior touch-up painting",
  "Minor furniture repair",
  "Filter replacements (AC/water)",
  "Light bulb & battery changes",
  "Mailbox & sign fixes",
  "Pest barrier setup",
  "Storm kit assembly & install",
  "Wireless smart device setup",
  "Home network & WiFi help",
  "TV remote & streaming setup",
  "Quick home photos & video tours",
  "Exterior pressure washing",
  "Fence & gate minor repairs",
  "Light yard cleanup",
  "Gutter cleaning",
  "Holiday light hanging & take-down",
  "Window washing",
  "Awning & canopy cleaning",
  "Skirting touch-ups",
  "Porch & step rail tweaks",
  "Plant care service",
  "Interior organizing",
  "Junk sorting & valuation",
  "Pet gate & enclosure setup",
  "Bicycle & scooter tune-ups",
  "Errand add-on (store runs)",
];

const ServicesOverlay = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center"
          aria-label="View all services"
        >
          <ClipboardList className="w-6 h-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">All Services We Offer</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <ul className="space-y-2">
            {allServices.map((service, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-muted-foreground py-1"
              >
                <span className="text-primary mt-0.5">✓</span>
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ServicesOverlay;
