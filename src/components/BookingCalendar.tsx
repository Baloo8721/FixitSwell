import { useState, useEffect, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  MapPin,
  User,
  Camera,
  X,
  ImagePlus,
  Plus,
  ChevronDown,
  Search,
  AlertTriangle
} from "lucide-react";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { 
  DEFAULT_TIME_SLOTS, 
  createBooking,
  getAvailableTimeSlots,
  getServicesForBooking,
  findNextAvailableDayForDuration,
  getAvailableMinutesFromSlot,
  trackEvent,
  uploadBookingImage,
  type TimeSlot,
  type ServiceOption
} from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

// Format price for display (cents to dollars)
const formatPrice = (priceMin: number | null, priceMax?: number | null): string => {
  if (!priceMin) return '';
  const min = priceMin / 100;
  if (priceMax && priceMax !== priceMin) {
    const max = priceMax / 100;
    return `$${min}–$${max}`;
  }
  return `$${min}`;
};

// Site category display names
const SITE_CATEGORY_LABELS: Record<string, string> = {
  'assembly': 'Assembly & Mounting',
  'tech': 'Tech & Security',
  'repairs': 'Repairs & Maintenance',
  'safety': 'Safety & Senior Care',
  'outdoor': 'Outdoor & Seasonal',
  'organizing': 'Organizing & Cleaning'
};

type BookingStep = 'datetime' | 'services' | 'details' | 'confirm';

interface UploadedImage {
  file: File;
  preview: string;
  uploading?: boolean;
  url?: string;
}

// Selected service with full details for display
interface SelectedService {
  id: string;
  name: string;
  category: 'service' | 'package' | 'monthly';
  price: string;
  durationMinutes: number;
}

interface BookingData {
  date: Date | undefined;
  timeSlot: string;
  timeLabel: string;
  durationHours: number;
  services: SelectedService[];
  selectedPlanId: string | null; // For monthly subscription tracking
  customNotes: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  community: string;
  notes: string;
  images: UploadedImage[];
}

const DURATION_OPTIONS = [
  { hours: 1, label: '1 hour' },
  { hours: 2, label: '2 hours' },
  { hours: 3, label: '3 hours' },
  { hours: 4, label: '4 hours' },
];

const MAX_IMAGES = 10;

