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
    title: "Everyday Home Help",
    services: [
      "Light bulb & battery changes",
      "Door & window adjustments",
      "Furniture assembly & minor fixes",
      "Caulking & weather sealing",
      "Small drywall patching",
      "Smoke detector maintenance",
      "Cabinet hardware installation",
    ],
  },
  {
    icon: Tv,
    title: "Technology & WiFi Help",
    services: [
      "TV & streaming setup (Roku, Fire Stick, etc.)",
      "WiFi troubleshooting & optimization",
      "Wireless camera & doorbell setup",
      "Smart device configuration",
      "Phone & tablet assistance",
      "Remote control programming",
      "Printer setup & troubleshooting",
    ],
  },
  {
    icon: TreeDeciduous,
    title: "Outdoor & Porch Help",
    services: [
      "Solar light & flood light installation",
      "Light yard cleanup & debris removal",
      "Gutter cleaning & inspection",
      "Pressure washing walkways",
      "Porch furniture assembly",
      "Hanging plants & wind chimes",
      "Screen door adjustments",
    ],
  },
  {
    icon: Heart,
    title: "Senior Assistance Services",
    services: [
      "Medication cabinet organizing",
      "Emergency kit setup & review",
      "Mobility aid assembly (walkers, rails)",
      "Wheelchair & walker add-ons",
      "Hearing aid battery changes",
      "Lift chair & bed rail installation",
      "Organizing & decluttering help",
    ],
  },
];

const ServicesSection = () => {
  return (
    <section className="py-section px-4 bg-secondary">
      <div className="container max-w-4xl mx-auto">
        <h2 className="font-heading text-heading-md text-center text-foreground mb-4">
          Services We Provide
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          From quick fixes to tech help, we handle the little things so you can enjoy your day.
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
