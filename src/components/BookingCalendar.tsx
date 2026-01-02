import { useState, useEffect, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  Wrench,
  Package,
  CalendarCheck,
  Send,
  Loader2,
  Info,
  MapPin,
  User,
  Camera,
  X,
  ImagePlus
} from "lucide-react";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { 
  DEFAULT_TIME_SLOTS, 
  SERVICE_OPTIONS, 
  createBooking,
  getAvailableTimeSlots,
  trackEvent,
  uploadBookingImage,
  type TimeSlot 
} from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

// Service details for info popovers (Individual Services)
const SERVICE_DETAILS: Record<string, { features: string[] }> = {
  'assembly': {
    features: [
      'Furniture Assembly — Beds, desks, shelves, IKEA/Wayfair ($50–$150)',
      'TV & Wall Mounting — TVs, shelves, mirrors, soundbars ($75–$200)',
      'Appliance Hookups — Washers, dryers, microwaves ($80–$200)'
    ]
  },
  'tech': {
    features: [
      'Smart Device Setup — Doorbells, cameras, lights, Wi-Fi ($75–$200)',
      'Streaming & Remote Help — TV apps, phones, troubleshooting ($50–$150)',
      'Scam Awareness Tips — Stay safe online'
    ]
  },
  'repairs': {
    features: [
      'Door & Window Adjustments — Squeaks, alignment, screens ($50–$200)',
      'Minor Repairs — Hinges, caulking, patch small holes ($50–$150)',
      'Skirting & Exterior Fixes — Vinyl skirting, mailbox, rails ($80–$200)',
      'Touch-Up Painting — Walls, trim, doors ($150–$500)'
    ]
  },
  'safety': {
    features: [
      'Grab Bars & Fall Prevention — Non-slip mats, night lights ($100–$300)',
      'Light Bulb, Battery & Filter Changes — Hard-to-reach ($40–$100)',
      'Errands & Personal Assistance — Pharmacy/store runs ($30–$100/hr)',
      'Wait-at-Home Help — Wait for contractors/deliveries ($50–$150)'
    ]
  },
  'outdoor': {
    features: [
      'Window & Pressure Washing — Windows, driveways, patios ($80–$300)',
      'Gutter Cleaning & Awning Care — Single-story gutters ($100–$250)',
      'Light Yard Cleanup — Trimming, weeding, mulch ($100–$300)',
      'Storm & Holiday Prep — Hurricane prep, holiday lights ($100–$300)'
    ]
  },
  'organizing': {
    features: [
      'Interior & Garage Organizing — Closets, kitchens, sheds ($75–$500)',
      'Junk Sorting & Valuation — Help price items for sales',
      'Bicycle & Scooter Tune-Ups — Lube, inflate, adjust ($40–$100)',
      'Pet Gate & Enclosure Setup — Non-permanent installs ($80–$150)'
    ]
  }
};

// Package details for info popovers
const PACKAGE_DETAILS: Record<string, { price: string; duration: string; features: string[]; bestFor?: string }> = {
  'tune-up': {
    price: '$150–$250',
    duration: '2 hours',
    features: ['Light bulb replacement', 'Battery changes (smoke detectors, remotes)', 'Filter replacements (AC/water)', 'Door tweaks & adjustments']
  },
  'seasonal': {
    price: '$200–$350',
    duration: '3 hours',
    features: ['Gutter cleaning', 'Seals & caulking check', 'Skirting wash', 'Storm or hurricane prep']
  },
  'move-assist': {
    price: '$200–$600',
    duration: 'Half day',
    features: ['Furniture setup & assembly', 'Light cleanup', 'Minor fixes & touch-ups', 'Organizing help']
  },
  'peace-of-mind': {
    price: '$99–$149/month',
    duration: '1–1.5 hrs/visit',
    features: ['Monthly safety walkthrough', 'Check for leaks, doors, detectors', 'Small adjustments included', 'Peace of mind for you & family'],
    bestFor: 'Seniors living alone'
  },
  'tech-support': {
    price: '$119–$169/month',
    duration: '1–2 hrs/visit',
    features: ['Tech help (TV, phone, Wi-Fi)', 'Scam awareness tips', 'Minor home fixes included', 'Patient, friendly teaching'],
    bestFor: 'Tech-frustrated residents'
  },
  'helper-plan': {
    price: '$139–$199/month',
    duration: '1–2 hrs/visit',
    features: ['Errands & store runs', 'Mail sorting & admin help', 'Organizing assistance', 'Wait for deliveries/contractors'],
    bestFor: 'Busy or mobility-limited'
  }
};

