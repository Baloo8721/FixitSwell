import { useState, useEffect, useRef } from "react";
import { Wrench, Tv, Leaf, Heart, ShieldCheck, Sparkles, List, Star, Home, Users, Camera, Calendar, Smartphone, Gift, MapPin, Zap, Plus, Minus, Send, Loader2, Check, ChevronLeft, ChevronRight, X, ImagePlus, Phone, Building2, HomeIcon, UserCheck, Sun } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useServicesOverlay } from "@/components/ServicesOverlay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitQuoteRequest, getServicesForBooking, uploadBookingImage } from "@/lib/supabase";

// Type for uploaded images
interface UploadedImage {
  file: File;
  preview: string;
  url?: string;
}

// Type for service from Supabase
interface ServiceOption {
  id: string;
  name: string;
  category: 'service' | 'package' | 'monthly';
  site_category?: string;
  price_min: number | null;
  price_max: number | null;
}

const MAX_IMAGES = 10;

// All Bundled Packages (7 total)
const allPackages = [
  {
    id: "tune-up",
    icon: Wrench,
    name: "Basic Home Tune-Up",
    price: "$149",
    priceNote: "Mobile homes; for residential call for quote",
    tagline: "Perfect for quick home maintenance needs—essential upkeep.",
    highlights: [
      "Light bulb replacements",
      "Smoke detector battery changes/replace",
      "Filter replacements (AC/water)",
      "Door, Hinges & closet adjustments",
      "To-do list items and general help",
    ],
    fullDetails: [
      "Light bulbs replacement (included)",
      "Smoke detector battery swap or replacement",
      "Filter replacements (AC/water)",
      "Air vents cleaning & dusting",
      "Door, Hinges & closet adjustments",
      "To-do list items and general help",
    ],
    notes: [
      "Up to 4 bulbs included in price",
      "AC filter and smoke detector batteries included",
      "New smoke detectors available if needed",
    ],
    popular: true,
  },
  {
    id: "home-refresh-curb-appeal",
    icon: Sparkles,
    name: "Home Refresh & Curb Appeal",
    price: "$425–$575",
    priceNote: "Mobile homes; for residential call for quote",
    tagline: "Refresh your home's look and feel inside and out—boost comfort, appeal, and pride of ownership.",
    highlights: [
      "Pressure wash driveway/carport/patio",
      "Exterior window cleaning",
      "Touch-up paint (trim, house numbers)",
      "Light yard cleanup & maintenance",
    ],
    fullDetails: [
      "Light bulb replacement (included)",
      "Smoke detector battery swap or replacement",
      "Filter replacements (AC/water)",
      "Air vents cleaning & dusting",
      "Door & closet adjustments",
      "Pressure wash driveway/carport/patio/walkways",
      "Exterior window cleaning",
      "Touch-up paint (trim, house numbers)",
      "Light yard cleanup (weeding, edging, porch sweep)",
    ],
    notes: [
      "Up to 4 bulbs included in price",
      "AC filter and smoke detector batteries included",
      "New smoke detectors available if needed",
      "On-site assistance only; Can dispose of items/debris for a fee",
      "Client provides paint or we can provide/pickup paint for a small charge/fee",
    ],
    popular: false,
  },
  {
    id: "seasonal-storm-holiday",
    icon: Sun,
    name: "Seasonal Storm / Holiday Ready",
    price: "$450–$625",
    priceNote: "Mobile homes; for residential call for quote",
    tagline: "Protect your home from Storms with complete prep or let us handle your seasonal/holiday display setup.",
    highlights: [
      "Gutter cleaning & debris removal",
      "Exterior pressure wash",
      "Storm prep walkthrough & checklist",
      "Holiday lights & decorations setup",
    ],
    fullDetails: [
      {
        section: "Storm Prep", items: [
          "Gutter cleaning & debris removal",
          "Roof clearing & debris removal",
          "Seals & caulking (small areas)",
          "Exterior pressure wash (home, carport, driveway)",
          "Sandbag placement & tie-down securing",
          "Window/shutter storm prep",
          "Light yard debris cleanup",
          "Storm prep walkthrough & checklist",
        ]
      },
      {
        section: "Holiday Display Setup", items: [
          "Holiday lights & decorations installation/takedown",
          "Safe mounting, stringing, and securing",
        ]
      },
    ],
    notes: [
      "Roof leak repairs & UV-resistant coating available separately—contact for quote",
      "Client provides sandbags, shutters/wood, lights, and decorations",
      "Wood/sandbag delivery available for small fee",
      "Debris is trashed and bagged and curbed for pickup or can take/dispose for a fee",
    ],
    popular: false,
  },
  {
    id: "move-assist",
    icon: Home,
    name: "Move-In/Move-Out Assist",
    price: "$495–$795",
    priceNote: "Mobile homes; for residential call for quote",
    tagline: "Stress-free help during moves—Assistance for assembly, cleanup, and setup.",
    highlights: [
      "Furniture assembly assistance",
      "Light cleanup & organizing",
      "Minor drywall repairs & touch-up painting",
      "Tech setup (TV/remotes/devices)",
    ],
    fullDetails: [
      "Furniture assembly assistance",
      "Cleanup & organizing",
      "Minor repairs and touch-ups",
      "Painting (doors, trim, small areas)",
      "Tech setup (TV/remotes/devices)",
      "Lifting & moving assistance (on site only)",
      "Storage/closet organizing",
    ],
    notes: [
      "Paint for touch-ups/doors/etc provided by client",
      "We can provide/pickup paint for a small charge/fee",
      "On-site assistance only; Can dispose of items/debris for a fee",
    ],
    popular: false,
  },
  {
    id: "staging",
    icon: Camera,
    name: "Mobile Home Staging",
    price: "$345–$545",
    priceNote: "Mobile homes only; for residential call for quote",
    tagline: "Prepare your mobile home to sell quickly—cosmetic and functional enhancements.",
    highlights: [
      "Cosmetic touch-ups & paint",
      "Organizing & decluttering",
      "Exterior curb appeal refresh",
      "Optional: Photos/Video/Drone package",
    ],
    fullDetails: [
      "Cosmetic touch-ups & paint",
      "Organizing & decluttering",
      "Minor repairs (handles, hinges, drawer slides)",
      "Exterior curb appeal (pressure wash entry, clean windows, touch-up mailbox/numbers)",
      "Final walkthrough & staging recommendations",
    ],
    addOn: {
      name: "Photos/Video/Drone",
      price: "Starting at $195",
      note: "Media package can also be added to any other service—contact for pricing",
      items: [
        "25–35 professional photos",
        "30-second highlight video",
        "90-second walkthrough video",
        "Drone footage (exterior/park views)",
        "Delivery in 24–48 hours",
      ],
    },
    notes: [
      "Touch-up paint: client provides or available at cost",
    ],
    popular: false,
  },
  {
    id: "senior-safety-tech",
    icon: ShieldCheck,
    name: "Senior Safety & Tech Setup",
    price: "$445–$595",
    priceNote: "Mobile homes; for residential call for quote",
    tagline: "Make your home safer and smarter for independent living—Safety Audit, installs, and personalized training.",
    highlights: [
      "Home safety audit & solutions",
      "Grab bar installation (up to 2)",
      "Night lights & smoke alarms",
      "Smart doorbell/lock & device training",
    ],
    fullDetails: [
      {
        section: "Safety Upgrades", items: [
          "Home safety audit (trip hazards, lighting, accessibility)",
          "Anti-slip grip tape installation & solutions",
          "Night lights installed (we provide up to 4 LED lights/units)",
          "Smoke alarm battery swap/replacement",
          "Fire extinguisher check",
          "Grab bar installation (up to 2; will install up to 2 for package, extra $ per grab bar)",
        ]
      },
      {
        section: "Tech Help", items: [
          "Doorbells, Doorlocks, & Wifi Cameras installation",
          "Device training & setup for all installed tech",
        ]
      },
    ],
    notes: [
      "Includes installation of up to 2 grab bars (we supply at our cost or client's purchased)",
      "New smoke alarms available at additional cost",
      "Includes install of Doorbell(x1), Doorlocks(x1) and Wifi Cameras(x1), Actual parts/devices supplied by customer or available at cost",
      "Extra grab bars (more than 2) available at additional cost",
    ],
    popular: false,
  },
  {
    id: "neighbor-day",
    icon: Users,
    name: "Neighbor Group Package",
    price: "Save!",
    priceNote: "Call or text for group pricing and details",
    tagline: "When neighbors schedule service together, everyone gets a discount.",
    highlights: [
      "Discounted rates for groups",
      "Each home chooses their own services",
      "More neighbors = bigger savings",
      "Great for mobile home parks",
    ],
    fullDetails: [
      "The more neighbors who join, the bigger the savings!",
      "Each home can choose their own services based on what they need most",
      "Perfect for coordinating community maintenance days",
    ],
    notes: [
      "Call or text for group pricing and details",
    ],
    popular: false,
  },
];