const BookingCalendar = () => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('datetime');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>(DEFAULT_TIME_SLOTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [completedBookingToken, setCompletedBookingToken] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeSlotsRef = useRef<HTMLDivElement>(null);
  
  // Services fetched from Supabase (includes individual services, packages, bundles, and monthly plans)
  const [allServices, setAllServices] = useState<ServiceOption[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  
  // Dropdown open states
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [packagesDropdownOpen, setPackagesDropdownOpen] = useState(false);
  const [plansDropdownOpen, setPlansDropdownOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  
  const [bookingData, setBookingData] = useState<BookingData>({
    date: undefined,
    timeSlot: '',
    timeLabel: '',
    durationHours: 1,
    services: [],
    selectedPlanId: null,
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
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const packagesDropdownRef = useRef<HTMLDivElement>(null);
  const plansDropdownRef = useRef<HTMLDivElement>(null);
  
  // Time conflict detection
  const [timeConflict, setTimeConflict] = useState<{
    hasConflict: boolean;
    requiredMinutes: number;
    availableMinutes: number;
    suggestedDay: { date: string; startTime: string; startTimeLabel: string } | null;
  }>({ hasConflict: false, requiredMinutes: 0, availableMinutes: 0, suggestedDay: null });
  const [findingAlternative, setFindingAlternative] = useState(false);

  // Fetch all services on mount (includes individual, packages, bundles, monthly plans)
  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true);
      const servicesResult = await getServicesForBooking();
      
      if (servicesResult.data) {
        setAllServices(servicesResult.data);
      }
      setServicesLoading(false);
    };
    
    loadServices();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
      if (packagesDropdownRef.current && !packagesDropdownRef.current.contains(event.target as Node)) {
        setPackagesDropdownOpen(false);
      }
      if (plansDropdownRef.current && !plansDropdownRef.current.contains(event.target as Node)) {
        setPlansDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for custom plan services from the Plan Builder modal
  useEffect(() => {
    const handleCustomPlanServices = (event: CustomEvent<{ 
      services: { name: string; price: number; time: number }[]; 
      total: number; 
      time: number 
    }>) => {
      const { services, total, time } = event.detail;
      
      // Add each service as a monthly plan service to the booking
      const newServices: SelectedService[] = services.map(s => ({
        id: `custom-${s.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: s.name,
        category: 'monthly' as const,
        price: `$${s.price}`,
        durationMinutes: s.time
      }));
      
      // Also add a "Custom Monthly Plan" entry to track it as subscription
      const customPlanEntry: SelectedService = {
        id: 'monthly-custom',
        name: 'Custom Monthly Plan',
        category: 'monthly',
        price: `$${total}/mo`,
        durationMinutes: time
      };
      
      setBookingData(prev => {
        // Remove any existing custom monthly plan entries
        const filteredServices = prev.services.filter(s => s.id !== 'monthly-custom' && !s.id.startsWith('custom-'));
        const updatedServices = [...filteredServices, customPlanEntry];
        const recommendedDuration = calculateRecommendedDuration(updatedServices);
        
        return {
          ...prev,
          services: updatedServices,
          selectedPlanId: 'monthly-custom',
          customNotes: prev.customNotes + (prev.customNotes ? '\n\n' : '') + 
            `Custom Monthly Plan Services:\n${services.map(s => `• ${s.name} ($${s.price})`).join('\n')}\nTotal: $${total}/mo`,
          durationHours: recommendedDuration
        };
      });
      
      toast({
        title: "Custom Plan Added!",
        description: `${services.length} services added to your booking.`
      });
    };
    
    window.addEventListener('customPlanServicesSelected', handleCustomPlanServices as EventListener);
    return () => window.removeEventListener('customPlanServicesSelected', handleCustomPlanServices as EventListener);
  }, []);

  // Fetch available time slots when date or duration changes
  useEffect(() => {
    if (bookingData.date) {
      setIsLoading(true);
      const dateStr = format(bookingData.date, 'yyyy-MM-dd');
      const durationMinutes = bookingData.durationHours * 60;
      getAvailableTimeSlots(dateStr, durationMinutes)
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
  }, [bookingData.date, bookingData.durationHours]);

  // Clear selected time slot if it becomes unavailable when duration changes
  useEffect(() => {
    if (bookingData.timeSlot && availableSlots.length > 0) {
      const selectedSlot = availableSlots.find(s => s.time === bookingData.timeSlot);
      if (selectedSlot && !selectedSlot.available) {
        setBookingData(prev => ({ ...prev, timeSlot: '', timeLabel: '' }));
      }
    }
  }, [availableSlots, bookingData.timeSlot]);

  // Check for time conflicts when services change
  useEffect(() => {
    const checkTimeConflict = async () => {
      // Only check if we have a date, time slot, and services selected
      if (!bookingData.date || !bookingData.timeSlot || bookingData.services.length === 0) {
        setTimeConflict({ hasConflict: false, requiredMinutes: 0, availableMinutes: 0, suggestedDay: null });
        return;
      }
      
      const requiredMinutes = bookingData.services.reduce((sum, s) => sum + s.durationMinutes, 0);
      const dateStr = format(bookingData.date, 'yyyy-MM-dd');
      const availableMinutes = await getAvailableMinutesFromSlot(dateStr, bookingData.timeSlot);
      
      if (requiredMinutes > availableMinutes) {
        // There's a conflict - find the next available day
        const suggestedDay = await findNextAvailableDayForDuration(dateStr, requiredMinutes);
        setTimeConflict({
          hasConflict: true,
          requiredMinutes,
          availableMinutes,
          suggestedDay
        });
      } else {
        setTimeConflict({ hasConflict: false, requiredMinutes, availableMinutes, suggestedDay: null });
      }
    };
    
    checkTimeConflict();
  }, [bookingData.date, bookingData.timeSlot, bookingData.services]);

  // Get services grouped by category
  const individualServices = allServices.filter(s => s.category === 'service');
  const packageServices = allServices.filter(s => s.category === 'package');
  const monthlyPlans = allServices.filter(s => s.category === 'monthly');
  
  // Group individual services by site_category
  const servicesByCategory = individualServices.reduce((acc, service) => {
    const cat = service.site_category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {} as Record<string, ServiceOption[]>);

  // Filter services based on search
  const filteredServices = serviceSearch.trim() 
    ? individualServices.filter(s => 
        s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        s.description?.toLowerCase().includes(serviceSearch.toLowerCase())
      )
    : individualServices;

  const steps: { id: BookingStep; label: string; icon: React.ReactNode }[] = [
    { id: 'datetime', label: 'Date & Time', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'services', label: 'Services', icon: <Wrench className="w-5 h-5" /> },
    { id: 'details', label: 'Your Info', icon: <User className="w-5 h-5" /> },
    { id: 'confirm', label: 'Confirm', icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  // Email validation helper - requires proper domain with TLD (at least 2 chars)
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'datetime': return bookingData.date !== undefined && bookingData.timeSlot !== '';
      case 'services': return bookingData.services.length > 0 || bookingData.customNotes.trim() !== '';
      case 'details': return bookingData.name && bookingData.email && isValidEmail(bookingData.email) && bookingData.phone && bookingData.address;
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
    let allNotes = [bookingData.customNotes, bookingData.notes].filter(Boolean).join('\n\n');
    
    // Add multi-visit warning if there's a time conflict
    if (timeConflict.hasConflict) {
      const totalHours = (timeConflict.requiredMinutes / 60).toFixed(1).replace(/\.0$/, '');
      const multiVisitNote = `⚠️ MULTI-VISIT NEEDED: Services total ${totalHours} hours but only ${(timeConflict.availableMinutes / 60).toFixed(1).replace(/\.0$/, '')} hours available from chosen time slot. Please coordinate additional visit(s).`;
      allNotes = allNotes ? `${multiVisitNote}\n\n${allNotes}` : multiVisitNote;
    }
    
    // Extract service names for the API (backward compatible)
    const serviceNames = bookingData.services.map(s => s.name);
    
    const bookingPayload = {
      name: bookingData.name,
      email: bookingData.email,
      phone: bookingData.phone,
      date: format(bookingData.date, 'yyyy-MM-dd'),
      time_slot: bookingData.timeSlot,
      duration_minutes: bookingData.durationHours * 60,
      services: serviceNames,
      subscription_plan_id: bookingData.selectedPlanId || undefined,
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
      
      // Store the manage token for the "View Your Booking" link
      if (data.booking.manage_token) {
        setCompletedBookingToken(data.booking.manage_token);
      }
      
      trackEvent('booking_completed', {
        booking_id: data.booking.id,
        services: serviceNames,
        date: bookingPayload.date,
        has_subscription: !!bookingData.selectedPlanId
      }, data.client.id);
    }
    
    setBookingComplete(true);
    toast({
      title: "Booking Request Sent! ✓",
      description: "We'll call you to confirm your appointment.",
    });
  };

  // Add a service to the booking
  // Calculate recommended duration based on total service minutes
  const calculateRecommendedDuration = (services: SelectedService[]): number => {
    const totalMinutes = services.reduce((sum, s) => sum + s.durationMinutes, 0);
    // Round up to nearest hour, minimum 1hr, maximum 4hr
    const hours = Math.ceil(totalMinutes / 60);
    return Math.max(1, Math.min(4, hours || 1));
  };

  // Add a service to the booking
  const handleAddService = (service: ServiceOption) => {
    const isAlreadySelected = bookingData.services.some(s => s.id === service.id);
    if (isAlreadySelected) return;
    
    const newService: SelectedService = {
      id: service.id,
      name: service.name,
      category: service.category as 'service' | 'package' | 'monthly',
      price: formatPrice(service.price_min, service.price_max),
      durationMinutes: service.duration_minutes || 30 // Default 30 min if not specified
    };
    
    const updatedServices = [...bookingData.services, newService];
    const recommendedDuration = calculateRecommendedDuration(updatedServices);
    
    setBookingData(prev => ({
      ...prev,
      services: updatedServices,
      durationHours: recommendedDuration
    }));
    
    // Close dropdowns and clear search
    setServicesDropdownOpen(false);
    setPackagesDropdownOpen(false);
    setServiceSearch('');
  };

  // Add a monthly plan to the booking
  const handleAddPlan = (plan: ServiceOption) => {
    const isAlreadySelected = bookingData.services.some(s => s.id === plan.id);
    if (isAlreadySelected) return;
    
    const isCustomPlan = plan.id === 'monthly-custom';
    
    const newService: SelectedService = {
      id: plan.id,
      name: isCustomPlan ? 'Custom Monthly Plan (Quote Request)' : plan.name,
      category: 'monthly',
      price: isCustomPlan ? 'We\'ll call with pricing' : formatPrice(plan.price_min, plan.price_max) + '/mo',
      durationMinutes: plan.duration_minutes || 90 // Monthly plans typically 1.5hr visits
    };
    
    const updatedServices = [...bookingData.services, newService];
    const recommendedDuration = calculateRecommendedDuration(updatedServices);
    
    setBookingData(prev => ({
      ...prev,
      services: updatedServices,
      selectedPlanId: plan.id,
      durationHours: recommendedDuration
    }));
    
    setPlansDropdownOpen(false);
  };

  // Remove a service from the booking
  // Remove a service from the booking and recalculate duration
  const handleRemoveService = (serviceId: string) => {
    setBookingData(prev => {
      const updatedServices = prev.services.filter(s => s.id !== serviceId);
      const recommendedDuration = updatedServices.length > 0 
        ? calculateRecommendedDuration(updatedServices) 
        : 1; // Default to 1 hour if no services
      
      return {
        ...prev,
        services: updatedServices,
        selectedPlanId: prev.selectedPlanId === serviceId ? null : prev.selectedPlanId,
        durationHours: recommendedDuration
      };
    });
  };

  // Check if a service is already selected
  const isServiceSelected = (serviceId: string) => {
    return bookingData.services.some(s => s.id === serviceId);
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
              <li><strong>Time:</strong> {bookingData.timeLabel} ({bookingData.durationHours}hr block)</li>
              <li><strong>Address:</strong> {bookingData.address}</li>
              {bookingData.services.length > 0 && (
                <li><strong>Services:</strong> {bookingData.services.map(s => s.name).join(', ')}</li>
              )}
            </ul>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {completedBookingToken && (
              <Button 
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg"
              >
                <a href={`/manage-booking/${completedBookingToken}`}>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  View & Manage Your Booking
                </a>
              </Button>
            )}
            <Button 
              onClick={() => {
                setBookingComplete(false);
                setCompletedBookingToken(null);
                setCurrentStep('datetime');
                setBookingData({
                  date: undefined,
                  timeSlot: '',
                  timeLabel: '',
                  durationHours: 1,
                  services: [],
                  selectedPlanId: null,
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
          </div>
          
          {/* Email notification info */}
          <p className="text-sm text-muted-foreground mt-4">
            A confirmation email with this link has been sent to {bookingData.email}
          </p>
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
            {/* Finding Alternative Date Banner */}
            {findingAlternative && timeConflict.suggestedDay && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-green-800 font-medium mb-1">
                      We found a day that fits all your services!
                    </p>
                    <p className="text-base text-green-700 font-semibold mb-2">
                      {format(new Date(timeConflict.suggestedDay.date + 'T12:00:00'), 'EEEE, MMMM d')} at {timeConflict.suggestedDay.startTimeLabel}
                    </p>
                    <p className="text-xs text-green-600 mb-3">
                      Select this date on the calendar below, or choose a different day.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          const suggested = timeConflict.suggestedDay!;
                          const newDate = new Date(suggested.date + 'T12:00:00');
                          setBookingData(prev => ({
                            ...prev,
                            date: newDate,
                            timeSlot: suggested.startTime,
                            timeLabel: suggested.startTimeLabel
                          }));
                          setFindingAlternative(false);
                          setCurrentStep('services');
                          toast({
                            title: "Date Confirmed!",
                            description: `Booked for ${format(newDate, 'EEEE, MMMM d')} at ${suggested.startTimeLabel}`
                          });
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Use This Date
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-green-400 text-green-700 hover:bg-green-100"
                        onClick={() => setFindingAlternative(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="font-heading text-heading-sm text-foreground mb-2">
                {findingAlternative ? 'Choose a New Date' : 'Pick a Date & Time'}
              </h3>
              <p className="text-lg text-muted-foreground">
                {findingAlternative 
                  ? 'Select a date that fits all your services' 
                  : "Select when you'd like us to come by"}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
              {/* Calendar */}
              <div className="flex justify-center overflow-x-auto px-2">
                <Calendar
                  mode="single"
                  selected={bookingData.date}
                  onSelect={(date) => {
                    setBookingData(prev => ({ ...prev, date, timeSlot: '', timeLabel: '' }));
                    // Clear findingAlternative mode when user manually picks a date
                    if (findingAlternative) setFindingAlternative(false);
                  }}
                  disabled={(date) => isBefore(date, startOfToday()) || isBefore(addDays(new Date(), 60), date)}
                  className="rounded-xl border-2 border-border p-3 sm:p-4 bg-background pointer-events-auto w-full min-w-[320px] max-w-[360px]"
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
                    head_cell: "text-muted-foreground rounded-md w-10 sm:w-11 font-medium text-xs sm:text-sm text-center",
                    row: "flex w-full mt-1 justify-between",
                    cell: "h-10 w-10 sm:h-11 sm:w-11 text-center text-sm sm:text-base p-0 relative focus-within:relative focus-within:z-20",
                    day: "h-10 w-10 sm:h-11 sm:w-11 p-0 font-medium aria-selected:opacity-100 hover:bg-primary/10 rounded-lg transition-colors",
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
                    
                    {/* Duration Selection - Show first */}
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2 text-center md:text-left">
                        How long do you need?
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {DURATION_OPTIONS.map((option) => (
                          <button
                            key={option.hours}
                            onClick={() => setBookingData(prev => ({ 
                              ...prev, 
                              durationHours: option.hours 
                            }))}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              bookingData.durationHours === option.hours
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5 text-foreground'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
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
                      <div className="bg-primary/10 rounded-xl p-4 text-center mt-4">
                        <p className="text-primary font-medium">
                          Selected: {format(bookingData.date, 'MMM d')} at {bookingData.timeLabel} ({bookingData.durationHours}hr block)
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

        {/* Step 2: Services Selection - Searchable Dropdowns */}
        {currentStep === 'services' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="font-heading text-heading-sm text-foreground mb-2">
                What Do You Need Help With?
              </h3>
              <p className="text-lg text-muted-foreground">
                Tap to select services, or describe what you need below
              </p>
            </div>

            {servicesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-amber-50/50 border-2 border-amber-200/50 rounded-lg p-4 sm:p-6 shadow-inner space-y-6">
                
                {/* Selected Services Display */}
                {bookingData.services.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-muted-foreground">Selected Services:</p>
                      <p className="text-sm text-muted-foreground">
                        Total: <span className="font-semibold text-foreground">
                          {(() => {
                            const totalMins = bookingData.services.reduce((sum, s) => sum + s.durationMinutes, 0);
                            const hrs = totalMins / 60;
                            return hrs % 1 === 0 ? `${hrs} hr${hrs > 1 ? 's' : ''}` : `${hrs.toFixed(2).replace(/\.?0+$/, '')} hrs`;
                          })()}
                        </span>
                        <span className="mx-1">→</span>
                        <span className="font-semibold text-primary">{bookingData.durationHours} hr{bookingData.durationHours > 1 ? 's' : ''} visit</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bookingData.services.map((service) => (
                        <Badge 
                          key={service.id}
                          variant="secondary"
                          className={`text-base py-2 px-3 flex items-center gap-2 border ${
                            service.category === 'monthly' 
                              ? 'bg-blue-100 text-blue-700 border-blue-300' 
                              : service.category === 'package' 
                                ? 'bg-orange-100 text-orange-700 border-orange-300' 
                                : 'bg-green-100 text-green-700 border-green-300'
                          }`}
                        >
                          {service.name}
                          <span className="text-xs opacity-60">
                            ({(() => {
                              const hrs = service.durationMinutes / 60;
                              return hrs % 1 === 0 ? `${hrs} hr` : `${hrs.toFixed(2).replace(/\.?0+$/, '')} hr`;
                            })()})
                          </span>
                          <span className="text-sm opacity-70">{service.price}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveService(service.id)}
                            className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time Conflict Warning */}
                {timeConflict.hasConflict && bookingData.services.length > 0 && (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-amber-800 font-medium mb-2">
                          Your selected services total {(timeConflict.requiredMinutes / 60).toFixed(1).replace(/\.0$/, '')} hours, 
                          but only {(timeConflict.availableMinutes / 60).toFixed(1).replace(/\.0$/, '')} hours are available 
                          from your chosen time. This may need to be split into 2 visits.
                        </p>
                        <p className="text-xs text-amber-700 mb-3">
                          We'll fill your chosen day and coordinate the rest with you.
                        </p>
                        {timeConflict.suggestedDay && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-amber-400 text-amber-700 hover:bg-amber-100"
                            onClick={() => {
                              // Go back to step 1 so user can pick a new date
                              setCurrentStep('datetime');
                              setFindingAlternative(true);
                              // Scroll to top of booking card so user sees the suggestion
                              setTimeout(() => {
                                cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }, 100);
                            }}
                          >
                            <CalendarDays className="w-4 h-4 mr-2" />
                            Find a day that fits everything →
                          </Button>
                        )}
                        {!timeConflict.suggestedDay && (
                          <p className="text-xs text-amber-600 italic">
                            No single day available in the next 2 weeks. We'll coordinate multiple visits.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Services Dropdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading text-xl text-foreground flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      Individual Services
                    </h4>
                    <div className="relative" ref={servicesDropdownRef}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setServicesDropdownOpen(!servicesDropdownOpen);
                          setPackagesDropdownOpen(false);
                          setPlansDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 bg-white border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-lg px-4 py-3 h-auto"
                      >
                        <Plus className="w-5 h-5 text-primary" />
                        <span>Add Service</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
                      </Button>
                      
                      {/* Services Dropdown */}
                      {servicesDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border-2 border-border rounded-xl shadow-xl z-50 max-h-80 overflow-hidden">
                          {/* Search Input */}
                          <div className="p-3 border-b border-border sticky top-0 bg-white">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                placeholder="Search services..."
                                value={serviceSearch}
                                onChange={(e) => setServiceSearch(e.target.value)}
                                className="pl-10 text-lg h-12"
                                autoFocus
                              />
                            </div>
                          </div>
                          
                          {/* Services List */}
                          <div className="overflow-y-auto max-h-56">
                            {serviceSearch.trim() ? (
                              // Show flat filtered list when searching
                              filteredServices.length > 0 ? (
                                filteredServices.map((service) => (
                                  <button
                                    key={service.id}
                                    type="button"
                                    onClick={() => handleAddService(service)}
                                    disabled={isServiceSelected(service.id)}
                                    className={`w-full text-left px-4 py-3 flex justify-between items-center hover:bg-primary/5 transition-colors ${
                                      isServiceSelected(service.id) ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                                    }`}
                                  >
                                    <span className="text-base">{service.name}</span>
                                    <span className="text-primary font-medium text-base">{formatPrice(service.price_min, service.price_max)}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-6 text-center text-muted-foreground">
                                  No services found
                                </div>
                              )
                            ) : (
                              // Show grouped by category when not searching
                              Object.entries(servicesByCategory).map(([category, services]) => (
                                <div key={category}>
                                  <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-muted-foreground sticky top-0">
                                    {SITE_CATEGORY_LABELS[category] || category}
                                  </div>
                                  {services.map((service) => (
                                    <button
                                      key={service.id}
                                      type="button"
                                      onClick={() => handleAddService(service)}
                                      disabled={isServiceSelected(service.id)}
                                      className={`w-full text-left px-4 py-3 flex justify-between items-center hover:bg-primary/5 transition-colors ${
                                        isServiceSelected(service.id) ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                                      }`}
                                    >
                                      <span className="text-base">{service.name}</span>
                                      <span className="text-primary font-medium text-base">{formatPrice(service.price_min, service.price_max)}</span>
                                    </button>
                                  ))}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-base">
                    One-time repairs, installations, tech help & more
                  </p>
                </div>

                {/* Value Packages Dropdown */}
                <div className="space-y-3 pt-4 border-t-2 border-amber-300/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading text-xl text-foreground flex items-center gap-2">
                      <Package className="w-5 h-5 text-accent" />
                      Value Packages
                    </h4>
                    <div className="relative" ref={packagesDropdownRef}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPackagesDropdownOpen(!packagesDropdownOpen);
                          setServicesDropdownOpen(false);
                          setPlansDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 bg-white border-2 border-accent/30 hover:border-accent hover:bg-accent/5 text-lg px-4 py-3 h-auto"
                      >
                        <Plus className="w-5 h-5 text-accent" />
                        <span>Add Package</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${packagesDropdownOpen ? 'rotate-180' : ''}`} />
                      </Button>
                      
                      {/* Packages Dropdown */}
                      {packagesDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border-2 border-border rounded-xl shadow-xl z-50 overflow-hidden">
                          <div className="max-h-72 overflow-y-auto">
                            {packageServices.length > 0 ? (
                              packageServices.map((pkg) => (
                                <button
                                  key={pkg.id}
                                  type="button"
                                  onClick={() => handleAddService(pkg)}
                                  disabled={isServiceSelected(pkg.id)}
                                  className={`w-full text-left px-4 py-4 hover:bg-accent/5 transition-colors border-b border-border last:border-b-0 ${
                                    isServiceSelected(pkg.id) ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="text-base font-medium">{pkg.name}</span>
                                    <span className="text-accent font-semibold text-base">{formatPrice(pkg.price_min, pkg.price_max)}</span>
                                  </div>
                                  {pkg.description && (
                                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-6 text-center text-muted-foreground">
                                No packages available
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-base">
                    Bundled services at discounted rates
                  </p>
                </div>

                {/* Monthly Plans Dropdown */}
                <div className="space-y-3 pt-4 border-t-2 border-amber-300/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading text-xl text-foreground flex items-center gap-2">
                      <CalendarCheck className="w-5 h-5 text-trust" />
                      Monthly Plans
                    </h4>
                    <div className="relative" ref={plansDropdownRef}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPlansDropdownOpen(!plansDropdownOpen);
                          setServicesDropdownOpen(false);
                          setPackagesDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 bg-white border-2 border-trust/30 hover:border-trust hover:bg-trust/5 text-lg px-4 py-3 h-auto"
                      >
                        <Plus className="w-5 h-5 text-trust" />
                        <span>Add Plan</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${plansDropdownOpen ? 'rotate-180' : ''}`} />
                      </Button>
                      
                      {/* Plans Dropdown */}
                      {plansDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border-2 border-border rounded-xl shadow-xl z-50 overflow-hidden">
                          <div className="max-h-72 overflow-y-auto">
                            {monthlyPlans.length > 0 ? (
                              monthlyPlans.map((plan) => {
                                const isCustomPlan = plan.id === 'monthly-custom';
                                return (
                                  <button
                                    key={plan.id}
                                    type="button"
                                    onClick={() => handleAddPlan(plan)}
                                    disabled={isServiceSelected(plan.id)}
                                    className={`w-full text-left px-4 py-4 hover:bg-trust/5 transition-colors border-b border-border last:border-b-0 ${
                                      isServiceSelected(plan.id) ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                                    } ${isCustomPlan ? 'bg-blue-50/50' : ''}`}
                                  >
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-base font-medium">
                                        {isCustomPlan ? 'Custom Monthly Plan' : plan.name}
                                      </span>
                                      <span className={`font-semibold text-base ${isCustomPlan ? 'text-accent' : 'text-trust'}`}>
                                        {isCustomPlan ? 'Get a Quote' : `${formatPrice(plan.price_min, plan.price_max)}/mo`}
                                      </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                      {isCustomPlan 
                                        ? "Pick your own services — we'll reach out with pricing"
                                        : plan.description
                                      }
                                    </p>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="px-4 py-6 text-center text-muted-foreground">
                                No plans available
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-base">
                    Regular monthly visits with ongoing support
                  </p>
                  {/* Link to custom plan builder - opens in "Add to Booking" mode */}
                  <button 
                    type="button"
                    className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent/80 underline underline-offset-2"
                    onClick={() => window.dispatchEvent(new CustomEvent('openCustomPlanBuilderForBooking'))}
                  >
                    Want to build your own custom plan? Use our Plan Builder →
                  </button>
                </div>

                {/* Custom Notes */}
                <div className="pt-4 border-t-2 border-amber-300/30">
                  <Label htmlFor="custom-notes" className="text-lg text-foreground font-medium block mb-2">
                    Tell us what you need — describe your project or request:
                  </Label>
                  <Textarea
                    id="custom-notes"
                    value={bookingData.customNotes}
                    onChange={(e) => setBookingData(prev => ({ ...prev, customNotes: e.target.value }))}
                    placeholder="e.g., Hang 3 pictures in living room, fix squeaky bedroom door, need help setting up new TV..."
                    rows={4}
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
              </div>
            )}

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
                  className={`h-14 text-lg rounded-xl ${bookingData.email && !isValidEmail(bookingData.email) ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {bookingData.email && !isValidEmail(bookingData.email) && (
                  <p className="text-sm text-red-500">Please enter a valid email address (e.g., john@email.com)</p>
                )}
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

            {/* Edit Button - Jump back to step 1 */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentStep('datetime');
                  scrollToTop();
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Edit Booking
              </Button>
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
                <span className="text-foreground text-lg font-medium">{bookingData.timeLabel} ({bookingData.durationHours}hr block)</span>
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
                    {bookingData.services.map(s => s.name).join(', ')}
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