type BookingStep = 'datetime' | 'services' | 'details' | 'confirm';

interface UploadedImage {
  file: File;
  preview: string;
  uploading?: boolean;
  url?: string;
}

interface BookingData {
  date: Date | undefined;
  timeSlot: string;
  timeLabel: string;
  services: string[];
  customNotes: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  community: string;
  notes: string;
  images: UploadedImage[];
}

const MAX_IMAGES = 10;

const BookingCalendar = () => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('datetime');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>(DEFAULT_TIME_SLOTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeSlotsRef = useRef<HTMLDivElement>(null);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    date: undefined,
    timeSlot: '',
    timeLabel: '',
    services: [],
    customNotes: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    community: '',
    notes: '',
    images: []
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch available time slots when date changes
  useEffect(() => {
    if (bookingData.date) {
      setIsLoading(true);
      const dateStr = format(bookingData.date, 'yyyy-MM-dd');
      getAvailableTimeSlots(dateStr)
        .then(slots => {
          setAvailableSlots(slots);
          setIsLoading(false);
          // Small scroll to reveal time slots after they load
          setTimeout(() => {
            timeSlotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        })
        .catch(() => {
          setAvailableSlots(DEFAULT_TIME_SLOTS);
          setIsLoading(false);
        });
    }
  }, [bookingData.date]);

  const steps: { id: BookingStep; label: string; icon: React.ReactNode }[] = [
    { id: 'datetime', label: 'Date & Time', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'services', label: 'Services', icon: <Wrench className="w-5 h-5" /> },
    { id: 'details', label: 'Your Info', icon: <User className="w-5 h-5" /> },
    { id: 'confirm', label: 'Confirm', icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const canProceed = () => {
    switch (currentStep) {
      case 'datetime': return bookingData.date !== undefined && bookingData.timeSlot !== '';
      case 'services': return bookingData.services.length > 0 || bookingData.customNotes.trim() !== '';
      case 'details': return bookingData.name && bookingData.email && bookingData.phone && bookingData.address;
      default: return true;
    }
  };

  const scrollToTop = () => {
    // Scroll the card into view with offset so step indicator and header are visible
    setTimeout(() => {
      if (cardRef.current) {
        const cardTop = cardRef.current.getBoundingClientRect().top + window.scrollY;
        // Scroll to 100px above the card to show the full header and step indicator
        window.scrollTo({ top: cardTop - 100, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
      scrollToTop();
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
      scrollToTop();
    }
  };

  const handleSubmit = async () => {
    if (!bookingData.date) return;
    
    setIsSubmitting(true);
    
    // Upload images first
    let imageUrls: string[] = [];
    if (bookingData.images.length > 0) {
      setUploadingImages(true);
      imageUrls = await uploadAllImages();
      setUploadingImages(false);
    }
    
    // Combine custom notes with regular notes
    const allNotes = [bookingData.customNotes, bookingData.notes].filter(Boolean).join('\n\n');
    
    const bookingPayload = {
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      date: format(bookingData.date, 'yyyy-MM-dd'),
      time_slot: bookingData.timeSlot,
      services: bookingData.services,
      notes: allNotes || undefined,
      address: bookingData.address,
      community: bookingData.community || undefined,
      images: imageUrls
    };

    const { data, error } = await createBooking(bookingPayload);

    setIsSubmitting(false);

    if (error) {
      console.error('Booking error:', error);
      console.log('Booking data attempted:', bookingPayload);
    }

    if (data) {
      console.log('Booking created successfully:', data.booking);
      console.log('Client:', data.client);
      
      trackEvent('booking_completed', {
        booking_id: data.booking.id,
        services: bookingData.services,
        date: bookingPayload.date
      }, data.client.id);
    }
    
    setBookingComplete(true);
    toast({
      title: "Booking Request Sent! ✓",
      description: "We'll call you to confirm your appointment.",
    });
  };

  const handleServiceToggle = (serviceId: string) => {
    setBookingData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES - bookingData.images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    const newImages: UploadedImage[] = filesToAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setBookingData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setBookingData(prev => {
      const newImages = [...prev.images];
      // Revoke object URL to prevent memory leak
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const uploadAllImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const img of bookingData.images) {
      if (img.url) {
        // Already uploaded
        uploadedUrls.push(img.url);
      } else {
        const { data } = await uploadBookingImage(img.file);
        if (data) {
          uploadedUrls.push(data.url);
        }
      }
    }
    
    return uploadedUrls;
  };

  // Info popover component for packages/plans
  // Info popover that works for both services and packages
  const InfoPopover = ({ serviceId, type = 'package' }: { serviceId: string; type?: 'service' | 'package' }) => {
    const packageDetails = PACKAGE_DETAILS[serviceId];
    const serviceDetails = SERVICE_DETAILS[serviceId];
    const details = type === 'service' ? serviceDetails : packageDetails;
    
    if (!details) return null;
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button 
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm font-medium transition-all border border-primary/30 hover:border-primary/50"
            onClick={(e) => e.stopPropagation()}
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Details</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" side="top">
          <div className="space-y-3">
            {'price' in details && 'duration' in details && (
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-heading font-semibold text-primary">{details.price}</span>
                <span className="text-sm text-muted-foreground">{details.duration}</span>
              </div>
            )}
            {'bestFor' in details && details.bestFor && (
              <p className="text-sm text-accent font-medium">Best for: {details.bestFor}</p>
            )}
            <div>
              {type === 'package' && (
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">What's included:</p>
              )}
              <ul className="space-y-2">
                {details.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary mt-0.5 font-bold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  if (bookingComplete) {
    return (
      <Card className="max-w-2xl mx-auto border-2 border-primary/30 bg-card">
        <CardContent className="p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarCheck className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-heading text-heading-md text-foreground mb-4">
            Booking Request Received!
          </h3>
          <p className="text-xl text-muted-foreground mb-6">
            We'll call you at <strong className="text-foreground">{bookingData.phone}</strong> to confirm
          </p>
          <div className="bg-secondary/50 rounded-xl p-6 mb-6 text-left">
            <h4 className="font-heading text-lg text-foreground mb-3">Your Appointment Details:</h4>
            <ul className="space-y-2 text-lg">
              <li><strong>Date:</strong> {bookingData.date && format(bookingData.date, 'EEEE, MMMM d, yyyy')}</li>
              <li><strong>Time:</strong> {bookingData.timeLabel}</li>
              <li><strong>Address:</strong> {bookingData.address}</li>
              {bookingData.services.length > 0 && (
                <li><strong>Services:</strong> {bookingData.services.map(s => 
                  SERVICE_OPTIONS.find(opt => opt.id === s)?.label
                ).join(', ')}</li>
              )}
            </ul>
          </div>
          <Button 
            onClick={() => {
              setBookingComplete(false);
              setCurrentStep('datetime');
              setBookingData({
                date: undefined,
                timeSlot: '',
                timeLabel: '',
                services: [],
                customNotes: '',
                name: '',
                email: '',
                phone: '',
                address: '',
                community: '',
                notes: '',
                images: []
              });
            }}
            variant="outline"
            size="lg"
            className="text-lg"
          >
            Book Another Appointment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={cardRef} className="w-full border-2 border-border bg-card overflow-hidden">
      {/* Progress Steps - Desktop */}
      <div className="hidden md:flex items-center justify-between bg-secondary/50 px-6 py-4 border-b border-border">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`flex items-center gap-2 ${
              index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              index < currentStepIndex 
                ? 'bg-primary text-primary-foreground'
                : index === currentStepIndex
                  ? 'bg-primary/20 text-primary border-2 border-primary'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {index < currentStepIndex ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
            </div>
            <span className={`font-medium ${index === currentStepIndex ? 'text-foreground' : ''}`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${
                index < currentStepIndex ? 'bg-primary' : 'bg-border'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Progress Steps - Mobile */}
      <div className="md:hidden bg-secondary/50 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step {currentStepIndex + 1} of {steps.length}</span>
          <span className="font-medium text-foreground">{steps[currentStepIndex].label}</span>
        </div>
        <div className="flex gap-1">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 flex-1 rounded-full ${
                index <= currentStepIndex ? 'bg-primary' : 'bg-border'
              }`} 
            />
          ))}
        </div>
      </div>

      <CardContent className="p-4 sm:p-6 md:p-8">
        {/* Step 1: Date & Time Selection (Combined) */}
        {currentStep === 'datetime' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-heading text-heading-sm text-foreground mb-2">
                Pick a Date & Time
              </h3>
              <p className="text-lg text-muted-foreground">
                Select when you'd like us to come by
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
              {/* Calendar */}
              <div className="flex justify-center overflow-x-auto">
                <Calendar
                  mode="single"
                  selected={bookingData.date}
                  onSelect={(date) => setBookingData(prev => ({ ...prev, date, timeSlot: '', timeLabel: '' }))}
                  disabled={(date) => isBefore(date, startOfToday()) || isBefore(addDays(new Date(), 60), date)}
                  className="rounded-xl border-2 border-border p-2 sm:p-4 bg-background pointer-events-auto w-full max-w-[100%] sm:max-w-[360px]"
                  classNames={{
                    months: "flex flex-col space-y-4",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-base sm:text-lg font-heading font-semibold",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 sm:h-9 sm:w-9 bg-transparent p-0 opacity-50 hover:opacity-100 border border-border rounded-lg hover:bg-secondary",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse",
                    head_row: "flex justify-between",
                    head_cell: "text-muted-foreground rounded-md w-9 sm:w-10 font-medium text-xs sm:text-sm text-center",
                    row: "flex w-full mt-1 justify-between",
                    cell: "h-9 w-9 sm:h-10 sm:w-10 text-center text-sm sm:text-base p-0 relative focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 sm:h-10 sm:w-10 p-0 font-medium aria-selected:opacity-100 hover:bg-primary/10 rounded-lg transition-colors",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-lg",
                    day_today: "bg-accent/20 text-accent-foreground font-bold",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-30",
                    day_hidden: "invisible",
                  }}
                />
              </div>

              {/* Time Slots - Show when date is selected */}
              <div ref={timeSlotsRef} className="space-y-4">
                {bookingData.date ? (
                  <>
                    <div className="text-center md:text-left">
                      <p className="text-lg font-medium text-foreground mb-1">
                        {format(bookingData.date, 'EEEE, MMMM d')}
                      </p>
                      <p className="text-sm text-muted-foreground">Choose an available time:</p>
                    </div>
                    
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => slot.available && setBookingData(prev => ({ 
                              ...prev, 
                              timeSlot: slot.time,
                              timeLabel: slot.label
                            }))}
                            disabled={!slot.available}
                            className={`p-4 rounded-xl border-2 text-lg font-medium transition-all flex items-center justify-center gap-2 ${
                              bookingData.timeSlot === slot.time
                                ? 'border-primary bg-primary text-primary-foreground'
                                : slot.available
                                  ? 'border-border bg-card hover:border-primary/50 hover:bg-primary/5 text-foreground'
                                  : 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                            }`}
                          >
                            <Clock className={`w-5 h-5 ${
                              bookingData.timeSlot === slot.time ? 'text-primary-foreground' : 'text-primary'
                            }`} />
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {bookingData.timeSlot && (
                      <div className="bg-primary/10 rounded-xl p-4 text-center">
                        <p className="text-primary font-medium">
                          Selected: {format(bookingData.date, 'MMM d')} at {bookingData.timeLabel}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CalendarDays className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-lg">
                      Select a date to see available times
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Services Selection - Classic Checklist Style */}
        {currentStep === 'services' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-heading text-heading-sm text-foreground mb-2">
                What Do You Need Help With?
              </h3>
              <p className="text-lg text-muted-foreground">
                Check all that apply
              </p>
            </div>

            {/* Classic Paper Checklist Container */}
            <div className="bg-amber-50/50 border-2 border-amber-200/50 rounded-lg p-6 shadow-inner">
              
              {/* Individual Services */}
              <div className="mb-6">
                <h4 className="font-heading text-xl text-foreground mb-4 pb-2 border-b-2 border-amber-300/50 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary" />
                  Individual Services
                  <span className="text-sm font-normal text-muted-foreground">
                    (tap Details for pricing)
                  </span>
                </h4>
                <ul className="space-y-3">
                  {SERVICE_OPTIONS.filter(s => s.category === 'service').map((service) => (
                    <li key={service.id}>
                      <label
                        className={`flex items-center gap-4 cursor-pointer group py-2 px-3 -mx-3 rounded-lg transition-colors ${
                          bookingData.services.includes(service.id)
                            ? 'bg-primary/10'
                            : 'hover:bg-amber-100/50'
                        }`}
                      >
                        <div className={`w-7 h-7 border-2 rounded flex items-center justify-center transition-all ${
                          bookingData.services.includes(service.id)
                            ? 'bg-primary border-primary'
                            : 'border-gray-400 bg-white'
                        }`}>
                          {bookingData.services.includes(service.id) && (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <Checkbox
                          checked={bookingData.services.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                          className="sr-only"
                        />
                        <span className={`text-xl flex-1 transition-all ${
                          bookingData.services.includes(service.id)
                            ? 'text-primary font-medium'
                            : 'text-foreground'
                        }`}>
                          {service.label}
                        </span>
                        <InfoPopover serviceId={service.id} type="service" />
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Custom Notes */}
              <div className="mb-6 pb-6 border-b-2 border-amber-300/30">
                <Label htmlFor="custom-notes" className="text-lg text-foreground font-medium block mb-2">
                  Tell us what you need — describe your project or request:
                </Label>
                <Textarea
                  id="custom-notes"
                  value={bookingData.customNotes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, customNotes: e.target.value }))}
                  placeholder="e.g., Hang 3 pictures in living room, fix squeaky bedroom door, need help setting up new TV..."
                  rows={6}
                  className="text-lg bg-white border-2 border-gray-300 rounded-lg resize-none"
                />
                
                {/* Image Upload Section */}
                <div className="mt-4">
                  <Label className="text-lg text-foreground font-medium block mb-2">
                    Add photos (optional) — show us what you need help with:
                  </Label>
                  
                  {/* Image Preview Grid */}
                  {bookingData.images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-3">
                      {bookingData.images.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                          <img
                            src={img.preview}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  {bookingData.images.length < MAX_IMAGES && (
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
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-white border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 text-foreground px-4 py-3 h-auto"
                      >
                        <ImagePlus className="w-5 h-5 text-primary" />
                        <span className="text-base">Add Photos</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.capture = 'environment';
                            fileInputRef.current.click();
                          }
                        }}
                        className="flex items-center gap-2 bg-white border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 text-foreground px-4 py-3 h-auto"
                      >
                        <Camera className="w-5 h-5 text-primary" />
                        <span className="text-base">Take Photo</span>
                      </Button>
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    {bookingData.images.length}/{MAX_IMAGES} photos added
                  </p>
                </div>
              </div>

              {/* Value Packages */}
              <div className="mb-6">
                <h4 className="font-heading text-xl text-foreground mb-4 pb-2 border-b-2 border-amber-300/50 flex items-center gap-2">
                  <Package className="w-5 h-5 text-accent" />
                  Value Packages
                  <span className="text-sm font-normal text-muted-foreground">
                    (tap Details for pricing)
                  </span>
                </h4>
                <ul className="space-y-3">
                  {SERVICE_OPTIONS.filter(s => s.category === 'package').map((service) => (
                    <li key={service.id}>
                      <label
                        className={`flex items-center gap-4 cursor-pointer group py-2 px-3 -mx-3 rounded-lg transition-colors ${
                          bookingData.services.includes(service.id)
                            ? 'bg-accent/10'
                            : 'hover:bg-amber-100/50'
                        }`}
                      >
                        <div className={`w-7 h-7 border-2 rounded flex items-center justify-center transition-all ${
                          bookingData.services.includes(service.id)
                            ? 'bg-accent border-accent'
                            : 'border-gray-400 bg-white'
                        }`}>
                          {bookingData.services.includes(service.id) && (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <Checkbox
                          checked={bookingData.services.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                          className="sr-only"
                        />
                        <span className={`text-xl flex-1 transition-all ${
                          bookingData.services.includes(service.id)
                            ? 'text-accent font-medium'
                            : 'text-foreground'
                        }`}>
                          {service.label}
                        </span>
                        <InfoPopover serviceId={service.id} type="package" />
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Monthly Plans */}
              <div>
                <h4 className="font-heading text-xl text-foreground mb-4 pb-2 border-b-2 border-amber-300/50 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-trust" />
                  Monthly Plans
                  <span className="text-sm font-normal text-muted-foreground">
                    (tap Details for pricing)
                  </span>
                </h4>
                <ul className="space-y-3">
                  {SERVICE_OPTIONS.filter(s => s.category === 'monthly').map((service) => (
                    <li key={service.id}>
                      <label
                        className={`flex items-center gap-4 cursor-pointer group py-2 px-3 -mx-3 rounded-lg transition-colors ${
                          bookingData.services.includes(service.id)
                            ? 'bg-trust/10'
                            : 'hover:bg-amber-100/50'
                        }`}
                      >
                        <div className={`w-7 h-7 border-2 rounded flex items-center justify-center transition-all ${
                          bookingData.services.includes(service.id)
                            ? 'bg-trust border-trust'
                            : 'border-gray-400 bg-white'
                        }`}>
                          {bookingData.services.includes(service.id) && (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <Checkbox
                          checked={bookingData.services.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                          className="sr-only"
                        />
                        <span className={`text-xl flex-1 transition-all ${
                          bookingData.services.includes(service.id)
                            ? 'text-trust font-medium'
                            : 'text-foreground'
                        }`}>
                          {service.label}
                        </span>
                        <InfoPopover serviceId={service.id} type="package" />
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {(bookingData.services.length > 0 || bookingData.customNotes) && (
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <p className="text-lg text-foreground">
                  {bookingData.services.length > 0 && (
                    <><strong>{bookingData.services.length}</strong> service{bookingData.services.length > 1 ? 's' : ''} selected</>
                  )}
                  {bookingData.services.length > 0 && bookingData.customNotes && ' + '}
                  {bookingData.customNotes && 'custom request'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Contact Details + Address */}
        {currentStep === 'details' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="font-heading text-heading-sm text-foreground mb-2">
                Your Information
              </h3>
              <p className="text-lg text-muted-foreground">
                Where should we come and how can we reach you?
              </p>
            </div>

            <div className="space-y-5">
              {/* Address - First and prominent */}
              <div className="space-y-2">
                <Label htmlFor="booking-address" className="text-lg font-medium flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Your Address *
                </Label>
                <Input
                  id="booking-address"
                  value={bookingData.address}
                  onChange={(e) => setBookingData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g., 123 Main St, Lot 45"
                  className="h-14 text-lg rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-community" className="text-lg font-medium">
                  Community/Park Name (Optional)
                </Label>
                <Input
                  id="booking-community"
                  value={bookingData.community}
                  onChange={(e) => setBookingData(prev => ({ ...prev, community: e.target.value }))}
                  placeholder="e.g., Sunny Acres Mobile Home Park"
                  className="h-14 text-lg rounded-xl"
                />
              </div>

              <div className="border-t border-border pt-5 space-y-2">
                <Label htmlFor="booking-name" className="text-lg font-medium">
                  Your Name *
                </Label>
                <Input
                  id="booking-name"
                  value={bookingData.name}
                  onChange={(e) => setBookingData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., John Smith"
                  className="h-14 text-lg rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-phone" className="text-lg font-medium">
                  Phone Number *
                </Label>
                <Input
                  id="booking-phone"
                  type="tel"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g., (555) 123-4567"
                  className="h-14 text-lg rounded-xl"
                />
                <p className="text-sm text-muted-foreground">
                  We'll call to confirm your appointment
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-email" className="text-lg font-medium">
                  Email Address *
                </Label>
                <Input
                  id="booking-email"
                  type="email"
                  value={bookingData.email}
                  onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g., john@email.com"
                  className="h-14 text-lg rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-notes" className="text-lg font-medium">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="booking-notes"
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Gate code, parking instructions, or anything else we should know..."
                  rows={3}
                  className="text-lg rounded-xl resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 'confirm' && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="font-heading text-heading-sm text-foreground mb-2">
                Review Your Booking
              </h3>
              <p className="text-lg text-muted-foreground">
                Please confirm everything looks correct
              </p>
            </div>

            <div className="bg-secondary/50 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <span className="text-muted-foreground text-lg">Date:</span>
                <span className="text-foreground text-lg font-medium text-right">
                  {bookingData.date && format(bookingData.date, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              
              <div className="flex justify-between items-start border-b border-border pb-3">
                <span className="text-muted-foreground text-lg">Time:</span>
                <span className="text-foreground text-lg font-medium">{bookingData.timeLabel}</span>
              </div>

              <div className="flex justify-between items-start border-b border-border pb-3">
                <span className="text-muted-foreground text-lg">Address:</span>
                <span className="text-foreground text-lg font-medium text-right max-w-[60%]">
                  {bookingData.address}
                  {bookingData.community && <span className="block text-sm text-muted-foreground">{bookingData.community}</span>}
                </span>
              </div>
              
              {bookingData.services.length > 0 && (
                <div className="flex justify-between items-start border-b border-border pb-3">
                  <span className="text-muted-foreground text-lg">Services:</span>
                  <span className="text-foreground text-lg font-medium text-right max-w-[60%]">
                    {bookingData.services.map(s => 
                      SERVICE_OPTIONS.find(opt => opt.id === s)?.label
                    ).join(', ')}
                  </span>
                </div>
              )}

              {bookingData.customNotes && (
                <div className="border-b border-border pb-3">
                  <span className="text-muted-foreground text-lg block mb-1">Custom Request:</span>
                  <span className="text-foreground text-base">{bookingData.customNotes}</span>
                </div>
              )}
              
              <div className="flex justify-between items-start border-b border-border pb-3">
                <span className="text-muted-foreground text-lg">Name:</span>
                <span className="text-foreground text-lg font-medium">{bookingData.name}</span>
              </div>
              
              <div className="flex justify-between items-start border-b border-border pb-3">
                <span className="text-muted-foreground text-lg">Phone:</span>
                <span className="text-foreground text-lg font-medium">{bookingData.phone}</span>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground text-lg">Email:</span>
                <span className="text-foreground text-lg font-medium">{bookingData.email}</span>
              </div>

              {bookingData.notes && (
                <div className="pt-3 border-t border-border">
                  <span className="text-muted-foreground text-lg block mb-1">Notes:</span>
                  <span className="text-foreground text-base">{bookingData.notes}</span>
                </div>
              )}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
              <p className="text-muted-foreground">
                We'll call you at <strong className="text-foreground">{bookingData.phone}</strong> to confirm this appointment.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="text-lg px-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          {currentStep === 'confirm' ? (
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {uploadingImages ? 'Uploading photos...' : 'Sending...'}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-6"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