// Monthly Subscription Plans
const monthlyPlans = [
  {
    icon: ShieldCheck,
    name: "Essential Care",
    price: "$149/month",
    duration: "1.5 hrs/visit",
    tagline: "Tech support, Safety checks, and Home care",
    highlights: [
      "Wellness check-in + family updates",
      "Tech help, Maintenance (AC filters, smoke alarm checks/replace, bulbs)",
      "Light cleaning / Safety checks (trips, leaks, hazards)",
    ],
    features: [
      "Tech help (TV, remote, phone, Wi-Fi)",
      "Smoke/CO detector testing + batteries",
      "Fire extinguisher check",
      "AC filter change",
      "Dryer lint cleaning & airflow check",
      "Light bulb replacement (up to 4)",
      "Secure loose handles, railings, grab bars",
      "Trip-hazard & safety checks",
      "Leak checks & home hazard check",
      "Fan & vent dusting",
      "Surface wiping throughout home",
      "Light organizing & tidy-up",
      "Heavy lifting help (furniture, boxes)",
      "Wellness check-in + family updates",
    ],
    popular: true,
    bestFor: "Seniors who want safety, tech & routine upkeep",
    isCustom: false,
  },
  {
    icon: Home,
    name: "Complete Home Care",
    price: "$229/month",
    duration: "2.5 hrs/visit",
    tagline: "All Essential Care services PLUS",
    highlights: [
      "Yard & garden cleanup (pet waste, weeds)",
      "Porch/walkway/carport blowing off debris",
      "Light gardening & plant care",
      "Exterior Home checks & gap sealing",
    ],
    features: [
      "Everything in Essential Care, PLUS:",
      "Yard & garden cleanup (pet waste, weeds)",
      "Watering plants & light garden care",
      "Porch/walkway/carport blowing off debris",
      "Exterior mobile home checks & gap sealing",
    ],
    popular: false,
    bestFor: "Seniors who want inside AND outside handled",
    isCustom: false,
  },
  {
    icon: Wrench,
    name: "Custom Monthly Plan",
    price: "You Build It!",
    duration: "Based on services",
    tagline: null,
    highlights: null,
    features: [
      "Pick your own services",
      "Same tasks each month",
      "Add or adjust anytime",
      "Only pay for what you need",
      "We work with any budget! Contact us for a free quote",
    ],
    popular: false,
    bestFor: "Your unique needs",
    isCustom: true,
  },
];

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
      "Painting / Sanding / Refinishing",
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
      "Mobile Home Roof Coating(UV - Reflective & Waterproof",
    ],
  },
  {
    icon: Heart,
    title: "Safety & Senior Support, Tech Help",
    services: [
      "Wellness Check-ins & Snowbird Monitoring",
      "Smart Devices - Thermostat, Doorbell, Doorlock, Wifi Camera",
      "Wifi Extender / Mesh Setup",
      "Tech Troubleshooting / Help",
      "Streaming / TV App / Remote Setup",
      "Phone / Tablet / Device Help",
      "Free Scam & Fraud Awareness Training",
      "Home Hazard Audit (Trip/Elec/Fire)",
      "Handrails / Fall / Anti-Slip Solutions",
      "Non-Slip Mats / Night Light Setup",
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

  // Overlay states for packages and plans popups
  const [showPackagesOverlay, setShowPackagesOverlay] = useState(false);
  const [showPlansOverlay, setShowPlansOverlay] = useState(false);
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [showEssentialPlan, setShowEssentialPlan] = useState(false);
  const [showCompletePlan, setShowCompletePlan] = useState(false);
  const [showSuppliesInfo, setShowSuppliesInfo] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<typeof allPackages[0] | null>(null);

  // Custom plan builder state
  const [allSupabaseServices, setAllSupabaseServices] = useState<ServiceOption[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isFromScheduler, setIsFromScheduler] = useState(false);
  const [customPlanNotes, setCustomPlanNotes] = useState('');
  const [customPlanImages, setCustomPlanImages] = useState<UploadedImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emailError, setEmailError] = useState('');
  const [quoteName, setQuoteName] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteEmail, setQuoteEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch services from Supabase on mount
  useEffect(() => {
    const loadServices = async () => {
      const { data } = await getServicesForBooking();
      if (data) {
        setAllSupabaseServices(data);
      }
    };
    loadServices();
  }, []);

  // Listen for event to open custom plan builder from other components
  useEffect(() => {
    const handleOpenBuilder = () => {
      setIsFromScheduler(false);
      setShowCustomBuilder(true);
    };
    const handleOpenBuilderFromScheduler = () => {
      setIsFromScheduler(true);
      setShowCustomBuilder(true);
    };
    window.addEventListener('openCustomPlanBuilder', handleOpenBuilder);
    window.addEventListener('openCustomPlanBuilderForBooking', handleOpenBuilderFromScheduler);
    return () => {
      window.removeEventListener('openCustomPlanBuilder', handleOpenBuilder);
      window.removeEventListener('openCustomPlanBuilderForBooking', handleOpenBuilderFromScheduler);
    };
  }, []);

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES - customPlanImages.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    const newImages: UploadedImage[] = filesToAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setCustomPlanImages(prev => [...prev, ...newImages]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setCustomPlanImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestQuote = async () => {
    // Validate required fields
    if (!quoteName.trim()) return;
    if (!quoteEmail.trim() || !validateEmail(quoteEmail.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');

    // Must have either notes or images
    if (!customPlanNotes.trim() && customPlanImages.length === 0) {
      return;
    }

    setIsSubmitting(true);

    // Upload images if any
    let imageUrls: string[] = [];
    if (customPlanImages.length > 0) {
      setUploadingImages(true);
      for (const img of customPlanImages) {
        const { data } = await uploadBookingImage(img.file);
        if (data) {
          imageUrls.push(data.url);
        }
      }
      setUploadingImages(false);
    }

    // Create message with notes and image count
    let messageAddendum = '';
    if (customPlanNotes.trim()) {
      messageAddendum += `\n\nCustomer Request:\n${customPlanNotes.trim()}`;
    }
    if (imageUrls.length > 0) {
      messageAddendum += `\n\n${imageUrls.length} photo(s) attached:\n${imageUrls.join('\n')}`;
    }

    const { error } = await submitQuoteRequest({
      name: quoteName.trim(),
      email: quoteEmail.trim(),
      phone: quotePhone.trim() || undefined,
      services: ['Custom Monthly Plan Request'],
      estimatedTotal: 0,
      estimatedTime: 'TBD' + messageAddendum
    });

    setIsSubmitting(false);

    if (!error) {
      setSubmitted(true);
      setTimeout(() => {
        setShowCustomBuilder(false);
        setSubmitted(false);
        setSelectedServices([]);
        setCustomPlanNotes('');
        setCustomPlanImages([]);
        setQuoteName('');
        setQuotePhone('');
        setQuoteEmail('');
        setEmailError('');
      }, 2000);
    }
  };

  return (
    <section id="services" className="py-section px-4 bg-secondary">
      <div className="container max-w-4xl mx-auto">
        <h2 className="font-heading text-heading-md text-center text-foreground mb-4">
          Services We Provide
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          No surprises, no upselling. All work stays within safe, appropriate limits — we handle the jobs others overlook, big or small. <span className="font-semibold text-foreground">We work with all budgets — contact us for a Free quote.</span>
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
                      <span className={`text-sm leading-snug ${service.includes('I Just Need an Extra Hand') ? 'font-semibold text-foreground' : ''}`}>{service}</span>
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

        {/* Who We Serve - Tab Selection */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-primary font-semibold mb-2">
              <Users className="w-5 h-5" />
              Who We Serve
            </span>
            <h2 className="font-heading text-heading-md text-foreground mb-2">
              Services for Every Property Type
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select your property type to see available packages and plans
            </p>
          </div>

          <Tabs defaultValue="mobile-home" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1">
              <TabsTrigger value="residential" className="flex items-center gap-2 py-3 text-sm sm:text-base data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <HomeIcon className="w-4 h-4 hidden sm:block" />
                <span>Residential</span>
              </TabsTrigger>
              <TabsTrigger value="mobile-home" className="flex items-center gap-2 py-3 text-sm sm:text-base data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Home className="w-4 h-4 hidden sm:block" />
                <span>Mobile Homes</span>
              </TabsTrigger>
              <TabsTrigger value="senior" className="flex items-center gap-2 py-3 text-sm sm:text-base data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <UserCheck className="w-4 h-4 hidden sm:block" />
                <span>Senior Living</span>
              </TabsTrigger>
              <TabsTrigger value="rental" className="flex items-center gap-2 py-3 text-sm sm:text-base data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Building2 className="w-4 h-4 hidden sm:block" />
                <span>Rental Properties</span>
              </TabsTrigger>
            </TabsList>

            {/* Mobile Home Communities Tab - has packages/plans buttons */}
            <TabsContent value="mobile-home" className="mt-0">
              <div className="bg-card rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl text-foreground mb-2">
                  Mobile & Manufactured Homes
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Special packages designed for mobile home communities. Clear pricing, bundled savings, and monthly care plans.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => setShowPackagesOverlay(true)} className="gap-2 px-5 py-2.5">
                    <Star className="w-5 h-5" />
                    View Our Packages
                  </Button>
                  <Button variant="outline" onClick={() => setShowPlansOverlay(true)} className="gap-2 px-5 py-2.5">
                    <Calendar className="w-5 h-5" />
                    View Monthly Plans
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Rental Properties Tab - contact for quote */}
            <TabsContent value="rental" className="mt-0">
              <div className="bg-card rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl text-foreground mb-2">
                  Rental Properties
                </h3>
                <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                  We serve rental turnovers, property management companies, and landlords.
                </p>
                <p className="text-foreground font-medium mb-6">
                  Contact us for a custom quote tailored to your property needs.
                </p>
                <Button size="lg" asChild>
                  <a href="#contact" className="gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Us for Free Quote
                  </a>
                </Button>
              </div>
            </TabsContent>

            {/* Residential Tab - contact for quote */}
            <TabsContent value="residential" className="mt-0">
              <div className="bg-card rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HomeIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl text-foreground mb-2">
                  Residential Homes
                </h3>
                <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                  We handle residential home repairs, maintenance, and projects of all sizes.
                </p>
                <p className="text-foreground font-medium mb-6">
                  Contact us for a custom quote tailored to your home.
                </p>
                <Button size="lg" asChild>
                  <a href="#contact" className="gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Us for Free Quote
                  </a>
                </Button>
              </div>
            </TabsContent>

            {/* Senior Living Tab - contact for quote */}
            <TabsContent value="senior" className="mt-0">
              <div className="bg-card rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl text-foreground mb-2">
                  Senior & Assisted Living
                </h3>
                <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                  Senior-friendly services for assisted living facilities and independent seniors.
                </p>
                <p className="text-foreground font-medium mb-6">
                  Contact us for a custom quote with senior discounts.
                </p>
                <Button size="lg" asChild>
                  <a href="#contact" className="gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Us for Free Quote
                  </a>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Custom Plan Builder Modal */}
      <Dialog open={showCustomBuilder} onOpenChange={(open) => {
        setShowCustomBuilder(open);
        if (!open) {
          setEmailError('');
        }
      }}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <Wrench className="w-5 h-5 text-accent" />
              Build Your Custom Monthly Plan
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Tell us what you need - we'll create a custom quote for you
            </p>
          </DialogHeader>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-heading text-lg text-foreground">
                Quote Request Sent!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                We'll get back to you soon with your custom quote.
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto min-h-[200px] space-y-4 pr-1">
                {/* Services Needed Section */}
                <div>
                  <Label className="text-sm font-medium mb-1 block">
                    What monthly services do you need?
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Examples: yard cleanup, house cleaning, gutter cleaning, pressure washing, filter changes, light bulbs, appliance cleaning, tech help
                  </p>
                  <Textarea
                    placeholder="Tell us what you need help with..."
                    value={customPlanNotes}
                    onChange={(e) => setCustomPlanNotes(e.target.value)}
                    rows={5}
                    className="resize-none text-base"
                  />
                  <a
                    href="#contact"
                    onClick={() => setShowCustomBuilder(false)}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm mt-2"
                  >
                    <Phone className="w-4 h-4" />
                    Prefer to talk? Contact us directly
                  </a>
                </div>

                {/* Photo Upload Section */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Add photos (optional)
                  </Label>

                  {/* Image Preview Grid */}
                  {customPlanImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {customPlanImages.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                          <img
                            src={img.preview}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  {customPlanImages.length < MAX_IMAGES && (
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <ImagePlus className="w-4 h-4" />
                        Add Photos
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.capture = 'environment';
                            fileInputRef.current.click();
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Take Photo
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-1">
                    {customPlanImages.length}/{MAX_IMAGES} photos
                  </p>
                </div>
              </div>

              {/* Contact Form - Always visible at bottom */}
              <div className="border-t pt-2 space-y-2 flex-shrink-0 bg-background">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Name *"
                    value={quoteName}
                    onChange={(e) => setQuoteName(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Input
                    placeholder="Phone"
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Email *"
                    type="email"
                    value={quoteEmail}
                    onChange={(e) => {
                      setQuoteEmail(e.target.value);
                      setEmailError('');
                    }}
                    className={`h-9 text-sm ${emailError ? 'border-red-500' : ''}`}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 mt-0.5">{emailError}</p>
                  )}
                </div>
                <Button
                  className="w-full h-10 bg-accent hover:bg-accent/90"
                  onClick={handleRequestQuote}
                  disabled={!quoteName.trim() || !quoteEmail.trim() || isSubmitting || uploadingImages}
                >
                  {isSubmitting || uploadingImages ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {uploadingImages ? 'Uploading...' : isSubmitting ? 'Sending...' : 'Request Quote'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Essential Care Plan Modal */}
      <Dialog open={showEssentialPlan} onOpenChange={setShowEssentialPlan}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Essential Care Plan
            </DialogTitle>
            <p className="text-primary font-heading text-xl">$149/month</p>
            <p className="text-xs text-accent font-medium">
              Best for: Seniors who want safety, tech & routine upkeep
            </p>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto pr-2">
            <ul className="space-y-2.5 py-2">
              {monthlyPlans[0].features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-foreground text-sm"
                >
                  <span className="mt-0.5 text-sm text-primary font-bold">✓</span>
                  <span className="leading-relaxed font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-green-600 font-medium mt-3 pt-3 border-t border-border">
              ✓ Batteries, filters & bulbs included
            </p>
          </div>

          <div className="pt-3 border-t border-border">
            <Button
              onClick={() => setShowEssentialPlan(false)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Got It
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete Home Care Plan Modal */}
      <Dialog open={showCompletePlan} onOpenChange={setShowCompletePlan}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Complete Home Care Plan
            </DialogTitle>
            <p className="text-primary font-heading text-xl">$229/month</p>
            <p className="text-xs text-accent font-medium">
              Best for: Seniors who want inside AND outside handled
            </p>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto pr-2">
            <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 mb-4">
              <p className="text-sm font-bold text-primary text-center">
                ✨ Everything in Essential Care, PLUS:
              </p>
            </div>

            {/* Essential Care features */}
            <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Essential Care Services:</p>
            <ul className="space-y-2 mb-4">
              {monthlyPlans[0].features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-foreground text-sm"
                >
                  <span className="mt-0.5 text-sm text-primary font-bold">✓</span>
                  <span className="leading-relaxed font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Additional Complete Care features */}
            <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Plus Outdoor Services:</p>
            <ul className="space-y-2">
              {monthlyPlans[1].features.slice(1).map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-foreground text-sm"
                >
                  <span className="mt-0.5 text-sm text-primary font-bold">✓</span>
                  <span className="leading-relaxed font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <p className="text-xs text-green-600 font-medium mt-3 pt-3 border-t border-border">
              ✓ Batteries, filters & bulbs included
            </p>
          </div>

          <div className="pt-3 border-t border-border">
            <Button
              onClick={() => setShowCompletePlan(false)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Got It
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Supplies Info Popup */}
      <Dialog open={showSuppliesInfo} onOpenChange={setShowSuppliesInfo}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">
              What's Included with Plans
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span className="text-sm">Smoke alarm batteries replaced</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span className="text-sm">AC filters changed</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span className="text-sm">Up to 4 light bulbs included</span>
            </div>
          </div>
          <Button
            onClick={() => setShowSuppliesInfo(false)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Got It
          </Button>
        </DialogContent>
      </Dialog>

      {/* Packages Overlay Popup */}
      <Dialog open={showPackagesOverlay} onOpenChange={setShowPackagesOverlay}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              One-Time Bundled Specials
            </DialogTitle>
            <p className="text-muted-foreground">
              Save time and money with our bundled services <span className="font-semibold text-foreground">for mobile & manufactured homes</span>. Clear pricing, no surprises.
            </p>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-4">
            {/* Desktop Grid - 3 columns */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 py-4">
              {allPackages.map((pkg, index) => (
                <Card
                  key={index}
                  className={`relative border-2 transition-shadow hover:shadow-lg h-full flex flex-col ${pkg.popular
                    ? 'border-accent shadow-md'
                    : 'border-border'
                    }`}
                >
                  {pkg.popular && (
                    <span className="absolute z-10 -top-2.5 left-4 bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">
                      Popular
                    </span>
                  )}
                  <CardHeader className="p-4 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${pkg.popular ? 'bg-accent/10' : 'bg-secondary'
                        }`}>
                        <pkg.icon className={`w-5 h-5 ${pkg.popular ? 'text-accent' : 'text-primary'
                          }`} />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="font-heading text-sm leading-tight">
                          {pkg.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex flex-col flex-1">
                    <div className="mb-2 text-center">
                      <span className="font-heading text-lg text-primary">
                        {pkg.price}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center min-h-[3.5rem]">
                      <p className="text-muted-foreground text-xs leading-relaxed text-center w-full">
                        {pkg.tagline}
                      </p>
                    </div>
                    <div className="pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBundle(pkg)}
                        className="w-full text-primary border-primary hover:bg-primary/10 text-xs"
                      >
                        View What's Included
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mobile - Stacked cards */}
            <div className="md:hidden space-y-3 py-4">
              {allPackages.map((pkg, index) => (
                <Card
                  key={index}
                  className={`relative border-2 transition-shadow hover:shadow-lg ${pkg.popular
                    ? 'border-accent shadow-md'
                    : 'border-border'
                    }`}
                >
                  {pkg.popular && (
                    <span className="absolute z-10 -top-2.5 left-4 bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">
                      Popular
                    </span>
                  )}
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${pkg.popular ? 'bg-accent/10' : 'bg-secondary'
                      }`}>
                      <pkg.icon className={`w-6 h-6 ${pkg.popular ? 'text-accent' : 'text-primary'
                        }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-base leading-tight">{pkg.name}</p>
                      <p className="font-heading text-lg text-primary">{pkg.price}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBundle(pkg)}
                      className="text-primary border-primary hover:bg-primary/10 flex-shrink-0"
                    >
                      Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Residential quote link */}
            <a
              href="#contact"
              onClick={() => setShowPackagesOverlay(false)}
              className="block text-center text-sm text-primary font-medium mt-4 hover:underline cursor-pointer"
            >
              Mobile homes; for residential contact us for a quote
            </a>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Monthly Plans Overlay Popup */}
      <Dialog open={showPlansOverlay} onOpenChange={setShowPlansOverlay}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Monthly Plans
            </DialogTitle>
            <p className="text-muted-foreground">
              One visit per month. Priority scheduling. Cancel anytime.
            </p>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
              {monthlyPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative border-2 transition-shadow hover:shadow-lg bg-card h-full flex flex-col ${plan.popular
                    ? 'border-primary shadow-md'
                    : plan.isCustom
                      ? 'border-accent/50 border-dashed'
                      : 'border-border'
                    }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-6 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      Recommended
                    </span>
                  )}
                  <CardHeader className="p-4 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-primary/10' : plan.isCustom ? 'bg-accent/10' : 'bg-secondary'
                        }`}>
                        <plan.icon className={`w-5 h-5 ${plan.isCustom ? 'text-accent' : 'text-primary'
                          }`} />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="font-heading text-base leading-tight">
                          {plan.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex flex-col flex-1">
                    <div className="mb-3 text-center">
                      <span className={`font-heading text-xl ${plan.isCustom ? 'text-accent' : 'text-primary'}`}>
                        {plan.price}
                      </span>
                    </div>
                    {/* For Essential/Complete: show tagline + highlights */}
                    {plan.tagline && plan.highlights ? (
                      <>
                        <p className="text-sm text-foreground font-bold mb-3 text-center">
                          {plan.name === "Complete Home Care" ? (
                            <>All Essential Care services PLUS</>
                          ) : (
                            <>{plan.tagline}</>
                          )}
                        </p>
                        <ul className="space-y-1.5">
                          {plan.highlights.map((highlight, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-foreground text-sm"
                            >
                              <span className="mt-0.5 text-sm text-primary">✓</span>
                              <span className="leading-relaxed">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      /* For Custom: first item as tagline, rest as checkmark list */
                      <>
                        <p className="text-sm text-foreground font-bold mb-3 text-center">
                          {plan.features[0]}
                        </p>
                        <ul className="space-y-1.5 mt-4">
                          {plan.features.slice(1).map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="flex items-start gap-2 text-foreground text-sm"
                            >
                              <span className="mt-0.5 text-sm text-accent">✓</span>
                              <span className="leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Button - pushed to bottom */}
                    <div className="mt-auto pt-3">
                      {plan.name === "Essential Care" && (
                        <Button
                          variant="outline"
                          onClick={() => setShowEssentialPlan(true)}
                          className="w-full text-primary border-primary hover:bg-primary/10"
                        >
                          View What's Included
                        </Button>
                      )}

                      {plan.name === "Complete Home Care" && (
                        <Button
                          variant="outline"
                          onClick={() => setShowCompletePlan(true)}
                          className="w-full text-primary border-primary hover:bg-primary/10"
                        >
                          View What's Included
                        </Button>
                      )}

                      {plan.isCustom && (
                        <Button
                          onClick={() => setShowCustomBuilder(true)}
                          className="w-full bg-accent hover:bg-accent/90"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Build Your Plan
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Supplies included note - centered below all plans */}
            <button
              onClick={() => setShowSuppliesInfo(true)}
              className="w-full text-center text-sm text-green-600 font-medium mt-2 hover:underline cursor-pointer"
            >
              ✓ Batteries, filters & bulbs included with plans *
            </button>

            {/* Residential quote link */}
            <a
              href="#contact"
              onClick={() => setShowPlansOverlay(false)}
              className="block text-center text-sm text-primary font-medium mt-2 hover:underline cursor-pointer"
            >
              Mobile homes; for residential contact us for a quote
            </a>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Bundle Details Overlay */}
      <Dialog open={!!selectedBundle} onOpenChange={(open) => !open && setSelectedBundle(null)}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col overflow-hidden">
          {selectedBundle && (
            <>
              <DialogHeader className="flex-shrink-0 pb-2">
                <DialogTitle className="font-heading text-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <selectedBundle.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span>{selectedBundle.name}</span>
                </DialogTitle>
                <p className="text-primary font-heading text-2xl font-bold">{selectedBundle.price}</p>
                {selectedBundle.priceNote && (
                  <p className="text-sm text-muted-foreground">
                    {selectedBundle.priceNote}
                  </p>
                )}
              </DialogHeader>

              <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                <div className="space-y-5 py-3">
                  {/* Tagline */}
                  <p className="text-base text-foreground leading-relaxed font-medium">
                    {selectedBundle.tagline}
                  </p>

                  {/* Full Details */}
                  {Array.isArray(selectedBundle.fullDetails) && selectedBundle.fullDetails.length > 0 && (
                    <div className="space-y-4">
                      {/* Check if it's sectioned or flat list */}
                      {typeof selectedBundle.fullDetails[0] === 'string' ? (
                        <div className="bg-secondary/50 rounded-lg p-4">
                          <p className="text-sm text-primary font-bold mb-3 uppercase tracking-wide">
                            What's Included
                          </p>
                          <ul className="space-y-2.5">
                            {(selectedBundle.fullDetails as string[]).map((item, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-foreground">
                                <span className="mt-0.5 text-base text-primary font-bold flex-shrink-0">✓</span>
                                <span className="text-base leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        // Sectioned list
                        (selectedBundle.fullDetails as Array<{ section: string; items: string[] }>).map((section, sIdx) => (
                          <div key={sIdx} className="bg-secondary/50 rounded-lg p-4">
                            <p className="text-sm text-primary font-bold mb-3 uppercase tracking-wide">
                              {section.section}
                            </p>
                            <ul className="space-y-2.5">
                              {section.items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-foreground">
                                  <span className="mt-0.5 text-base text-primary font-bold flex-shrink-0">✓</span>
                                  <span className="text-base leading-relaxed">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Add-on section (for staging) */}
                  {selectedBundle.addOn && (
                    <div className="bg-accent/10 border-2 border-accent/30 rounded-lg p-4">
                      <p className="text-base font-bold text-accent mb-2">
                        Optional Add-On: {selectedBundle.addOn.name}
                      </p>
                      <p className="text-sm text-foreground mb-3">
                        {selectedBundle.addOn.price} — {selectedBundle.addOn.note}
                      </p>
                      <ul className="space-y-2">
                        {selectedBundle.addOn.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-foreground">
                            <span className="mt-0.5 text-base text-accent font-bold flex-shrink-0">✓</span>
                            <span className="text-base leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes / Fine Print */}
                  {selectedBundle.notes && selectedBundle.notes.length > 0 && (
                    <div className="border-t-2 border-border pt-4 mt-4">
                      <p className="text-sm text-primary font-bold mb-3 uppercase tracking-wide">
                        What's Included / Notes
                      </p>
                      <ul className="space-y-2">
                        {selectedBundle.notes.map((note, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-foreground">
                            <span className="mt-0.5 text-base text-green-600 font-bold flex-shrink-0">*</span>
                            <span className="text-sm leading-relaxed">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex-shrink-0">
                <Button
                  onClick={() => setSelectedBundle(null)}
                  className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
                >
                  Got It
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ServicesSection;
