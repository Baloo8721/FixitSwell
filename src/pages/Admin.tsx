import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Home,
  Wrench,
  Image as ImageIcon,
  ImagePlus,
  Plus,
  X,
  ExternalLink,
  Copy,
  Link as LinkIcon,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar as CalendarIcon,
  MessageSquare,
  Mic,
  MicOff,
  Sparkles,
  Wand2,
  Package,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Repeat,
  FileText,
  Printer,
  Send,
  RotateCcw,
  Users,
  DollarSign,
  UserPlus,
  Star,
  Shield,
  Bell,
  Play,
  Square,
  Timer,
  Edit2,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  ChevronRight
} from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { supabase } from "@/lib/supabase";
import {
  getUpcomingBookings,
  getAllBookings,
  updateBookingStatus,
  updateBookingNotes,
  updateBookingImages,
  uploadBookingImage,
  getBookingStats,
  createManualBooking,
  getAvailableTimeSlots,
  getBookingsForDate as fetchBookingsForDate,
  getOriginalBooking,
  createInvoice,
  updateInvoiceStatus,
  updateInvoiceAmount,
  getBookingSupplies,
  addBookingSupply,
  deleteBookingSupply,
  markPaymentCollected,
  deleteBooking,
  getContactMessages,
  updateContactMessageStatus,
  replyToContactMessage,
  deleteContactMessage,
  generateSupplySuggestions,
  generateAndSaveSupplySuggestions,
  generateFullAIEstimate,
  SuggestedSupply,
  getAllSupplies,
  getSupplyStats,
  SupplyWithBooking,
  getAnalyticsDashboard,
  AnalyticsDashboard,
  addNewClient,
  deleteClient,
  getClientsWithStats,
  updateClientFlags,
  getClientNotes,
  addClientNote,
  getExtendedStats,
  startJob,
  stopJob,
  getTimeEntries,
  getActiveTimeEntry,
  deleteTimeEntry,
  TimeEntry,
  getBookingNotes,
  addBookingNote,
  updateBookingNote,
  deleteBookingNote,
  addFutureRepair,
  removeFutureRepair,
  updateClientPetInfo,
  toggleServiceCompletion,
  addServiceToBooking,
  removeServiceFromBooking,
  getSubscriptionPlans,
  getAllSubscriptions,
  createSubscription,
  updateSubscriptionStatus,
  updateSubscriptionPrice,
  getSubscriptionStats,
  DEFAULT_TIME_SLOTS,
  type SubscriptionPlan,
  type SubscriptionWithDetails,
  type BookingWithDetails,
  type Booking,
  type BookingSupply,
  type BookingNote,
  type PetInfo,
  type TimeSlot,
  type ContactMessage,
  type ClientWithStats,
  type ClientNote,
  type ExtendedStats,
  SERVICE_OPTIONS,
  getAllServicesForDropdown,
  getContractors,
  createContractor,
  deleteContractor,
  assignJobToContractor,
  unassignJob,
  getAllJobAssignments,
  getContractorStats,
  type Contractor,
  type JobAssignment
} from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { addDays, isBefore, startOfToday } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

type StatusFilter = 'all' | 'unpaid' | 'needs_invoice' | 'needs_attention' | Booking['status'];

const Admin = () => {
  // Authentication state using Supabase Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  // Check if already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setCheckingAuth(false);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!emailInput || !passwordInput) {
      setLoginError('Please enter email and password');
      return;
    }
    
    setLoginLoading(true);
    setLoginError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: passwordInput
    });

    setLoginLoading(false);

    if (error) {
      setLoginError(error.message);
      setPasswordInput('');
    } else {
      setEmailInput('');
      setPasswordInput('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [timeEntries, setTimeEntries] = useState<Record<string, TimeEntry[]>>({});
  const [activeTimers, setActiveTimers] = useState<Record<string, TimeEntry | null>>({});
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, unpaidConfirmed: 0, completedUnpaid: 0, completedNoInvoice: 0, totalUnpaid: 0, needsAttention: 0 });
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  
  // Booking notes state (individual notes per booking)
  const [bookingNotes, setBookingNotes] = useState<Record<string, BookingNote[]>>({});
  const [newNoteContent, setNewNoteContent] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  
  // Future repairs state
  const [newRepairContent, setNewRepairContent] = useState<Record<string, string>>({});
  
  // Pet info state
  const [editingPetInfo, setEditingPetInfo] = useState<string | null>(null);
  const [petInfoForm, setPetInfoForm] = useState<PetInfo>({
    has_pets: false,
    dogs: 0,
    cats: 0,
    names: '',
    breeds: ''
  });
  
  // Quick entry service state
  const [quickServiceInput, setQuickServiceInput] = useState<Record<string, string>>({});
  const [showServiceSuggestions, setShowServiceSuggestions] = useState<string | null>(null);
  const [allServices, setAllServices] = useState<{ id: string; label: string; category: string; price_min: number | null }[]>([]);
  const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadBookingId, setActiveUploadBookingId] = useState<string | null>(null);
  
  // Manual booking modal state
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [newBookingLoading, setNewBookingLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>(DEFAULT_TIME_SLOTS);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [newBooking, setNewBooking] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    community: '',
    date: undefined as Date | undefined,
    timeSlot: '',
    services: [] as string[],
    notes: '',
    source: 'phone' as 'website' | 'phone' | 'in_person' | 'referral' | 'subscription' | 'other'
  });
  const [newBookingServiceSearch, setNewBookingServiceSearch] = useState('');

  const handleNewBookingDateChange = async (date: Date | undefined) => {
    setNewBooking(prev => ({ ...prev, date, timeSlot: '' }));
    if (date) {
      setLoadingSlots(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      const slots = await getAvailableTimeSlots(dateStr);
      setAvailableSlots(slots);
      setLoadingSlots(false);
    }
  };

  const handleNewBookingServiceToggle = (serviceId: string) => {
    setNewBooking(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  // Invoice and supplies state
  const [invoiceBookingId, setInvoiceBookingId] = useState<string | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [editInvoiceAmount, setEditInvoiceAmount] = useState('');
  const [supplies, setSupplies] = useState<Record<string, BookingSupply[]>>({});
  const [newSupply, setNewSupply] = useState({ 
    item: '', 
    cost: '', 
    quantity: '1', 
    notes: '',
    receipt_number: '',
    store_name: ''
  });
  const [addingSupply, setAddingSupply] = useState<string | null>(null);

  const loadSupplies = async (bookingId: string) => {
    const data = await getBookingSupplies(bookingId);
    setSupplies(prev => ({ ...prev, [bookingId]: data }));
  };

  // Load booking notes
  const loadBookingNotes = async (bookingId: string) => {
    const { data } = await getBookingNotes(bookingId);
    setBookingNotes(prev => ({ ...prev, [bookingId]: data || [] }));
  };

  // Add a new note to a booking
  const handleAddNote = async (bookingId: string) => {
    const content = newNoteContent[bookingId]?.trim();
    if (!content) return;
    
    const { error } = await addBookingNote(bookingId, content);
    if (error) {
      toast({ title: "Error", description: "Failed to add note", variant: "destructive" });
    } else {
      toast({ title: "Note added" });
      setNewNoteContent(prev => ({ ...prev, [bookingId]: '' }));
      loadBookingNotes(bookingId);
    }
  };

  // Update an existing note
  const handleUpdateNote = async (noteId: string, bookingId: string) => {
    if (!editingNoteContent.trim()) return;
    
    const { error } = await updateBookingNote(noteId, editingNoteContent);
    if (error) {
      toast({ title: "Error", description: "Failed to update note", variant: "destructive" });
    } else {
      toast({ title: "Note updated" });
      setEditingNoteId(null);
      setEditingNoteContent('');
      loadBookingNotes(bookingId);
    }
  };

  // Delete a note
  const handleDeleteNote = async (noteId: string, bookingId: string) => {
    const { error } = await deleteBookingNote(noteId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete note", variant: "destructive" });
    } else {
      toast({ title: "Note deleted" });
      loadBookingNotes(bookingId);
    }
  };

  // Add a future repair suggestion
  const handleAddFutureRepair = async (bookingId: string) => {
    const content = newRepairContent[bookingId]?.trim();
    if (!content) return;
    
    const { error } = await addFutureRepair(bookingId, content);
    if (error) {
      toast({ title: "Error", description: "Failed to add repair suggestion", variant: "destructive" });
    } else {
      toast({ title: "Repair suggestion added" });
      setNewRepairContent(prev => ({ ...prev, [bookingId]: '' }));
      loadBookings();
    }
  };

  // Remove a future repair suggestion
  const handleRemoveFutureRepair = async (bookingId: string, index: number) => {
    const { error } = await removeFutureRepair(bookingId, index);
    if (error) {
      toast({ title: "Error", description: "Failed to remove suggestion", variant: "destructive" });
    } else {
      loadBookings();
    }
  };

  // Save pet info for a client
  const handleSavePetInfo = async (clientId: string) => {
    const { error } = await updateClientPetInfo(clientId, petInfoForm.has_pets ? petInfoForm : null);
    if (error) {
      toast({ title: "Error", description: "Failed to save pet info", variant: "destructive" });
    } else {
      toast({ title: "Pet info saved" });
      setEditingPetInfo(null);
      loadBookings();
    }
  };

  // Start editing pet info
  const startEditingPetInfo = (clientId: string, currentPetInfo: PetInfo | null) => {
    setEditingPetInfo(clientId);
    setPetInfoForm(currentPetInfo || {
      has_pets: false,
      dogs: 0,
      cats: 0,
      names: '',
      breeds: ''
    });
  };

  // Quick add service to booking
  const handleQuickAddService = async (bookingId: string, serviceName: string) => {
    if (!serviceName.trim()) return;
    
    const { error } = await addServiceToBooking(bookingId, serviceName);
    if (error) {
      toast({ title: "Error", description: "Failed to add service", variant: "destructive" });
    } else {
      toast({ title: "Service added" });
      setQuickServiceInput(prev => ({ ...prev, [bookingId]: '' }));
      setShowServiceSuggestions(null);
      loadBookings();
    }
  };

  // Remove service from booking
  const handleRemoveService = async (bookingId: string, serviceId: string) => {
    const { error } = await removeServiceFromBooking(bookingId, serviceId);
    if (error) {
      toast({ title: "Error", description: "Failed to remove service", variant: "destructive" });
    } else {
      loadBookings();
    }
  };

  // Get filtered service suggestions from all services in database
  const getServiceSuggestions = (input: string, bookingServices: { service: { name: string } | null }[]) => {
    const currentServiceNames = bookingServices.map(s => s.service?.name || '').filter(Boolean);
    return allServices.filter(opt => 
      !currentServiceNames.includes(opt.id) && 
      opt.label.toLowerCase().includes(input.toLowerCase())
    );
  };

  const handleCreateInvoice = async (bookingId: string) => {
    const amount = parseFloat(invoiceAmount);
    const deposit = depositAmount ? parseFloat(depositAmount) : undefined;
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid invoice amount.",
        variant: "destructive"
      });
      return;
    }

    setCreatingInvoice(true);
    const { error } = await createInvoice(bookingId, amount, deposit);
    setCreatingInvoice(false);

    if (error) {
      toast({
        title: "Error creating invoice",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Invoice created",
        description: `Invoice for $${amount.toFixed(2)} has been created.`
      });
      setInvoiceBookingId(null);
      setInvoiceAmount('');
      setDepositAmount('');
      loadBookings();
    }
  };

  const handleUpdateInvoiceAmount = async (bookingId: string) => {
    const amount = parseFloat(editInvoiceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await updateInvoiceAmount(bookingId, amount);
    
    if (error) {
      toast({
        title: "Error updating invoice",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({ title: "Invoice updated", description: `Amount changed to $${amount.toFixed(2)}` });
      setEditingInvoiceId(null);
      setEditInvoiceAmount('');
      loadBookings();
    }
  };

  const handleMarkPaid = async (bookingId: string) => {
    const { error } = await updateInvoiceStatus(bookingId, 'paid');
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({ title: "Invoice marked as paid" });
      loadBookings();
    }
  };

  const handleCollectPayment = async (bookingId: string, method: 'check' | 'cash') => {
    const { error } = await markPaymentCollected(bookingId, method);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({ title: `${method === 'check' ? 'Check' : 'Cash'} payment collected!` });
      loadBookings();
    }
  };

  const [deletingBooking, setDeletingBooking] = useState<string | null>(null);

  // Bulk selection state
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteConfirmText, setBulkDeleteConfirmText] = useState('');

  // Sort state
  const [sortBy, setSortBy] = useState<'scheduled' | 'created'>('scheduled');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Date range filter state
  type DateRangeFilter = 'all' | 'past' | 'today' | 'week' | 'month';
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('all');

  // Calendar view modal state
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(undefined);

  // Extended stats state
  const [extendedStats, setExtendedStats] = useState<ExtendedStats>({
    revenueThisMonth: 0,
    jobsCompletedThisMonth: 0,
    averageJobValue: 0,
    newClientsThisMonth: 0,
    suppliesCostThisMonth: 0
  });

  // Contact messages state
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [showContactMessages, setShowContactMessages] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // AI Suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, SuggestedSupply[]>>({});
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);

  // Master Supplies state
  const [showMasterSupplies, setShowMasterSupplies] = useState(false);
  const [allSupplies, setAllSupplies] = useState<SupplyWithBooking[]>([]);
  const [supplyStats, setSupplyStats] = useState<{
    totalSpent: number;
    thisMonthSpent: number;
    itemCount: number;
    topItems: { item: string; count: number; totalCost: number }[];
  }>({ totalSpent: 0, thisMonthSpent: 0, itemCount: 0, topItems: [] });

  // Analytics Dashboard state
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDashboard | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Quote/Invoice state
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [quoteBooking, setQuoteBooking] = useState<BookingWithDetails | null>(null);
  const [quoteType, setQuoteType] = useState<'quote' | 'invoice'>('quote');

  // Follow-up booking state
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const [followUpBooking, setFollowUpBooking] = useState<BookingWithDetails | null>(null);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [followUpTimeSlot, setFollowUpTimeSlot] = useState<string>('');
  const [followUpAvailableSlots, setFollowUpAvailableSlots] = useState<TimeSlot[]>([]);
  const [followUpDateBookings, setFollowUpDateBookings] = useState<BookingWithDetails[]>([]);

  // Message templates state
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateClientName, setTemplateClientName] = useState('');
  const [templateAmount, setTemplateAmount] = useState('');
  const [templateDate, setTemplateDate] = useState('');
  const [templateTime, setTemplateTime] = useState('');
  const [templateBookingId, setTemplateBookingId] = useState<string>('');
  
  // Pre-defined message templates
  const MESSAGE_TEMPLATES = [
    {
      id: 'booking-confirm',
      name: '📅 Booking Confirmation',
      template: `Hi {name}! Your FixitSwell appointment is confirmed for {date} at {time}. We'll see you then! Questions? Just reply to this message.`
    },
    {
      id: 'on-the-way',
      name: '🚗 On My Way',
      template: `Hi {name}! This is your FixitSwell handyman. I'm on my way and should arrive in about 15-20 minutes. See you soon!`
    },
    {
      id: 'job-complete',
      name: '✅ Job Complete',
      template: `Hi {name}! Your service is complete. Total: ${'{amount}'}. Thank you for choosing FixitSwell! We appreciate your business. 🔧`
    },
    {
      id: 'follow-up',
      name: '👋 Follow-up Check',
      template: `Hi {name}! Just checking in after our recent visit. How's everything working? Let us know if you need anything else!`
    },
    {
      id: 'reminder',
      name: '⏰ Appointment Reminder',
      template: `Hi {name}! Friendly reminder: Your FixitSwell appointment is tomorrow at {time}. See you then!`
    },
    {
      id: 'review-request',
      name: '⭐ Review Request',
      template: `Hi {name}! Thank you for choosing FixitSwell! If you were happy with our service, we'd really appreciate a quick review. It helps other neighbors find us! 🙏`
    },
    {
      id: 'promo-seasonal',
      name: '🌴 Seasonal Promo',
      template: `Hi {name}! Time for seasonal home prep! FixitSwell is offering 10% off gutter cleaning and AC filter changes this month. Book now while slots are available!`
    },
    {
      id: 'monthly-plan',
      name: '📋 Monthly Plan Pitch',
      template: `Hi {name}! Did you know we offer monthly maintenance plans starting at $99/mo? Includes filter changes, safety checks & priority scheduling. Want details?`
    }
  ];

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFor, setRecordingFor] = useState<{ bookingId: string; field: 'notes' | 'internal' } | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Clients state
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [showClients, setShowClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [clientNotes, setClientNotes] = useState<Record<string, ClientNote[]>>({});
  const [newNoteValue, setNewNoteValue] = useState('');
  const [addingNoteFor, setAddingNoteFor] = useState<string | null>(null);
  
  // New client form state
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientLoading, setNewClientLoading] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    community: '',
    is_senior: false,
    is_military: false
  });
  
  // Subscriptions state
  const [showSubscriptions, setShowSubscriptions] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionStats, setSubscriptionStats] = useState({ activeCount: 0, pausedCount: 0, cancelledCount: 0, monthlyRecurring: 0 });
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'active' | 'paused' | 'cancelled'>('active');
  const [showNewSubscription, setShowNewSubscription] = useState(false);
  const [newSubscription, setNewSubscription] = useState({ clientId: '', planId: '', price: '' });

  // Multi-select for contact messages
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [deletingMessages, setDeletingMessages] = useState(false);
  const [messageDeleteConfirmText, setMessageDeleteConfirmText] = useState('');

  // Multi-select for clients
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [deletingClients, setDeletingClients] = useState(false);
  const [clientDeleteConfirmText, setClientDeleteConfirmText] = useState('');

  // Contractor / Send Job state
  const [showContractors, setShowContractors] = useState(false);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [jobAssignments, setJobAssignments] = useState<JobAssignment[]>([]);
  const [showNewContractor, setShowNewContractor] = useState(false);
  const [newContractor, setNewContractor] = useState({ name: '', phone: '', email: '', pin_code: '', owner_cut_percent: 10 });
  const [sendJobBookingId, setSendJobBookingId] = useState<string | null>(null);
  const [selectedContractorId, setSelectedContractorId] = useState<string>('');
  const [sendingJob, setSendingJob] = useState(false);

  // Toggle booking selection
  const toggleBookingSelection = (bookingId: string) => {
    setSelectedBookings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  // Select all visible bookings
  const selectAllVisible = () => {
    const allVisibleIds = filteredBookings.map(b => b.id);
    setSelectedBookings(new Set(allVisibleIds));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedBookings(new Set());
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedBookings.size === 0) return;
    
    setBulkDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const bookingId of selectedBookings) {
      const { error } = await deleteBooking(bookingId);
      if (error) {
        errorCount++;
      } else {
        successCount++;
      }
    }

    setBulkDeleting(false);
    setSelectedBookings(new Set());

    if (errorCount === 0) {
      toast({ 
        title: "Bookings deleted", 
        description: `Successfully deleted ${successCount} booking(s).` 
      });
    } else {
      toast({ 
        title: "Partial deletion", 
        description: `Deleted ${successCount}, failed ${errorCount}.`,
        variant: "destructive"
      });
    }
    
    loadBookings();
  };

  const handleDeleteBooking = async (bookingId: string) => {
    setDeletingBooking(bookingId);
    const { error } = await deleteBooking(bookingId);
    setDeletingBooking(null);
    
    if (error) {
      toast({
        title: "Error deleting booking",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({ title: "Booking deleted", description: "The booking has been permanently removed." });
      loadBookings();
    }
  };

  // Bulk delete contact messages
  const handleBulkDeleteMessages = async () => {
    if (selectedMessages.size === 0) return;
    
    setDeletingMessages(true);
    let successCount = 0;
    let errorCount = 0;

    for (const msgId of selectedMessages) {
      const { error } = await deleteContactMessage(msgId);
      if (error) {
        errorCount++;
      } else {
        successCount++;
      }
    }

    setDeletingMessages(false);
    setSelectedMessages(new Set());
    setMessageDeleteConfirmText('');

    if (errorCount === 0) {
      toast({ title: "Messages deleted", description: `Successfully deleted ${successCount} message(s).` });
    } else {
      toast({ title: "Partial deletion", description: `Deleted ${successCount}, failed ${errorCount}.`, variant: "destructive" });
    }
    
    loadContactMessages();
  };

  // Bulk delete clients
  const handleBulkDeleteClients = async () => {
    if (selectedClients.size === 0) return;
    
    setDeletingClients(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const clientId of selectedClients) {
      const { error } = await deleteClient(clientId);
      if (error) {
        errorCount++;
        errors.push(error.message);
      } else {
        successCount++;
      }
    }

    setDeletingClients(false);
    setSelectedClients(new Set());
    setClientDeleteConfirmText('');

    if (errorCount === 0) {
      toast({ title: "Clients deleted", description: `Successfully deleted ${successCount} client(s).` });
    } else {
      toast({ 
        title: "Partial deletion", 
        description: `Deleted ${successCount}, failed ${errorCount}. ${errors[0] || ''}`,
        variant: "destructive"
      });
    }
    
    loadClients();
  };

  const handleAddSupply = async (bookingId: string) => {
    const cost = parseFloat(newSupply.cost);
    const quantity = parseInt(newSupply.quantity) || 1;
    
    if (!newSupply.item || isNaN(cost) || cost <= 0) {
      toast({
        title: "Invalid supply",
        description: "Please enter item name and cost.",
        variant: "destructive"
      });
      return;
    }

    const receiptInfo = {
      receipt_number: newSupply.receipt_number || undefined,
      store_name: newSupply.store_name || undefined,
      purchase_date: new Date().toISOString().split('T')[0]
    };

    const { error } = await addBookingSupply(bookingId, newSupply.item, cost, quantity, newSupply.notes || undefined, receiptInfo);
    if (error) {
      toast({
        title: "Error adding supply",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setNewSupply({ item: '', cost: '', quantity: '1', notes: '', receipt_number: '', store_name: '' });
      setAddingSupply(null);
      loadSupplies(bookingId);
    }
  };

  const handleDeleteSupply = async (supplyId: string, bookingId: string) => {
    await deleteBookingSupply(supplyId);
    loadSupplies(bookingId);
  };

  const handleCreateBooking = async () => {
    if (!newBooking.date || !newBooking.timeSlot || !newBooking.name || !newBooking.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in name, phone, date, and time.",
        variant: "destructive"
      });
      return;
    }

    setNewBookingLoading(true);
    const { data, error } = await createManualBooking({
      name: newBooking.name,
      email: newBooking.email || `${newBooking.phone.replace(/\D/g, '')}@placeholder.local`,
      phone: newBooking.phone,
      address: newBooking.address,
      community: newBooking.community,
      date: format(newBooking.date, 'yyyy-MM-dd'),
      time_slot: newBooking.timeSlot,
      services: newBooking.services,
      notes: newBooking.notes,
      booking_source: newBooking.source
    });

    setNewBookingLoading(false);

    if (error) {
      toast({
        title: "Error creating booking",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Booking created",
        description: `Booking for ${newBooking.name} has been created and confirmed.`
      });
      setShowNewBooking(false);
      setNewBooking({
        name: '',
        email: '',
        phone: '',
        address: '',
        community: '',
        date: undefined,
        timeSlot: '',
        services: [],
        notes: '',
        source: 'phone'
      });
      loadBookings();
    }
  };

  const handleAdminImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, booking: BookingWithDetails) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Prevent double uploads
    if (uploadingImageFor === booking.id) return;

    setUploadingImageFor(booking.id);
    
    // Reset the input immediately to allow re-selection of same file
    const inputElement = e.target;
    
    try {
      const currentImages = booking.images || [];
      const newImageUrls: string[] = [];

      for (const file of Array.from(files)) {
        const { data } = await uploadBookingImage(file, booking.id);
        if (data) {
          newImageUrls.push(data.url);
        }
      }

      if (newImageUrls.length > 0) {
        const { error } = await updateBookingImages(booking.id, [...currentImages, ...newImageUrls]);
        if (error) {
          toast({
            title: "Error uploading images",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Images uploaded",
            description: `${newImageUrls.length} image(s) added to booking.`
          });
          await loadBookings();
        }
      }
    } finally {
      setUploadingImageFor(null);
      setActiveUploadBookingId(null);
      // Reset file input
      inputElement.value = '';
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const loadBookings = async () => {
    setIsLoading(true);
    const filters: { status?: Booking['status'] } = {};
    // Handle special filters separately (filter client-side)
    if (statusFilter !== 'all' && statusFilter !== 'unpaid' && statusFilter !== 'needs_invoice' && statusFilter !== 'needs_attention') {
      filters.status = statusFilter;
    }
    
    const { data } = await getAllBookings(filters);
    setBookings(data || []);
    
    const statsData = await getBookingStats();
    setStats(statsData);
    
    // Load extended stats
    const extStats = await getExtendedStats();
    setExtendedStats(extStats);
    
    setIsLoading(false);
  };

  const loadContactMessages = async () => {
    const { data } = await getContactMessages();
    setContactMessages(data || []);
  };

  // Handle replying to a contact message
  const handleSendReply = async (messageId: string) => {
    if (!replyContent.trim()) return;
    
    setSendingReply(true);
    const { error } = await replyToContactMessage(messageId, replyContent);
    setSendingReply(false);
    
    if (error) {
      toast({ title: "Error", description: "Failed to save reply", variant: "destructive" });
    } else {
      toast({ title: "Reply saved" });
      setReplyingToMessage(null);
      setReplyContent('');
      loadContactMessages();
    }
  };

  // Generate AI supply suggestions and time estimate for a booking
  const handleGenerateAISuggestions = async (booking: BookingWithDetails) => {
    setGeneratingAI(booking.id);
    
    // Gather all notes
    const clientNotes = booking.notes || '';
    const adminNotesText = bookingNotes[booking.id]?.map(n => n.content).join(' ') || '';
    const serviceNames = booking.services?.map(s => s.name) || [];
    
    const { estimate, suggestions, error } = await generateFullAIEstimate(
      booking.id,
      clientNotes,
      adminNotesText,
      serviceNames
    );
    
    setGeneratingAI(null);
    
    if (error) {
      toast({ title: "Error", description: "Failed to generate AI estimate", variant: "destructive" });
    } else {
      setAiSuggestions(prev => ({ ...prev, [booking.id]: suggestions }));
      toast({ 
        title: "AI Estimate generated", 
        description: `~${estimate.totalHours}h, $${estimate.totalEstimate} total, ${suggestions.length} supplies` 
      });
      loadBookings(); // Refresh to get saved estimate
    }
  };

  // Voice-to-text handlers
  const startVoiceRecording = (bookingId: string, field: 'notes' | 'internal') => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({ title: "Not supported", description: "Voice recognition not available in this browser", variant: "destructive" });
      return;
    }

    const SpeechRecognition = (window as typeof window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition || (window as typeof window & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      
      if (finalTranscript) {
        // Append to existing content
        if (field === 'notes') {
          const booking = bookings.find(b => b.id === bookingId);
          if (booking) {
            const newNotes = (booking.notes || '') + ' ' + finalTranscript.trim();
            updateBooking(bookingId, { notes: newNotes });
          }
        } else {
          setNewNoteContent(prev => prev + ' ' + finalTranscript.trim());
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setRecordingFor(null);
      toast({ title: "Voice error", description: event.error, variant: "destructive" });
    };

    recognition.onend = () => {
      setIsRecording(false);
      setRecordingFor(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setRecordingFor({ bookingId, field });
    toast({ title: "Listening...", description: "Speak now - your words will be transcribed" });
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setRecordingFor(null);
  };

  const loadClients = async () => {
    const { data } = await getClientsWithStats();
    setClients(data || []);
  };

  // Load contractors
  const loadContractors = async () => {
    const { data } = await getContractors();
    setContractors(data || []);
    const { data: assignments } = await getAllJobAssignments();
    setJobAssignments(assignments || []);
  };

  // Create a new contractor
  const handleCreateContractor = async () => {
    if (!newContractor.name.trim() || !newContractor.pin_code.trim()) {
      toast({ title: "Name and PIN required", variant: "destructive" });
      return;
    }
    const { error } = await createContractor(newContractor);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contractor added" });
      setShowNewContractor(false);
      setNewContractor({ name: '', phone: '', email: '', pin_code: '', owner_cut_percent: 10 });
      loadContractors();
    }
  };

  // Send job to contractor
  const handleSendJob = async () => {
    if (!sendJobBookingId || !selectedContractorId) return;
    setSendingJob(true);
    const { error } = await assignJobToContractor(sendJobBookingId, selectedContractorId);
    setSendingJob(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job sent!", description: "The contractor can now view this job in their portal." });
      setSendJobBookingId(null);
      setSelectedContractorId('');
      loadBookings();
      loadContractors();
    }
  };

  // Unassign job from contractor
  const handleUnassignJob = async (bookingId: string) => {
    const { error } = await unassignJob(bookingId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job unassigned" });
      loadBookings();
      loadContractors();
    }
  };

  // Create a new client
  const handleCreateClient = async () => {
    if (!newClient.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    setNewClientLoading(true);
    const { data, error } = await addNewClient({
      name: newClient.name,
      phone: newClient.phone || undefined,
      email: newClient.email || undefined,
      address: newClient.address || undefined,
      community: newClient.community || undefined,
      is_senior: newClient.is_senior,
      is_military: newClient.is_military,
      source: 'admin'
    });

    setNewClientLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Client added", description: `${newClient.name} has been added` });
      setShowNewClient(false);
      setNewClient({ name: '', phone: '', email: '', address: '', community: '', is_senior: false, is_military: false });
      loadClients();
    }
  };

  const loadMasterSupplies = async () => {
    const [suppliesResult, statsResult] = await Promise.all([
      getAllSupplies(),
      getSupplyStats()
    ]);
    setAllSupplies(suppliesResult.data || []);
    setSupplyStats(statsResult);
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    const data = await getAnalyticsDashboard();
    setAnalyticsData(data);
    setLoadingAnalytics(false);
  };

  // Generate quote/invoice text for sharing
  const generateQuoteText = (booking: BookingWithDetails, type: 'quote' | 'invoice') => {
    const services = booking.services?.map(s => s.name) || [];
    const suppliesList = supplies[booking.id] || [];
    const laborTotal = booking.invoice_amount || booking.ai_summary?.estimated_labor || 0;
    const materialsTotal = suppliesList.reduce((sum, s) => sum + (s.cost * s.quantity), 0) || booking.ai_summary?.estimated_materials || 0;
    const total = laborTotal + materialsTotal;
    
    const isInvoice = type === 'invoice';
    const title = isInvoice ? 'INVOICE' : 'SERVICE QUOTE';
    const dateLabel = isInvoice ? 'Service Date' : 'Scheduled Date';
    
    let text = `
═══════════════════════════════════
       FIXITSWELL HANDYMAN
         ${title}
═══════════════════════════════════

Customer: ${booking.client?.name || 'N/A'}
Phone: ${booking.client?.phone || 'N/A'}
Address: ${booking.client?.address || 'N/A'}
${dateLabel}: ${format(parseISO(booking.date), 'MMMM d, yyyy')}
Time: ${getTimeLabel(booking.time_slot)}

───────────────────────────────────
SERVICES
───────────────────────────────────
${services.length > 0 ? services.map(s => `• ${s}`).join('\n') : '• General handyman services'}

${booking.notes ? `\nNotes: ${booking.notes}` : ''}

───────────────────────────────────
${isInvoice ? 'CHARGES' : 'ESTIMATED COSTS'}
───────────────────────────────────
Labor: $${laborTotal.toFixed(2)}
${materialsTotal > 0 ? `Materials: $${materialsTotal.toFixed(2)}` : ''}
${suppliesList.length > 0 ? suppliesList.map(s => `  - ${s.item}: $${(s.cost * s.quantity).toFixed(2)}`).join('\n') : ''}

═══════════════════════════════════
TOTAL: $${total.toFixed(2)}
═══════════════════════════════════

${isInvoice ? 'Payment due upon completion.' : 'This is an estimate. Final price may vary.'}

Thank you for choosing FixitSwell!
Questions? Call us anytime.
───────────────────────────────────
    `.trim();
    
    return text;
  };

  // Handle creating a follow-up booking
  const handleCreateFollowUp = async () => {
    if (!followUpBooking || !followUpDate || !followUpTimeSlot) return;
    
    const { data, error } = await createManualBooking({
      name: followUpBooking.client?.name || '',
      email: followUpBooking.client?.email || '',
      phone: followUpBooking.client?.phone || '',
      address: followUpBooking.client?.address,
      community: followUpBooking.client?.community,
      date: format(followUpDate, 'yyyy-MM-dd'),
      time_slot: followUpTimeSlot,
      services: followUpBooking.services?.map(s => s.service?.name || s.name).filter(Boolean) || [],
      notes: followUpNotes || `Follow-up from ${format(parseISO(followUpBooking.date), 'MMM d')} booking`,
      booking_source: 'phone',
      follow_up_from: followUpBooking.id,
      is_follow_up: true
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Follow-up created", description: `Scheduled for ${format(followUpDate, 'MMM d, yyyy')} at ${followUpTimeSlot}` });
      setShowFollowUpDialog(false);
      setFollowUpBooking(null);
      setFollowUpDate(undefined);
      setFollowUpTimeSlot('');
      setFollowUpNotes('');
      setFollowUpAvailableSlots([]);
      setFollowUpDateBookings([]);
      loadBookings();
    }
  };

  // Load bookings and available slots when follow-up date changes
  const loadFollowUpDateInfo = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const { data: bookings } = await fetchBookingsForDate(dateStr);
    setFollowUpDateBookings(bookings || []);
    const slots = await getAvailableTimeSlots(dateStr);
    setFollowUpAvailableSlots(slots);
    // Pre-select the same time slot if available
    const availableSlotTimes = slots.filter(s => s.available).map(s => s.time);
    if (followUpBooking && availableSlotTimes.includes(followUpBooking.time_slot)) {
      setFollowUpTimeSlot(followUpBooking.time_slot);
    } else if (availableSlotTimes.length > 0) {
      setFollowUpTimeSlot(availableSlotTimes[0]);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Text copied to clipboard" });
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  const loadClientNotesFor = async (clientId: string) => {
    const { data } = await getClientNotes(clientId);
    setClientNotes(prev => ({ ...prev, [clientId]: data || [] }));
  };

  // Load subscriptions data
  const loadSubscriptions = async () => {
    const [subsResult, plansResult, statsResult] = await Promise.all([
      getAllSubscriptions(),
      getSubscriptionPlans(),
      getSubscriptionStats()
    ]);
    setSubscriptions(subsResult.data || []);
    setSubscriptionPlans(plansResult.data || []);
    setSubscriptionStats(statsResult);
  };

  // Create new subscription
  const handleCreateSubscription = async () => {
    if (!newSubscription.clientId || !newSubscription.planId || !newSubscription.price) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    
    const { error } = await createSubscription({
      client_id: newSubscription.clientId,
      plan_id: newSubscription.planId,
      monthly_price: parseInt(newSubscription.price)
    });
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Subscription created!" });
      setShowNewSubscription(false);
      setNewSubscription({ clientId: '', planId: '', price: '' });
      loadSubscriptions();
    }
  };

  // Update subscription status
  const handleSubscriptionStatusChange = async (subId: string, status: 'active' | 'paused' | 'cancelled', reason?: string) => {
    const { error } = await updateSubscriptionStatus(subId, status, reason);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Subscription ${status}` });
      loadSubscriptions();
    }
  };

  useEffect(() => {
    // Only load data after authentication is confirmed
    if (isAuthenticated) {
      loadBookings();
      loadContactMessages();
      loadClients();
      loadSubscriptions();
      loadMasterSupplies(); // Load supply stats for collapsed view header
      loadContractors(); // Load contractors for send job feature
      // Load all services for quick add dropdown
      getAllServicesForDropdown().then(({ data }) => {
        if (data) setAllServices(data);
      });
    }
  }, [statusFilter, isAuthenticated]);

  // Load supplies and notes when a booking is expanded
  useEffect(() => {
    if (expandedBooking) {
      loadSupplies(expandedBooking);
      loadBookingNotes(expandedBooking);
    }
  }, [expandedBooking]);

  // Date range filter helper
  const getDateRange = (filter: DateRangeFilter): { start: string; end: string } | null => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    switch (filter) {
      case 'past': {
        const pastStart = addDays(today, -365); // Last year
        const yesterday = addDays(today, -1);
        return { start: format(pastStart, 'yyyy-MM-dd'), end: format(yesterday, 'yyyy-MM-dd') };
      }
      case 'today':
        return { start: todayStr, end: todayStr };
      case 'week': {
        const weekEnd = addDays(today, 7);
        return { start: todayStr, end: format(weekEnd, 'yyyy-MM-dd') };
      }
      case 'month': {
        const monthEnd = addDays(today, 30);
        return { start: todayStr, end: format(monthEnd, 'yyyy-MM-dd') };
      }
      default:
        return null;
    }
  };

  // Get bookings for a specific date (for calendar view)
  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(b => b.date === dateStr);
  };

  // Get dates with bookings (for calendar highlighting)
  const datesWithBookings = bookings.reduce((acc, b) => {
    acc.add(b.date);
    return acc;
  }, new Set<string>());

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking['status']) => {
    setUpdatingId(bookingId);
    const { error } = await updateBookingStatus(bookingId, newStatus, 'staff');
    setUpdatingId(null);

    if (error) {
      console.error('Status update error:', error);
      toast({
        title: "Error updating booking",
        description: error.message || "Failed to update booking status. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Updated",
        description: `Booking marked as ${newStatus}`,
      });
      loadBookings();
    }
  };

  const handleNotesEdit = (booking: BookingWithDetails) => {
    setEditingNotes(booking.id);
    setNotesValue(booking.internal_notes || '');
  };

  const handleNotesSave = async (bookingId: string) => {
    // Prevent double saves
    if (savingNotes) return;
    
    setSavingNotes(true);
    const noteToSave = notesValue; // Capture current value
    
    try {
      const { error } = await updateBookingNotes(bookingId, noteToSave);

      if (error) {
        toast({
          title: "Error saving notes",
          description: error.message || "Failed to save notes. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Notes saved",
          description: "Internal notes have been updated.",
        });
        setEditingNotes(null);
        setNotesValue('');
        await loadBookings();
      }
    } finally {
      setSavingNotes(false);
    }
  };

  const handleNotesCancel = () => {
    setEditingNotes(null);
    setNotesValue('');
  };

  const getStatusBadge = (status: Booking['status'], cancelledBy?: 'customer' | 'staff' | null) => {
    const variants: Record<Booking['status'], { className: string; icon: React.ReactNode }> = {
      pending: { className: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <AlertCircle className="w-3 h-3" /> },
      confirmed: { className: 'bg-blue-100 text-blue-800 border-blue-300', icon: <CheckCircle className="w-3 h-3" /> },
      completed: { className: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle className="w-3 h-3" /> },
      cancelled: { className: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="w-3 h-3" /> },
      no_show: { className: 'bg-gray-100 text-gray-800 border-gray-300', icon: <XCircle className="w-3 h-3" /> },
    };
    
    // Custom label for cancelled status
    let label = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    if (status === 'cancelled' && cancelledBy) {
      label = cancelledBy === 'customer' ? 'Cancelled by Client' : 'Cancelled by Staff';
    }
    
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${variants[status].className}`}>
        {variants[status].icon}
        {label}
      </Badge>
    );
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return 'Past';
    return format(date, 'EEE, MMM d');
  };

  const getTimeLabel = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const filteredBookings = bookings.filter(booking => {
    // Filter by date range
    const dateRange = getDateRange(dateRangeFilter);
    if (dateRange) {
      if (booking.date < dateRange.start || booking.date > dateRange.end) {
        return false;
      }
    }

    // Filter by unpaid status (has invoice but not paid)
    if (statusFilter === 'unpaid') {
      if (!booking.invoice_amount || booking.invoice_status === 'paid') {
        return false;
      }
    }
    
    // Filter by needs invoice (completed but no invoice created)
    if (statusFilter === 'needs_invoice') {
      if (booking.status !== 'completed' || booking.invoice_amount) {
        return false;
      }
    }
    
    // Filter by needs attention (confirmed or completed with unpaid invoice, or completed with no invoice)
    if (statusFilter === 'needs_attention') {
      const hasUnpaidInvoice = booking.invoice_amount && booking.invoice_status !== 'paid';
      const isCompletedNoInvoice = booking.status === 'completed' && !booking.invoice_amount;
      
      // Show: confirmed/completed with unpaid invoice, OR completed with no invoice
      if (hasUnpaidInvoice && (booking.status === 'confirmed' || booking.status === 'completed')) {
        return true; // Keep this booking
      }
      if (isCompletedNoInvoice) {
        return true; // Keep this booking
      }
      return false; // Filter out everything else
    }
    
    // Filter by search query
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.client?.name?.toLowerCase().includes(query) ||
      booking.client?.email?.toLowerCase().includes(query) ||
      booking.client?.phone?.toLowerCase().includes(query) ||
      booking.client?.address?.toLowerCase().includes(query)
    );
  });

  // Sort and group bookings based on sortBy
  const sortedFilteredBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'created') {
      // Sort by created_at
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    } else {
      // Sort by scheduled date and time
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) {
        return sortOrder === 'asc' ? dateCompare : -dateCompare;
      }
      // If same date, sort by time
      const timeCompare = a.time_slot.localeCompare(b.time_slot);
      return sortOrder === 'asc' ? timeCompare : -timeCompare;
    }
  });

  // Group bookings by date (for scheduled) or show flat list (for created)
  const groupedBookings = sortBy === 'scheduled' 
    ? sortedFilteredBookings.reduce((acc, booking) => {
        const dateKey = booking.date;
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(booking);
        return acc;
      }, {} as Record<string, BookingWithDetails[]>)
    : { 'all': sortedFilteredBookings };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-heading">Admin Access</CardTitle>
              <p className="text-muted-foreground mt-1">Sign in with your admin account</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setLoginError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && document.getElementById('password')?.focus()}
                placeholder="admin@example.com"
                autoFocus
                disabled={loginLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter password"
                  className="pr-10"
                  disabled={loginLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {loginError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {loginError}
                </p>
              )}
            </div>
            <Button onClick={handleLogin} className="w-full" size="lg" disabled={loginLoading}>
              {loginLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Back to website
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <Home className="w-5 h-5" />
              </Link>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={showNewBooking} onOpenChange={setShowNewBooking}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Booking
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Booking</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Existing Client Selector */}
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <Label className="text-sm mb-2 block">Quick Select Existing Client</Label>
                      <Select
                        value=""
                        onValueChange={(clientId) => {
                          const client = clients.find(c => c.id === clientId);
                          if (client) {
                            setNewBooking(prev => ({
                              ...prev,
                              name: client.name,
                              email: client.email || '',
                              phone: client.phone || '',
                              address: client.address || '',
                              community: client.community || ''
                            }));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Search existing clients..." />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.slice(0, 20).map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              <span className="font-medium">{client.name}</span>
                              <span className="text-muted-foreground ml-2">
                                {client.phone || client.email || ''}
                              </span>
                            </SelectItem>
                          ))}
                          {clients.length > 20 && (
                            <SelectItem value="more" disabled>
                              ...and {clients.length - 20} more
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Customer Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-name">Name *</Label>
                        <Input
                          id="new-name"
                          value={newBooking.name}
                          onChange={(e) => setNewBooking(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-phone">Phone *</Label>
                        <Input
                          id="new-phone"
                          value={newBooking.phone}
                          onChange={(e) => setNewBooking(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-email">Email</Label>
                        <Input
                          id="new-email"
                          value={newBooking.email}
                          onChange={(e) => setNewBooking(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-address">Address</Label>
                        <Input
                          id="new-address"
                          value={newBooking.address}
                          onChange={(e) => setNewBooking(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="123 Main St, Lot 45"
                        />
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date *</Label>
                        <Calendar
                          mode="single"
                          selected={newBooking.date}
                          onSelect={handleNewBookingDateChange}
                          disabled={(date) => isBefore(date, startOfToday()) || isBefore(addDays(new Date(), 60), date)}
                          className="rounded-lg border p-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time *</Label>
                        {newBooking.date ? (
                          loadingSlots ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {availableSlots.map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() => slot.available && setNewBooking(prev => ({ ...prev, timeSlot: slot.time }))}
                                  disabled={!slot.available}
                                  className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                                    newBooking.timeSlot === slot.time
                                      ? 'border-primary bg-primary text-primary-foreground'
                                      : slot.available
                                        ? 'border-border hover:border-primary/50'
                                        : 'border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                                  }`}
                                >
                                  {slot.label}
                                </button>
                              ))}
                            </div>
                          )
                        ) : (
                          <p className="text-sm text-muted-foreground py-4">Select a date first</p>
                        )}
                      </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-2">
                      <Label>Services (type to search)</Label>
                      <Input
                        placeholder="Search services..."
                        value={newBookingServiceSearch}
                        onChange={(e) => setNewBookingServiceSearch(e.target.value)}
                        className="mb-2"
                      />
                      <div className="grid sm:grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                        {allServices
                          .filter(s => s.category === 'service' && 
                            (newBookingServiceSearch === '' || s.label.toLowerCase().includes(newBookingServiceSearch.toLowerCase())))
                          .slice(0, 20)
                          .map((service) => (
                          <label
                            key={service.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                              newBooking.services.includes(service.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/30'
                            }`}
                          >
                            <Checkbox
                              checked={newBooking.services.includes(service.id)}
                              onCheckedChange={() => handleNewBookingServiceToggle(service.id)}
                            />
                            <span className="text-xs leading-tight">{service.label}</span>
                          </label>
                        ))}
                      </div>
                      {newBooking.services.length > 0 && (
                        <p className="text-xs text-muted-foreground">{newBooking.services.length} service(s) selected</p>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="new-notes">Notes</Label>
                      <Textarea
                        id="new-notes"
                        value={newBooking.notes}
                        onChange={(e) => setNewBooking(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="What does the customer need help with?"
                        rows={3}
                      />
                    </div>

                    {/* Source */}
                    <div className="space-y-2">
                      <Label>Booking Source</Label>
                      <Select 
                        value={newBooking.source} 
                        onValueChange={(v: 'website' | 'phone' | 'in_person' | 'referral' | 'subscription' | 'other') => 
                          setNewBooking(prev => ({ ...prev, source: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">📞 Phone Call</SelectItem>
                          <SelectItem value="in_person">🏠 In Person</SelectItem>
                          <SelectItem value="website">🌐 Website</SelectItem>
                          <SelectItem value="referral">👥 Referral</SelectItem>
                          <SelectItem value="subscription">📋 Subscription</SelectItem>
                          <SelectItem value="other">📝 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => setShowNewBooking(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateBooking} disabled={newBookingLoading}>
                        {newBookingLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Create Booking
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              {/* Messages Notification */}
              <Button 
                onClick={() => {
                  setShowContactMessages(true);
                  setTimeout(() => {
                    document.getElementById('contact-messages-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }} 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 relative" 
                title="Contact Messages"
              >
                <Bell className="w-4 h-4" />
                {contactMessages.filter(m => m.status === 'new').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {contactMessages.filter(m => m.status === 'new').length}
                  </span>
                )}
              </Button>
              <Button onClick={() => setShowCalendarView(true)} variant="outline" size="icon" className="h-9 w-9" title="Calendar View">
                <CalendarIcon className="w-4 h-4" />
              </Button>
              <Button onClick={() => setShowContractors(true)} variant="outline" size="icon" className="h-9 w-9 relative" title="Contractors">
                <Users className="w-4 h-4" />
                {jobAssignments.filter(j => j.status === 'assigned').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {jobAssignments.filter(j => j.status === 'assigned').length}
                  </span>
                )}
              </Button>
              <Button onClick={loadBookings} variant="outline" size="icon" className="h-9 w-9" title="Refresh">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          {/* Auth Status Bar */}
          <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-border/50">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Authenticated
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-xs text-muted-foreground hover:text-destructive h-6 px-2"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Extended Stats - Simple inline display */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground border-b border-border pb-4">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-foreground">${extendedStats.revenueThisMonth.toFixed(0)}</span>
            <span>income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-foreground">${extendedStats.suppliesCostThisMonth.toFixed(0)}</span>
            <span>costs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-foreground">{extendedStats.jobsCompletedThisMonth}</span>
            <span>jobs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-foreground">${extendedStats.averageJobValue.toFixed(0)}</span>
            <span>avg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-foreground">{extendedStats.newClientsThisMonth}</span>
            <span>new clients</span>
          </div>
        </div>

        {/* Stats Cards - Clickable to filter */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${statusFilter === 'all' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card 
            className={`bg-yellow-50 border-yellow-200 cursor-pointer transition-all hover:scale-105 ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500 ring-offset-2' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
              <p className="text-sm text-yellow-600">Pending</p>
            </CardContent>
          </Card>
          <Card 
            className={`bg-blue-50 border-blue-200 cursor-pointer transition-all hover:scale-105 ${statusFilter === 'confirmed' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
            onClick={() => setStatusFilter('confirmed')}
          >
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{stats.confirmed}</p>
              <p className="text-sm text-blue-600">Confirmed</p>
            </CardContent>
          </Card>
          <Card 
            className={`bg-green-50 border-green-200 cursor-pointer transition-all hover:scale-105 ${statusFilter === 'completed' ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{stats.completed}</p>
              <p className="text-sm text-green-600">Completed</p>
            </CardContent>
          </Card>
          <Card 
            className={`bg-red-50 border-red-200 cursor-pointer transition-all hover:scale-105 ${statusFilter === 'cancelled' ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{stats.cancelled}</p>
              <p className="text-sm text-red-600">Cancelled</p>
            </CardContent>
          </Card>
          {/* Needs Attention Card - Shows completed jobs needing payment action */}
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              stats.needsAttention > 0 
                ? 'bg-orange-50 border-orange-300 border-2 animate-pulse' 
                : 'bg-gray-50 border-gray-200'
            } ${statusFilter === 'needs_attention' ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
            onClick={() => setStatusFilter('needs_attention')}
          >
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${stats.needsAttention > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                {stats.needsAttention}
              </p>
              <p className={`text-sm font-medium ${stats.needsAttention > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                💰 Needs Payment
              </p>
              {stats.needsAttention > 0 && (
                <div className="text-xs text-orange-500 mt-1 space-y-0.5">
                  {stats.unpaidConfirmed > 0 && <p>{stats.unpaidConfirmed} confirmed unpaid</p>}
                  {stats.completedUnpaid > 0 && <p>{stats.completedUnpaid} completed unpaid</p>}
                  {stats.completedNoInvoice > 0 && <p>{stats.completedNoInvoice} no invoice</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
          <Input
            placeholder="Search by name, email, phone, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:max-w-sm"
          />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="needs_attention">💰 Needs Payment Action</SelectItem>
              <SelectItem value="unpaid">💵 Unpaid Invoices</SelectItem>
              <SelectItem value="needs_invoice">⚠️ No Invoice Created</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setDateRangeFilter('all')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                dateRangeFilter === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-secondary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDateRangeFilter('past')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                dateRangeFilter === 'past' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-secondary'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setDateRangeFilter('today')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                dateRangeFilter === 'today' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-secondary'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateRangeFilter('week')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                dateRangeFilter === 'week' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-secondary'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setDateRangeFilter('month')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                dateRangeFilter === 'month' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-secondary'
              }`}
            >
              Month
            </button>
          </div>

          {/* Sort Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => { setSortBy('scheduled'); setSortOrder('asc'); }}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  sortBy === 'scheduled' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background hover:bg-secondary'
                }`}
              >
                Scheduled
              </button>
              <button
                onClick={() => { setSortBy('created'); setSortOrder('desc'); }}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  sortBy === 'created' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background hover:bg-secondary'
                }`}
              >
                Created
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-2"
              title={sortOrder === 'asc' ? 'Oldest first' : 'Newest first'}
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Bulk Selection Bar */}
        {filteredBookings.length > 0 && (
          <div className="flex items-center justify-between py-2 px-4 bg-secondary/30 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedBookings.size > 0 && selectedBookings.size === filteredBookings.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    selectAllVisible();
                  } else {
                    clearSelection();
                  }
                }}
              />
              <span className="text-sm text-muted-foreground">
                {selectedBookings.size === 0 
                  ? `Select all (${filteredBookings.length})` 
                  : `${selectedBookings.size} selected`}
              </span>
              {selectedBookings.size > 0 && selectedBookings.size < filteredBookings.length && (
                <Button variant="ghost" size="sm" onClick={selectAllVisible} className="text-xs h-7">
                  Select all {filteredBookings.length}
                </Button>
              )}
              {selectedBookings.size > 0 && (
                <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs h-7">
                  Clear
                </Button>
              )}
            </div>
            
            {/* Bulk Delete Button */}
            {selectedBookings.size > 0 && (
              <AlertDialog onOpenChange={(open) => { if (!open) setBulkDeleteConfirmText(''); }}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={bulkDeleting}>
                    {bulkDeleting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete {selectedBookings.size} Booking{selectedBookings.size > 1 ? 's' : ''}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-red-200">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Delete {selectedBookings.size} Booking{selectedBookings.size > 1 ? 's' : ''}?
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-3">
                        <p>Are you sure you want to <strong>permanently delete</strong> these bookings?</p>
                        <p className="text-red-600 font-medium">⚠️ This action cannot be undone!</p>
                        <div className="pt-2">
                          <Label htmlFor="delete-confirm" className="text-sm text-muted-foreground">
                            Type <span className="font-mono font-bold text-red-600">Delete</span> to confirm:
                          </Label>
                          <Input
                            id="delete-confirm"
                            value={bulkDeleteConfirmText}
                            onChange={(e) => setBulkDeleteConfirmText(e.target.value)}
                            placeholder="Delete"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setBulkDeleteConfirmText('')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={bulkDeleteConfirmText !== 'Delete'}
                    >
                      Yes, Delete All Selected
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}

        {/* Bookings List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No bookings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedBookings)
              .sort(([a], [b]) => {
                if (sortBy === 'created') return 0; // Don't sort groups for created view
                return sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
              })
              .map(([dateKey, dateBookings]) => (
                <div key={dateKey}>
                  {sortBy === 'scheduled' ? (
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-primary" />
                      {getDateLabel(dateKey)}
                      <span className="text-muted-foreground font-normal">
                        ({format(parseISO(dateKey), 'EEEE, MMMM d, yyyy')})
                      </span>
                      <Badge variant="secondary" className="ml-2">{dateBookings.length}</Badge>
                    </h3>
                  ) : (
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-primary" />
                      All Bookings by Date Created
                      <span className="text-muted-foreground font-normal">
                        ({sortOrder === 'desc' ? 'Newest first' : 'Oldest first'})
                      </span>
                      <Badge variant="secondary" className="ml-2">{dateBookings.length}</Badge>
                    </h3>
                  )}
                  
                  <div className="space-y-3">
                    {dateBookings.map((booking) => (
                      <Card 
                        key={booking.id}
                        id={`booking-${booking.id}`}
                        className={`overflow-hidden border-l-4 ${
                          booking.status === 'pending' ? 'border-l-yellow-500 bg-yellow-50/30' :
                          booking.status === 'confirmed' ? 'border-l-blue-500 bg-blue-50/30' :
                          booking.status === 'completed' ? 'border-l-green-500 bg-green-50/30' :
                          booking.status === 'cancelled' ? 'border-l-red-500 bg-red-50/30' :
                          booking.status === 'no_show' ? 'border-l-gray-500 bg-gray-50/30' : ''
                        }`}
                      >
                        <div 
                          className="p-2 sm:p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                          onClick={async () => {
                            setExpandedBooking(booking.id);
                            // Load time entries when opening
                            const { data: entries } = await getTimeEntries(booking.id);
                            setTimeEntries(prev => ({ ...prev, [booking.id]: entries }));
                            const { data: active } = await getActiveTimeEntry(booking.id);
                            setActiveTimers(prev => ({ ...prev, [booking.id]: active }));
                          }}
                        >
                              <div className="flex items-start sm:items-center justify-between gap-2">
                                {/* Left side - Main info */}
                                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                  {/* Selection Checkbox */}
                                  <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                                    <Checkbox
                                      checked={selectedBookings.has(booking.id)}
                                      onCheckedChange={() => toggleBookingSelection(booking.id)}
                                    />
                                  </div>
                                  {/* Time - compact on mobile */}
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                    <span className="font-medium text-sm sm:text-base whitespace-nowrap">{booking.time_slot}</span>
                                  </div>
                                  {/* Client name */}
                                  <div className="flex items-center gap-1 min-w-0">
                                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                                    <span className="font-medium text-sm sm:text-base truncate">{booking.client?.name || 'Unknown'}</span>
                                  </div>
                                  {/* Follow-up indicator - mobile friendly button */}
                                  {booking.is_follow_up && booking.follow_up_from && (
                                    <button 
                                      className="flex-shrink-0 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-1 hover:bg-blue-100 active:bg-blue-200 touch-manipulation select-none"
                                      style={{ WebkitTapHighlightColor: 'transparent' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setExpandedBooking(booking.follow_up_from!);
                                      }}
                                      onTouchStart={(e) => {
                                        e.stopPropagation();
                                      }}
                                      onTouchEnd={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setExpandedBooking(booking.follow_up_from!);
                                      }}
                                    >
                                      <RotateCcw className="w-3 h-3 inline mr-0.5" />
                                      <span className="hidden sm:inline">View </span>Original
                                    </button>
                                  )}
                                  {/* Desktop only info */}
                                  {sortBy === 'created' && (
                                    <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground">
                                      <CalendarDays className="w-3 h-3" />
                                      <span>{format(parseISO(booking.date), 'MMM d')}</span>
                                    </div>
                                  )}
                                  {booking.client?.address && (
                                    <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
                                      <MapPin className="w-4 h-4" />
                                      <span className="text-sm truncate max-w-[200px]">{booking.client.address}</span>
                                    </div>
                                  )}
                                </div>
                                {/* Right side - Badges */}
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 flex-wrap justify-end max-w-[45%] sm:max-w-none">
                                  {/* Payment Status Indicator */}
                                  {booking.invoice_amount ? (
                                    booking.invoice_status === 'paid' ? (
                                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                                        💵 Paid {booking.payment_method && `(${booking.payment_method})`}
                                      </Badge>
                                    ) : booking.payment_pending_collection ? (
                                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs animate-pulse">
                                        {booking.payment_method === 'check' ? '📝' : '💵'} Collect ${booking.invoice_amount}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs animate-pulse">
                                        💰 ${booking.invoice_amount} due
                                      </Badge>
                                    )
                                  ) : booking.status === 'completed' ? (
                                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs animate-pulse">
                                      ⚠️ No Invoice
                                    </Badge>
                                  ) : null}
                                  {getStatusBadge(booking.status, booking.cancelled_by)}
                                  {booking.is_follow_up && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs flex items-center gap-1">
                                      <RotateCcw className="w-3 h-3" />
                                      <span className="hidden sm:inline">Follow-up</span>
                                      <span className="sm:hidden">F/U</span>
                                    </Badge>
                                  )}
                                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                                </div>
                              </div>
                              
                              {/* Services preview - hidden on mobile in collapsed view */}
                              {booking.services && booking.services.length > 0 && (
                                <div className="mt-2 hidden sm:flex flex-wrap gap-1">
                                  {booking.services.slice(0, 3).map((s, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {s.service?.name || 'Service'}
                                    </Badge>
                                  ))}
                                  {booking.services.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{booking.services.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                        </div>
                        
                        {/* Booking Details Modal */}
                          <Dialog open={expandedBooking === booking.id} onOpenChange={(open) => setExpandedBooking(open ? booking.id : null)}>
                            <DialogContent className={`w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden border-l-4 ${
                              booking.status === 'pending' ? 'border-l-yellow-500' :
                              booking.status === 'confirmed' ? 'border-l-blue-500' :
                              booking.status === 'completed' ? 'border-l-green-500' :
                              booking.status === 'cancelled' ? 'border-l-red-500' :
                              booking.status === 'no_show' ? 'border-l-gray-500' : ''
                            } [&_*]:max-w-full [&_input]:min-w-0 [&_textarea]:min-w-0`}>
                              <DialogHeader className={`pb-3 border-b ${
                                booking.status === 'pending' ? 'border-yellow-200 bg-yellow-50/50' :
                                booking.status === 'confirmed' ? 'border-blue-200 bg-blue-50/50' :
                                booking.status === 'completed' ? 'border-green-200 bg-green-50/50' :
                                booking.status === 'cancelled' ? 'border-red-200 bg-red-50/50' :
                                booking.status === 'no_show' ? 'border-gray-200 bg-gray-50/50' : ''
                              } -mx-6 -mt-6 px-6 pt-6 rounded-t-lg`}>
                                <DialogTitle className="flex items-center gap-2">
                                  <CalendarDays className="w-5 h-5" />
                                  {booking.client?.name} - {format(parseISO(booking.date), 'MMM d, yyyy')} @ {booking.time_slot}
                                  {getStatusBadge(booking.status, booking.cancelled_by)}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6 w-full min-w-0">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Client Details */}
                                <div className="space-y-3">
                                  <h4 className="font-heading font-semibold text-foreground flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Client Details
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <p className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-muted-foreground" />
                                      {booking.client?.name || 'Unknown'}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Phone className="w-4 h-4 text-muted-foreground" />
                                      <a href={`tel:${booking.client?.phone}`} className="text-primary hover:underline">
                                        {booking.client?.phone || 'No phone'}
                                      </a>
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Mail className="w-4 h-4 text-muted-foreground" />
                                      <a href={`mailto:${booking.client?.email}`} className="text-primary hover:underline">
                                        {booking.client?.email || 'No email'}
                                      </a>
                                    </p>
                                    {booking.client?.address && (
                                      <p className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                        <span>
                                          {booking.client.address}
                                          {booking.client.community && (
                                            <span className="block text-muted-foreground">{booking.client.community}</span>
                                          )}
                                        </span>
                                      </p>
                                    )}
                                    
                                    {/* Pet Info Section */}
                                    {booking.client && (
                                      <div className="mt-3 pt-3 border-t border-border">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">🐾 Pet Info</p>
                                        {editingPetInfo === booking.client.id ? (
                                          <div className="space-y-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                            <div className="flex items-center gap-2">
                                              <Checkbox 
                                                checked={petInfoForm.has_pets}
                                                onCheckedChange={(checked) => 
                                                  setPetInfoForm(prev => ({ ...prev, has_pets: !!checked }))
                                                }
                                              />
                                              <span className="text-sm">Has pets</span>
                                            </div>
                                            {petInfoForm.has_pets && (
                                              <>
                                                <div className="grid grid-cols-2 gap-2">
                                                  <div>
                                                    <label className="text-xs text-muted-foreground">Dogs</label>
                                                    <Input 
                                                      type="number" 
                                                      min="0" 
                                                      value={petInfoForm.dogs}
                                                      onChange={(e) => setPetInfoForm(prev => ({ ...prev, dogs: parseInt(e.target.value) || 0 }))}
                                                      className="h-8"
                                                    />
                                                  </div>
                                                  <div>
                                                    <label className="text-xs text-muted-foreground">Cats</label>
                                                    <Input 
                                                      type="number" 
                                                      min="0" 
                                                      value={petInfoForm.cats}
                                                      onChange={(e) => setPetInfoForm(prev => ({ ...prev, cats: parseInt(e.target.value) || 0 }))}
                                                      className="h-8"
                                                    />
                                                  </div>
                                                </div>
                                                <div>
                                                  <label className="text-xs text-muted-foreground">Pet Names</label>
                                                  <Input 
                                                    value={petInfoForm.names}
                                                    onChange={(e) => setPetInfoForm(prev => ({ ...prev, names: e.target.value }))}
                                                    placeholder="e.g., Buddy, Whiskers"
                                                    className="h-8"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="text-xs text-muted-foreground">Breeds</label>
                                                  <Input 
                                                    value={petInfoForm.breeds}
                                                    onChange={(e) => setPetInfoForm(prev => ({ ...prev, breeds: e.target.value }))}
                                                    placeholder="e.g., Golden Retriever, Tabby"
                                                    className="h-8"
                                                  />
                                                </div>
                                              </>
                                            )}
                                            <div className="flex gap-2 pt-1">
                                              <Button size="sm" onClick={() => handleSavePetInfo(booking.client!.id)}>
                                                Save
                                              </Button>
                                              <Button size="sm" variant="outline" onClick={() => setEditingPetInfo(null)}>
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div 
                                            className="text-sm cursor-pointer hover:bg-secondary/50 p-2 rounded-lg transition-colors"
                                            onClick={() => startEditingPetInfo(booking.client!.id, booking.client!.pet_info)}
                                          >
                                            {booking.client.pet_info?.has_pets ? (
                                              <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                  {booking.client.pet_info.dogs > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                      🐕 {booking.client.pet_info.dogs} dog{booking.client.pet_info.dogs > 1 ? 's' : ''}
                                                    </Badge>
                                                  )}
                                                  {booking.client.pet_info.cats > 0 && (
                                                    <Badge variant="outline" className="text-xs">
                                                      🐈 {booking.client.pet_info.cats} cat{booking.client.pet_info.cats > 1 ? 's' : ''}
                                                    </Badge>
                                                  )}
                                                </div>
                                                {booking.client.pet_info.names && (
                                                  <p className="text-xs text-muted-foreground">
                                                    Names: {booking.client.pet_info.names}
                                                  </p>
                                                )}
                                                {booking.client.pet_info.breeds && (
                                                  <p className="text-xs text-muted-foreground">
                                                    Breeds: {booking.client.pet_info.breeds}
                                                  </p>
                                                )}
                                              </div>
                                            ) : (
                                              <span className="text-muted-foreground italic">Click to add pet info</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Services Checklist */}
                                <div className="space-y-3">
                                  <h4 className="font-heading font-semibold text-foreground flex items-center gap-2">
                                    <Wrench className="w-4 h-4" />
                                    Services Checklist
                                    {booking.services && booking.services.length > 0 && (
                                      <span className="text-sm font-normal text-muted-foreground">
                                        ({(booking.completed_services || []).length}/{booking.services.length} done)
                                      </span>
                                    )}
                                  </h4>
                                  {booking.services && booking.services.length > 0 ? (
                                    <ul className="space-y-2 text-sm">
                                      {booking.services.map((s, i) => {
                                        const serviceId = s.service?.id || s.service?.name || `service-${i}`;
                                        const isCompleted = (booking.completed_services || []).includes(serviceId);
                                        return (
                                          <li 
                                            key={i} 
                                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors group ${
                                              isCompleted 
                                                ? 'bg-green-50 border border-green-200' 
                                                : 'bg-background border border-border hover:border-primary/50'
                                            }`}
                                          >
                                            <div 
                                              className="flex items-center gap-3 flex-1 cursor-pointer"
                                              onClick={async () => {
                                                await toggleServiceCompletion(booking.id, serviceId);
                                                loadBookings();
                                              }}
                                            >
                                              <Checkbox 
                                                checked={isCompleted}
                                                className={isCompleted ? 'bg-green-600 border-green-600' : ''}
                                              />
                                              <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>
                                                {s.service?.name || 'Service'}
                                              </span>
                                            </div>
                                            {isCompleted && (
                                              <CheckCircle className="w-4 h-4 text-green-600" />
                                            )}
                                            {s.service?.id && (
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleRemoveService(booking.id, s.service!.id);
                                                }}
                                              >
                                                <X className="w-3 h-3" />
                                              </Button>
                                            )}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No services selected</p>
                                  )}
                                  
                                  {/* Quick Add Service */}
                                  <div className="relative">
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Quick add service..."
                                        value={quickServiceInput[booking.id] || ''}
                                        onChange={(e) => {
                                          setQuickServiceInput(prev => ({ ...prev, [booking.id]: e.target.value }));
                                          if (e.target.value.length > 0) {
                                            setShowServiceSuggestions(booking.id);
                                          } else {
                                            setShowServiceSuggestions(null);
                                          }
                                        }}
                                        onFocus={() => {
                                          if ((quickServiceInput[booking.id] || '').length > 0) {
                                            setShowServiceSuggestions(booking.id);
                                          }
                                        }}
                                        onBlur={() => {
                                          // Delay to allow click on suggestion
                                          setTimeout(() => setShowServiceSuggestions(null), 200);
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && quickServiceInput[booking.id]?.trim()) {
                                            e.preventDefault();
                                            handleQuickAddService(booking.id, quickServiceInput[booking.id]);
                                          }
                                        }}
                                        className="text-sm"
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() => handleQuickAddService(booking.id, quickServiceInput[booking.id] || '')}
                                        disabled={!quickServiceInput[booking.id]?.trim()}
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    
                                    {/* Autocomplete Suggestions */}
                                    {showServiceSuggestions === booking.id && (quickServiceInput[booking.id] || '').length > 0 && (
                                      <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {getServiceSuggestions(quickServiceInput[booking.id] || '', booking.services || []).slice(0, 8).map((opt) => (
                                          <button
                                            key={opt.id}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                              handleQuickAddService(booking.id, opt.id);
                                            }}
                                          >
                                            {opt.label}
                                          </button>
                                        ))}
                                        {getServiceSuggestions(quickServiceInput[booking.id] || '', booking.services || []).length === 0 && (
                                          <div className="px-3 py-2 text-sm text-muted-foreground">
                                            Press Enter to add as custom service
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {booking.notes && (
                                    <div className="mt-3">
                                      <h5 className="text-sm font-medium text-muted-foreground">Customer Notes:</h5>
                                      <p className="text-sm mt-1 p-2 bg-background rounded border">
                                        {booking.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Customer Manage Link */}
                              <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                                  <LinkIcon className="w-4 h-4 text-primary" />
                                  Customer Self-Service Link
                                </h4>
                                <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
                                  <code className="text-xs text-muted-foreground flex-1 truncate">
                                    {window.location.origin}/manage/{booking.manage_token}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2"
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${window.location.origin}/manage/${booking.manage_token}`);
                                      toast({ title: "Link copied to clipboard" });
                                    }}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2"
                                    asChild
                                  >
                                    <a href={`/manage/${booking.manage_token}`} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Share this link with the customer to let them view/edit their booking
                                </p>
                              </div>

                              {/* AI Summary Section (populated by n8n workflow) */}
                              {booking.ai_summary ? (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <h4 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <span className="text-lg">🤖</span>
                                    AI Estimate
                                    {booking.ai_summary.complexity && (
                                      <Badge variant={
                                        booking.ai_summary.complexity === 'simple' ? 'secondary' :
                                        booking.ai_summary.complexity === 'medium' ? 'default' : 'destructive'
                                      } className="ml-2 text-xs">
                                        {booking.ai_summary.complexity}
                                      </Badge>
                                    )}
                                  </h4>
                                  <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg space-y-3">
                                    {booking.ai_summary.summary && (
                                      <p className="text-sm text-foreground">{booking.ai_summary.summary}</p>
                                    )}
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                      {booking.ai_summary.estimated_hours !== undefined && (
                                        <div className="p-2 bg-white/80 rounded">
                                          <p className="text-lg font-bold text-primary">{booking.ai_summary.estimated_hours}h</p>
                                          <p className="text-xs text-muted-foreground">Est. Time</p>
                                        </div>
                                      )}
                                      {booking.ai_summary.estimated_labor !== undefined && (
                                        <div className="p-2 bg-white/80 rounded">
                                          <p className="text-lg font-bold text-primary">${booking.ai_summary.estimated_labor}</p>
                                          <p className="text-xs text-muted-foreground">Labor</p>
                                        </div>
                                      )}
                                      {booking.ai_summary.estimated_total !== undefined && (
                                        <div className="p-2 bg-white/80 rounded">
                                          <p className="text-lg font-bold text-green-600">${booking.ai_summary.estimated_total}</p>
                                          <p className="text-xs text-muted-foreground">Total Est.</p>
                                        </div>
                                      )}
                                    </div>
                                    {booking.ai_summary.skills_needed && booking.ai_summary.skills_needed.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {booking.ai_summary.skills_needed.map((skill, i) => (
                                          <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                                        ))}
                                      </div>
                                    )}
                                    {booking.ai_summary.notes && (
                                      <p className="text-xs text-muted-foreground italic">{booking.ai_summary.notes}</p>
                                    )}
                                    {booking.ai_summary.generated_at && (
                                      <p className="text-xs text-muted-foreground">
                                        Generated {format(parseISO(booking.ai_summary.generated_at), 'MMM d, h:mm a')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <div className="p-4 bg-secondary/30 border border-dashed border-border rounded-lg text-center">
                                    <span className="text-2xl mb-2 block">🤖</span>
                                    <p className="text-sm text-muted-foreground">
                                      AI estimate will appear here after n8n workflow processes this booking
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Staff Notes Section - Individual Notes */}
                              <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                  Staff Notes ({(bookingNotes[booking.id] || []).length})
                                </h4>
                                
                                {/* Existing Notes List */}
                                <div className="space-y-2 mb-3">
                                  {(bookingNotes[booking.id] || []).length > 0 ? (
                                    (bookingNotes[booking.id] || []).map((note) => (
                                      <div 
                                        key={note.id} 
                                        className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg group"
                                      >
                                        {editingNoteId === note.id ? (
                                          <div className="space-y-2">
                                            <Textarea
                                              value={editingNoteContent}
                                              onChange={(e) => setEditingNoteContent(e.target.value)}
                                              rows={2}
                                              className="text-sm"
                                            />
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                onClick={() => handleUpdateNote(note.id, booking.id)}
                                              >
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Save
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                  setEditingNoteId(null);
                                                  setEditingNoteContent('');
                                                }}
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <p className="text-sm">{note.content}</p>
                                            <div className="flex items-center justify-between mt-2">
                                              <span className="text-xs text-muted-foreground">
                                                {format(parseISO(note.created_at), 'MMM d, h:mm a')}
                                              </span>
                                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-6 px-2"
                                                  onClick={() => {
                                                    setEditingNoteId(note.id);
                                                    setEditingNoteContent(note.content);
                                                  }}
                                                >
                                                  <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-6 px-2 text-red-500 hover:text-red-700"
                                                  onClick={() => handleDeleteNote(note.id, booking.id)}
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground italic">No notes yet</p>
                                  )}
                                </div>

                                {/* Add New Note */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Input
                                    className="flex-1 min-w-0"
                                    placeholder="Add a note..."
                                    value={newNoteContent[booking.id] || ''}
                                    onChange={(e) => setNewNoteContent(prev => ({ 
                                      ...prev, 
                                      [booking.id]: e.target.value 
                                    }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddNote(booking.id);
                                      }
                                    }}
                                    className="text-sm"
                                  />
                                  {/* Voice Recording Button */}
                                  <Button
                                    size="sm"
                                    variant={isRecording && recordingFor?.bookingId === booking.id && recordingFor?.field === 'internal' ? 'destructive' : 'outline'}
                                    onClick={() => {
                                      if (isRecording && recordingFor?.bookingId === booking.id) {
                                        stopVoiceRecording();
                                      } else {
                                        startVoiceRecording(booking.id, 'internal');
                                      }
                                    }}
                                    title="Voice to text"
                                  >
                                    {isRecording && recordingFor?.bookingId === booking.id && recordingFor?.field === 'internal' ? (
                                      <MicOff className="w-4 h-4" />
                                    ) : (
                                      <Mic className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddNote(booking.id)}
                                    disabled={!newNoteContent[booking.id]?.trim()}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Future Repairs Suggestions */}
                              <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <Wrench className="w-4 h-4 text-orange-500" />
                                  Future Repair Suggestions
                                </h4>
                                
                                {/* Existing Suggestions */}
                                <div className="space-y-2 mb-3">
                                  {(booking.future_repairs || []).length > 0 ? (
                                    (booking.future_repairs || []).map((repair, idx) => (
                                      <div 
                                        key={idx}
                                        className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded-lg text-sm group"
                                      >
                                        <span>{repair}</span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 px-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                                          onClick={() => handleRemoveFutureRepair(booking.id, idx)}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground italic">No suggestions yet</p>
                                  )}
                                </div>

                                {/* Add New Suggestion */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Input
                                    className="flex-1 min-w-0"
                                    placeholder="Add future repair suggestion..."
                                    value={newRepairContent[booking.id] || ''}
                                    onChange={(e) => setNewRepairContent(prev => ({ 
                                      ...prev, 
                                      [booking.id]: e.target.value 
                                    }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddFutureRepair(booking.id);
                                      }
                                    }}
                                    className="text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddFutureRepair(booking.id)}
                                    disabled={!newRepairContent[booking.id]?.trim()}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Images Section */}
                              <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4 text-primary" />
                                  Photos ({(booking.images || []).length})
                                </h4>
                                
                                {/* Image Grid */}
                                {booking.images && booking.images.length > 0 ? (
                                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
                                    {booking.images.map((url, idx) => (
                                      <Dialog key={idx}>
                                        <DialogTrigger asChild>
                                          <button className="aspect-square rounded-lg overflow-hidden bg-gray-100 border hover:border-primary transition-colors cursor-pointer">
                                            <img
                                              src={url}
                                              alt={`Photo ${idx + 1}`}
                                              className="w-full h-full object-cover"
                                            />
                                          </button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl">
                                          <img
                                            src={url}
                                            alt={`Photo ${idx + 1}`}
                                            className="w-full h-auto rounded-lg"
                                          />
                                        </DialogContent>
                                      </Dialog>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground italic mb-3">No photos uploaded</p>
                                )}

                                {/* Upload Button */}
                                <input
                                  ref={activeUploadBookingId === booking.id ? fileInputRef : undefined}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleAdminImageUpload(e, booking)}
                                  className="hidden"
                                  id={`upload-${booking.id}`}
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setActiveUploadBookingId(booking.id);
                                    setTimeout(() => {
                                      document.getElementById(`upload-${booking.id}`)?.click();
                                    }, 0);
                                  }}
                                  disabled={uploadingImageFor === booking.id}
                                >
                                  {uploadingImageFor === booking.id ? (
                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    <ImagePlus className="w-4 h-4 mr-1" />
                                  )}
                                  {uploadingImageFor === booking.id ? 'Uploading...' : 'Add Photos'}
                                </Button>
                              </div>

                              {/* Invoice & Supplies Section */}
                              <div className="mt-4 pt-4 border-t border-border space-y-4">
                                <h4 className="font-heading font-semibold text-foreground flex items-center gap-2">
                                  Invoice & Supplies
                                </h4>
                                
                                {/* Invoice Status */}
                                {booking.invoice_status === 'none' || !booking.invoice_amount ? (
                                  // Create Invoice Form
                                  invoiceBookingId === booking.id ? (
                                    <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
                                      <div className="grid sm:grid-cols-2 gap-3">
                                        <div>
                                          <Label htmlFor={`invoice-${booking.id}`} className="text-sm">Invoice Amount ($)</Label>
                                          <Input
                                            id={`invoice-${booking.id}`}
                                            type="number"
                                            step="0.01"
                                            value={invoiceAmount}
                                            onChange={(e) => setInvoiceAmount(e.target.value)}
                                            placeholder="150.00"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor={`deposit-${booking.id}`} className="text-sm">Deposit Amount (optional)</Label>
                                          <Input
                                            id={`deposit-${booking.id}`}
                                            type="number"
                                            step="0.01"
                                            value={depositAmount}
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                            placeholder="50.00"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => handleCreateInvoice(booking.id)}
                                          disabled={creatingInvoice}
                                        >
                                          {creatingInvoice ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                                          Create Invoice
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setInvoiceBookingId(null)}>
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <Button size="sm" variant="outline" onClick={() => setInvoiceBookingId(booking.id)}>
                                      Create Invoice
                                    </Button>
                                  )
                                ) : (
                                  // Show Invoice Details
                                  <div className="p-4 bg-secondary/50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      {editingInvoiceId === booking.id ? (
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm">$</span>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            value={editInvoiceAmount}
                                            onChange={(e) => setEditInvoiceAmount(e.target.value)}
                                            className="w-24 h-8"
                                            placeholder={booking.invoice_amount?.toString()}
                                          />
                                          <Button size="sm" onClick={() => handleUpdateInvoiceAmount(booking.id)}>Save</Button>
                                          <Button size="sm" variant="outline" onClick={() => { setEditingInvoiceId(null); setEditInvoiceAmount(''); }}>Cancel</Button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">Invoice: ${booking.invoice_amount?.toFixed(2)}</span>
                                          {booking.invoice_status !== 'paid' && (
                                            <Button 
                                              size="sm" 
                                              variant="ghost" 
                                              className="h-6 px-2 text-xs"
                                              onClick={() => {
                                                setEditingInvoiceId(booking.id);
                                                setEditInvoiceAmount(booking.invoice_amount?.toString() || '');
                                              }}
                                            >
                                              Edit
                                            </Button>
                                          )}
                                        </div>
                                      )}
                                      <Badge variant={booking.invoice_status === 'paid' ? 'default' : 'secondary'} className={booking.invoice_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                                        {booking.invoice_status === 'paid' ? '✓ Paid' : booking.invoice_status === 'partial' ? 'Partial' : 'Pending'}
                                      </Badge>
                                    </div>
                                    {booking.deposit_amount && (
                                      <p className="text-sm text-muted-foreground">
                                        Deposit: ${booking.deposit_amount.toFixed(2)}
                                        {booking.deposit_paid_at ? ' (Paid)' : ' (Unpaid)'}
                                      </p>
                                    )}
                                    {/* Payment Method Info */}
                                    {booking.payment_method && booking.invoice_status !== 'paid' && (
                                      <p className="text-sm text-blue-600 font-medium mt-1">
                                        Customer selected: {booking.payment_method === 'check' ? '📝 Check' : booking.payment_method === 'cash' ? '💵 Cash' : '💳 Card'}
                                      </p>
                                    )}
                                    {/* Payment Actions */}
                                    {booking.invoice_status !== 'paid' && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {booking.payment_pending_collection ? (
                                          // Show "Collected" button for pending cash/check with confirmation
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                {booking.payment_method === 'check' ? 'Check Collected' : 'Cash Collected'}
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Confirm Payment Collection</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  <p className="mb-3">Confirm you have collected <strong>${booking.invoice_amount?.toFixed(2)}</strong> via <strong>{booking.payment_method}</strong> from <strong>{booking.client?.name}</strong>?</p>
                                                  <p className="text-sm text-muted-foreground">This will mark the invoice as paid.</p>
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() => handleCollectPayment(booking.id, booking.payment_method as 'check' | 'cash')}
                                                  className="bg-green-600 hover:bg-green-700"
                                                >
                                                  Yes, Payment Collected
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        ) : (
                                          // Show all payment options with confirmations
                                          <>
                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="outline">💵 Collected Cash</Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>Confirm Cash Payment</AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                    Confirm you collected <strong>${booking.invoice_amount?.toFixed(2)} cash</strong> from <strong>{booking.client?.name}</strong>?
                                                  </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                  <AlertDialogAction onClick={() => handleCollectPayment(booking.id, 'cash')} className="bg-green-600">
                                                    Yes, Cash Collected
                                                  </AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="outline">📝 Collected Check</Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>Confirm Check Payment</AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                    Confirm you collected a <strong>${booking.invoice_amount?.toFixed(2)} check</strong> from <strong>{booking.client?.name}</strong>?
                                                  </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                  <AlertDialogAction onClick={() => handleCollectPayment(booking.id, 'check')} className="bg-green-600">
                                                    Yes, Check Collected
                                                  </AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="outline">💳 Paid by Card</Button>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>Confirm Card Payment</AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                    Confirm <strong>${booking.invoice_amount?.toFixed(2)}</strong> was paid by card (Stripe) by <strong>{booking.client?.name}</strong>?
                                                  </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                  <AlertDialogAction onClick={() => handleMarkPaid(booking.id)} className="bg-green-600">
                                                    Yes, Card Payment Received
                                                  </AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Time Entries Section */}
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium flex items-center gap-2">
                                      <Timer className="w-4 h-4 text-blue-600" />
                                      Time Tracking:
                                      {booking.actual_duration_minutes != null && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                          Total: {Math.floor(booking.actual_duration_minutes / 60)}h {booking.actual_duration_minutes % 60}m
                                        </Badge>
                                      )}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={async () => {
                                        const { data: entries } = await getTimeEntries(booking.id);
                                        setTimeEntries(prev => ({ ...prev, [booking.id]: entries }));
                                        const { data: active } = await getActiveTimeEntry(booking.id);
                                        setActiveTimers(prev => ({ ...prev, [booking.id]: active }));
                                      }}
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  {timeEntries[booking.id]?.length > 0 ? (
                                    <div className="space-y-1 bg-blue-50/50 rounded-lg p-2">
                                      {timeEntries[booking.id].map((entry, idx) => (
                                        <div key={entry.id} className="flex items-center justify-between text-sm bg-white rounded px-2 py-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">#{idx + 1}</span>
                                            <span>{format(parseISO(entry.started_at), 'h:mm a')}</span>
                                            <span className="text-muted-foreground">→</span>
                                            {entry.stopped_at ? (
                                              <>
                                                <span>{format(parseISO(entry.stopped_at), 'h:mm a')}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                  {entry.duration_minutes}m
                                                </Badge>
                                              </>
                                            ) : (
                                              <Badge className="bg-orange-500 text-white text-xs animate-pulse">
                                                Running...
                                              </Badge>
                                            )}
                                          </div>
                                          {entry.stopped_at && (
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                              onClick={async () => {
                                                await deleteTimeEntry(entry.id, booking.id);
                                                const { data: entries } = await getTimeEntries(booking.id);
                                                setTimeEntries(prev => ({ ...prev, [booking.id]: entries }));
                                                await loadBookings();
                                                toast({ title: "Deleted", description: "Time entry removed" });
                                              }}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground italic">No time entries recorded yet. Click "Start Timer" to begin.</p>
                                  )}
                                </div>

                                {/* Supplies List */}
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Materials/Supplies:</span>
                                    {addingSupply !== booking.id && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setAddingSupply(booking.id);
                                          loadSupplies(booking.id);
                                        }}
                                      >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add
                                      </Button>
                                    )}
                                  </div>
                                  
                                  {supplies[booking.id]?.length > 0 && (
                                    <ul className="space-y-1 mb-2">
                                      {supplies[booking.id].map(supply => (
                                        <li key={supply.id} className="flex flex-wrap items-center justify-between gap-1 text-sm p-2 bg-white rounded border">
                                          <div className="min-w-0 flex-1">
                                            <span className="font-medium break-words">{supply.item}</span>
                                            <span className="text-muted-foreground text-xs"> ×{supply.quantity} — ${supply.cost.toFixed(2)}</span>
                                            {(supply.store_name || supply.receipt_number) && (
                                              <p className="text-xs text-muted-foreground">
                                                {supply.store_name && <span>📍 {supply.store_name}</span>}
                                                {supply.receipt_number && <span className="ml-2">🧾 #{supply.receipt_number}</span>}
                                              </p>
                                            )}
                                          </div>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                            onClick={() => handleDeleteSupply(supply.id, booking.id)}
                                          >
                                            <X className="w-4 h-4" />
                                          </Button>
                                        </li>
                                      ))}
                                      <li className="text-sm font-medium pt-1 border-t">
                                        Total: ${supplies[booking.id].reduce((sum, s) => sum + (s.cost * s.quantity), 0).toFixed(2)}
                                      </li>
                                    </ul>
                                  )}
                                  
                                  {addingSupply === booking.id && (
                                    <div className="p-3 bg-white rounded border space-y-2">
                                      <div className="grid grid-cols-2 gap-2">
                                        <Input
                                          placeholder="Item name"
                                          value={newSupply.item}
                                          onChange={(e) => setNewSupply(prev => ({ ...prev, item: e.target.value }))}
                                        />
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="Cost"
                                          value={newSupply.cost}
                                          onChange={(e) => setNewSupply(prev => ({ ...prev, cost: e.target.value }))}
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <Input
                                          placeholder="Store (Home Depot, etc)"
                                          value={newSupply.store_name}
                                          onChange={(e) => setNewSupply(prev => ({ ...prev, store_name: e.target.value }))}
                                        />
                                        <Input
                                          placeholder="Receipt #"
                                          value={newSupply.receipt_number}
                                          onChange={(e) => setNewSupply(prev => ({ ...prev, receipt_number: e.target.value }))}
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleAddSupply(booking.id)}>
                                          Add Supply
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setAddingSupply(null)}>
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* AI Supply Suggestions */}
                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-purple-800 flex items-center gap-1">
                                      <Sparkles className="w-4 h-4" />
                                      AI Supply Suggestions
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-purple-600 border-purple-300 hover:bg-purple-100"
                                      onClick={() => handleGenerateAISuggestions(booking)}
                                      disabled={generatingAI === booking.id}
                                    >
                                      {generatingAI === booking.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                      ) : (
                                        <Wand2 className="w-4 h-4 mr-1" />
                                      )}
                                      {booking.ai_summary?.suggested_supplies?.length ? 'Regenerate' : 'Generate'}
                                    </Button>
                                  </div>
                                  
                                  {/* Show saved suggestions */}
                                  {booking.ai_summary?.suggested_supplies?.length ? (
                                    <div className="space-y-1">
                                      {booking.ai_summary.suggested_supplies.map((suggestion, idx) => (
                                        <div 
                                          key={idx} 
                                          className={`flex items-center justify-between text-sm p-2 rounded ${
                                            suggestion.source === 'admin' 
                                              ? 'bg-blue-100 border border-blue-200' 
                                              : 'bg-white border'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Badge 
                                              variant="outline" 
                                              className={`text-xs ${
                                                suggestion.confidence === 'high' ? 'bg-green-100 text-green-700' :
                                                suggestion.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-600'
                                              }`}
                                            >
                                              {suggestion.confidence}
                                            </Badge>
                                            <span>{suggestion.item}</span>
                                            {suggestion.source === 'admin' && (
                                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">admin</Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">
                                              ~${suggestion.estimated_cost || 0}
                                            </span>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-6 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                              onClick={() => {
                                                setNewSupply({
                                                  item: suggestion.item,
                                                  cost: String(suggestion.estimated_cost || 0),
                                                  quantity: '1',
                                                  notes: '',
                                                  receipt_number: '',
                                                  store_name: ''
                                                });
                                                setAddingSupply(booking.id);
                                              }}
                                            >
                                              <Plus className="w-3 h-3 mr-1" />
                                              Add
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                      {booking.ai_summary.generated_at && (
                                        <p className="text-xs text-purple-500 mt-2">
                                          Generated {format(parseISO(booking.ai_summary.generated_at), 'MMM d, h:mm a')}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-purple-600">
                                      Click generate to analyze notes and suggest supplies
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                                {booking.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                      disabled={updatingId === booking.id}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      {updatingId === booking.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                      ) : (
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                      )}
                                      Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                      disabled={updatingId === booking.id}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </>
                                )}
                                {booking.status === 'confirmed' && (
                                  <>
                                    {/* Start/Stop Job Timer - Multiple Entries */}
                                    {!activeTimers[booking.id] ? (
                                      <Button
                                        size="sm"
                                        onClick={async () => {
                                          setUpdatingId(booking.id);
                                          const { data, error } = await startJob(booking.id);
                                          if (error) {
                                            toast({ title: "Error", description: error.message, variant: "destructive" });
                                          } else {
                                            setActiveTimers(prev => ({ ...prev, [booking.id]: data }));
                                            toast({ title: "Timer Started", description: "Timer is now running" });
                                          }
                                          await loadBookings();
                                          setUpdatingId(null);
                                        }}
                                        disabled={updatingId === booking.id}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        {updatingId === booking.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        ) : (
                                          <Play className="w-4 h-4 mr-1" />
                                        )}
                                        Start Timer
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={async () => {
                                          setUpdatingId(booking.id);
                                          const { data, error } = await stopJob(booking.id);
                                          if (error) {
                                            toast({ title: "Error", description: error.message, variant: "destructive" });
                                          } else {
                                            setActiveTimers(prev => ({ ...prev, [booking.id]: null }));
                                            // Refresh time entries
                                            const { data: entries } = await getTimeEntries(booking.id);
                                            setTimeEntries(prev => ({ ...prev, [booking.id]: entries }));
                                            toast({ title: "Timer Stopped", description: `Recorded ${data?.duration_minutes || 0} minutes` });
                                          }
                                          await loadBookings();
                                          setUpdatingId(null);
                                        }}
                                        disabled={updatingId === booking.id}
                                        className="bg-orange-600 hover:bg-orange-700"
                                      >
                                        {updatingId === booking.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        ) : (
                                          <Square className="w-4 h-4 mr-1" />
                                        )}
                                        Stop Timer
                                      </Button>
                                    )}
                                    {/* Show running indicator */}
                                    {activeTimers[booking.id] && (
                                      <span className="flex items-center gap-1 text-sm text-orange-600 font-medium animate-pulse">
                                        <Timer className="w-4 h-4" />
                                        Running since {format(parseISO(activeTimers[booking.id]!.started_at), 'h:mm a')}
                                      </span>
                                    )}
                                    {/* Complete Job Button */}
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                      disabled={updatingId === booking.id || !!activeTimers[booking.id]}
                                      className="bg-primary hover:bg-primary/90"
                                      title={activeTimers[booking.id] ? "Stop timer first" : "Mark job as complete"}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Complete
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusUpdate(booking.id, 'no_show')}
                                      disabled={updatingId === booking.id}
                                    >
                                      No Show
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                      disabled={updatingId === booking.id}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </>
                                )}
                                {booking.status === 'completed' && (
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    <p>
                                      Completed on {booking.completed_at
                                        ? format(parseISO(booking.completed_at), 'MMM d, yyyy \'at\' h:mm a')
                                        : 'N/A'
                                      }
                                    </p>
                                    {booking.actual_duration_minutes && (
                                      <p className="flex items-center gap-1 text-primary font-medium">
                                        <Timer className="w-4 h-4" />
                                        Time: {Math.floor(booking.actual_duration_minutes / 60)}h {booking.actual_duration_minutes % 60}m
                                      </p>
                                    )}
                                  </div>
                                )}
                                {booking.status === 'cancelled' && (
                                  <p className="text-sm text-muted-foreground">
                                    Cancelled {booking.cancelled_by === 'customer' ? 'by customer' : 'by staff'}{' '}
                                    {booking.cancelled_at
                                      ? `on ${format(parseISO(booking.cancelled_at), 'MMM d, yyyy')}`
                                      : ''
                                    }
                                  </p>
                                )}

                                {/* Quote/Invoice, Follow-up & Send Job Buttons */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setQuoteBooking(booking);
                                      setQuoteType(booking.status === 'completed' ? 'invoice' : 'quote');
                                      setShowQuoteDialog(true);
                                    }}
                                  >
                                    <FileText className="w-4 h-4 mr-1" />
                                    {booking.status === 'completed' ? 'Invoice' : 'Quote'}
                                  </Button>
                                  
                                  {booking.status === 'completed' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setFollowUpBooking(booking);
                                        setShowFollowUpDialog(true);
                                      }}
                                    >
                                      <RotateCcw className="w-4 h-4 mr-1" />
                                      Follow-up
                                    </Button>
                                  )}
                                  
                                  {/* Send Job Button */}
                                  {booking.status !== 'completed' && booking.status !== 'cancelled' && !booking.is_contracted_out && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100"
                                      onClick={() => setSendJobBookingId(booking.id)}
                                    >
                                      <Send className="w-4 h-4 mr-1" />
                                      Send Job
                                    </Button>
                                  )}
                                  
                                  {/* Show assigned contractor badge */}
                                  {booking.is_contracted_out && booking.assigned_contractor_id && (
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                                        📤 Sent to {contractors.find(c => c.id === booking.assigned_contractor_id)?.name || 'Contractor'}
                                      </Badge>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 text-purple-600 hover:text-purple-800"
                                        onClick={() => handleUnassignJob(booking.id)}
                                        title="Cancel assignment"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Delete Button - Always visible */}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                                      disabled={deletingBooking === booking.id}
                                    >
                                      {deletingBooking === booking.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="border-red-200">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                                        <Trash2 className="w-5 h-5" />
                                        Delete Booking?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="space-y-2">
                                        <p>Are you sure you want to <strong>permanently delete</strong> this booking?</p>
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                                          <p><strong>{booking.client?.name}</strong></p>
                                          <p>{format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')} at {booking.time_slot}</p>
                                        </div>
                                        <p className="text-red-600 font-medium">⚠️ This action cannot be undone!</p>
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteBooking(booking.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Yes, Delete Booking
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Analytics Dashboard Section */}
        <Card className="border-blue-200">
          <CardHeader 
            className="cursor-pointer"
            onClick={() => {
              setShowAnalytics(!showAnalytics);
              if (!showAnalytics && !analyticsData) loadAnalytics();
            }}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Business Analytics
                {analyticsData && (
                  <>
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      ${analyticsData.totalRevenue.toFixed(0)} revenue
                    </Badge>
                    {analyticsData.revenueGrowth > 0 ? (
                      <Badge variant="outline" className="bg-green-50 text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{analyticsData.revenueGrowth.toFixed(0)}%
                      </Badge>
                    ) : analyticsData.revenueGrowth < 0 ? (
                      <Badge variant="outline" className="bg-red-50 text-red-600">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        {analyticsData.revenueGrowth.toFixed(0)}%
                      </Badge>
                    ) : null}
                  </>
                )}
              </CardTitle>
              {showAnalytics ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {showAnalytics && (
            <CardContent className="pt-0 space-y-6">
              {loadingAnalytics ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-muted-foreground">Loading analytics...</span>
                </div>
              ) : analyticsData ? (
                <>
                  {/* Key Metrics Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <p className="text-xs text-green-600 font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-700">${analyticsData.totalRevenue.toFixed(0)}</p>
                      <p className="text-xs text-green-500">
                        {analyticsData.revenueGrowth >= 0 ? '+' : ''}{analyticsData.revenueGrowth.toFixed(1)}% vs last month
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium">Gross Profit</p>
                      <p className="text-2xl font-bold text-blue-700">${analyticsData.grossProfit.toFixed(0)}</p>
                      <p className="text-xs text-blue-500">After ${analyticsData.totalExpenses.toFixed(0)} expenses</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-600 font-medium">Avg Job Value</p>
                      <p className="text-2xl font-bold text-purple-700">${analyticsData.avgJobValue.toFixed(0)}</p>
                      <p className="text-xs text-purple-500">{analyticsData.completedJobs} completed jobs</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-600 font-medium">Active Clients</p>
                      <p className="text-2xl font-bold text-amber-700">{analyticsData.activeClients}</p>
                      <p className="text-xs text-amber-500">+{analyticsData.newClientsThisMonth} this month</p>
                    </div>
                  </div>

                  {/* Monthly Revenue Chart (Simple Bar Representation) */}
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-medium text-sm mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Revenue Trend (Last 6 Months)
                    </h4>
                    <div className="flex items-end gap-2 h-32">
                      {analyticsData.monthlyData.map((month, idx) => {
                        const maxRevenue = Math.max(...analyticsData.monthlyData.map(m => m.revenue), 1);
                        const height = (month.revenue / maxRevenue) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <div 
                              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500"
                              style={{ height: `${Math.max(height, 5)}%` }}
                              title={`$${month.revenue.toFixed(0)}`}
                            />
                            <span className="text-xs text-muted-foreground">{month.label}</span>
                            <span className="text-xs font-medium">${month.revenue >= 1000 ? `${(month.revenue/1000).toFixed(1)}k` : month.revenue.toFixed(0)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Performance & Sources Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Performance Metrics */}
                    <div className="p-4 bg-white rounded-lg border">
                      <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-500" />
                        Performance Metrics
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Completion Rate</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${Math.min(analyticsData.performance.completionRate, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{analyticsData.performance.completionRate.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Repeat Client Rate</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${Math.min(analyticsData.performance.repeatClientRate, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{analyticsData.performance.repeatClientRate.toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Avg Duration</span>
                          <span className="text-sm font-medium">
                            {analyticsData.performance.avgDurationMinutes > 0 
                              ? `${Math.round(analyticsData.performance.avgDurationMinutes)} min`
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Revenue/Hour</span>
                          <span className="text-sm font-medium">
                            ${analyticsData.performance.avgRevenuePerHour.toFixed(0)}/hr
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Sources */}
                    <div className="p-4 bg-white rounded-lg border">
                      <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-purple-500" />
                        Booking Sources
                      </h4>
                      <div className="space-y-2">
                        {analyticsData.sourceBreakdown.length > 0 ? (
                          analyticsData.sourceBreakdown.map((source, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span>
                                  {source.source === 'phone' && '📞'}
                                  {source.source === 'website' && '🌐'}
                                  {source.source === 'in_person' && '🏠'}
                                  {source.source === 'referral' && '👥'}
                                  {source.source === 'subscription' && '📋'}
                                  {source.source === 'other' && '📝'}
                                </span>
                                <span className="capitalize">{source.source.replace('_', ' ')}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium">{source.count} jobs</span>
                                <span className="text-muted-foreground ml-2">${source.revenue.toFixed(0)}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center">No source data yet</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Clients */}
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      Top Clients by Revenue
                    </h4>
                    {analyticsData.topClients.length > 0 ? (
                      <div className="space-y-2">
                        {analyticsData.topClients.slice(0, 5).map((client, idx) => (
                          <div key={client.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx === 0 ? 'bg-amber-100 text-amber-700' :
                                idx === 1 ? 'bg-gray-200 text-gray-600' :
                                idx === 2 ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {idx + 1}
                              </span>
                              <div>
                                <p className="font-medium text-sm">{client.name}</p>
                                <p className="text-xs text-muted-foreground">{client.jobCount} jobs • ${client.avgJobValue.toFixed(0)} avg</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">${client.totalSpent.toFixed(0)}</p>
                              {client.lastBooking && (
                                <p className="text-xs text-muted-foreground">
                                  Last: {format(parseISO(client.lastBooking), 'MMM d')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No client data yet</p>
                    )}
                  </div>

                  {/* Refresh Button */}
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={loadAnalytics}
                      disabled={loadingAnalytics}
                    >
                      {loadingAnalytics ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                      Refresh Analytics
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">Click to load analytics data</p>
              )}
            </CardContent>
          )}
        </Card>

        {/* Contact Messages Section */}
        <Card id="contact-messages-section" className="border-indigo-200">
          <CardHeader 
            className="cursor-pointer"
            onClick={() => setShowContactMessages(!showContactMessages)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Contact Messages
                {contactMessages.filter(m => m.status === 'new').length > 0 && (
                  <Badge className="bg-indigo-500">{contactMessages.filter(m => m.status === 'new').length} new</Badge>
                )}
                {contactMessages.filter(m => m.message_type === 'quote_request').length > 0 && (
                  <Badge className="bg-purple-500">{contactMessages.filter(m => m.message_type === 'quote_request').length} quotes</Badge>
                )}
              </CardTitle>
              {showContactMessages ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {showContactMessages && (
            <CardContent className="pt-0">
              {contactMessages.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No contact messages yet.</p>
              ) : (
                <>
                  {/* Bulk Actions Bar */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedMessages.size === contactMessages.length && contactMessages.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMessages(new Set(contactMessages.map(m => m.id)));
                          } else {
                            setSelectedMessages(new Set());
                          }
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {selectedMessages.size > 0 ? `${selectedMessages.size} selected` : 'Select all'}
                      </span>
                    </div>
                    {selectedMessages.size > 0 && (
                      <AlertDialog onOpenChange={(open) => { if (!open) setMessageDeleteConfirmText(''); }}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={deletingMessages}>
                            {deletingMessages ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Delete {selectedMessages.size}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-red-200">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                              <Trash2 className="w-5 h-5" />
                              Delete {selectedMessages.size} Message{selectedMessages.size > 1 ? 's' : ''}?
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                              <div className="space-y-3">
                                <p>Are you sure you want to <strong>permanently delete</strong> these messages?</p>
                                <p className="text-red-600 font-medium">⚠️ This action cannot be undone!</p>
                                <div className="pt-2">
                                  <Label className="text-sm text-muted-foreground">
                                    Type <span className="font-mono font-bold text-red-600">Delete</span> to confirm:
                                  </Label>
                                  <Input
                                    value={messageDeleteConfirmText}
                                    onChange={(e) => setMessageDeleteConfirmText(e.target.value)}
                                    placeholder="Delete"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setMessageDeleteConfirmText('')}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleBulkDeleteMessages}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={messageDeleteConfirmText !== 'Delete'}
                            >
                              Yes, Delete All Selected
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  <div className="space-y-3">
                    {contactMessages.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`p-4 rounded-lg border ${
                          msg.message_type === 'quote_request' 
                            ? 'bg-purple-50 border-purple-200 border-l-4 border-l-purple-500' 
                            : msg.status === 'new' 
                            ? 'bg-indigo-50 border-indigo-200' 
                            : 'bg-gray-50 border-gray-200'
                        } ${selectedMessages.has(msg.id) ? 'ring-2 ring-indigo-500' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedMessages.has(msg.id)}
                            onCheckedChange={(checked) => {
                              const newSet = new Set(selectedMessages);
                              if (checked) {
                                newSet.add(msg.id);
                              } else {
                                newSet.delete(msg.id);
                              }
                              setSelectedMessages(newSet);
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium">{msg.name}</span>
                                  {msg.message_type === 'quote_request' && (
                                    <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                                      📦 Package Quote
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className={
                                    msg.status === 'new' ? 'bg-indigo-100 text-indigo-700' :
                                    msg.status === 'replied' ? 'bg-green-100 text-green-700' :
                                    'bg-orange-100 text-orange-700'
                                  }>
                                    {msg.status === 'new' ? 'New' : msg.status === 'replied' ? 'Replied' : 'Not Replied'}
                                  </Badge>
                                </div>
                                {msg.email && (
                                  <a href={`mailto:${msg.email}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {msg.email}
                                  </a>
                                )}
                                {msg.phone && (
                                  <a href={`tel:${msg.phone}`} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {msg.phone}
                                  </a>
                                )}
                                {msg.message && (
                                  <p className="text-sm text-muted-foreground mt-2 p-2 bg-gray-50 rounded">{msg.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(msg.created_at), 'MMM d, yyyy h:mm a')}
                                </p>
                                
                                {/* Show existing reply */}
                                {msg.reply && (
                                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                    <p className="text-xs font-medium text-green-700 mb-1">Your Reply:</p>
                                    <p className="text-sm text-green-800">{msg.reply}</p>
                                    {msg.replied_at && (
                                      <p className="text-xs text-green-600 mt-1">
                                        Sent {format(parseISO(msg.replied_at), 'MMM d, h:mm a')}
                                      </p>
                                    )}
                                  </div>
                                )}
                                
                                {/* Reply form */}
                                {replyingToMessage === msg.id && (
                                  <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded space-y-2">
                                    <Textarea
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      placeholder="Type your reply..."
                                      rows={3}
                                      className="text-sm"
                                    />
                                    <div className="flex gap-2">
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleSendReply(msg.id)}
                                        disabled={sendingReply || !replyContent.trim()}
                                      >
                                        {sendingReply ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                                        Save Reply
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                          setReplyingToMessage(null);
                                          setReplyContent('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                {msg.status === 'new' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      updateContactMessageStatus(msg.id, 'read');
                                      loadContactMessages();
                                    }}
                                  >
                                    Mark Read
                                  </Button>
                                )}
                                {replyingToMessage !== msg.id && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                                    onClick={() => {
                                      setReplyingToMessage(msg.id);
                                      setReplyContent(msg.reply || '');
                                    }}
                                  >
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    {msg.reply ? 'Edit Reply' : 'Reply'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          )}
        </Card>

        {/* Message Templates Section */}
        <Card className="border-cyan-200">
          <CardHeader 
            className="cursor-pointer"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="w-5 h-5 text-cyan-600" />
                Message Templates
                <Badge variant="outline" className="bg-cyan-100 text-cyan-700">
                  {MESSAGE_TEMPLATES.length} templates
                </Badge>
              </CardTitle>
              {showTemplates ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {showTemplates && (
            <CardContent className="pt-0 space-y-4">
              {/* Auto-fill from Booking */}
              <div className="p-3 bg-cyan-50 rounded-lg space-y-3">
                <Label className="text-sm text-cyan-700 font-medium">Auto-fill from Booking</Label>
                <Select
                  value={templateBookingId}
                  onValueChange={(bookingId) => {
                    setTemplateBookingId(bookingId);
                    const booking = bookings.find(b => b.id === bookingId);
                    if (booking) {
                      setTemplateClientName(booking.client?.name || '');
                      setTemplateDate(format(parseISO(booking.date), 'MMMM d'));
                      setTemplateTime(booking.time_slot);
                      setTemplateAmount(booking.invoice_amount ? `$${booking.invoice_amount}` : '');
                    }
                  }}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select a booking to auto-fill..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bookings.slice(0, 20).map(b => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.client?.name} - {format(parseISO(b.date), 'MMM d')} @ {b.time_slot}
                        {b.invoice_amount && ` ($${b.invoice_amount})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Editable fields */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <Label className="text-xs text-cyan-600">Name</Label>
                    <Input
                      placeholder="Client name"
                      value={templateClientName}
                      onChange={(e) => setTemplateClientName(e.target.value)}
                      className="bg-white h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-cyan-600">Date</Label>
                    <Input
                      placeholder="Jan 15"
                      value={templateDate}
                      onChange={(e) => setTemplateDate(e.target.value)}
                      className="bg-white h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-cyan-600">Time</Label>
                    <Input
                      placeholder="9:00 AM"
                      value={templateTime}
                      onChange={(e) => setTemplateTime(e.target.value)}
                      className="bg-white h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-cyan-600">Amount</Label>
                    <Input
                      placeholder="$150"
                      value={templateAmount}
                      onChange={(e) => setTemplateAmount(e.target.value)}
                      className="bg-white h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Templates Grid */}
              <div className="grid gap-3">
                {MESSAGE_TEMPLATES.map((template) => {
                  const filledTemplate = template.template
                    .replace('{name}', templateClientName || '[Name]')
                    .replace('{date}', templateDate || format(new Date(), 'MMMM d'))
                    .replace('{time}', templateTime || '9:00 AM')
                    .replace('{amount}', templateAmount || '$___');
                  
                  return (
                    <div 
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.id 
                          ? 'border-cyan-500 bg-cyan-50' 
                          : 'hover:border-cyan-300 hover:bg-cyan-50/50'
                      }`}
                      onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{template.name}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(filledTemplate);
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`sms:?body=${encodeURIComponent(filledTemplate)}`, '_blank');
                            }}
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{filledTemplate}</p>
                    </div>
                  );
                })}
              </div>

              {/* Send to Client Selector */}
              {clients.length > 0 && (
                <div className="p-3 bg-white border rounded-lg">
                  <Label className="text-sm mb-2 block">Quick Send to Client</Label>
                  <div className="flex gap-2">
                    <Select
                      value=""
                      onValueChange={(clientId) => {
                        const client = clients.find(c => c.id === clientId);
                        if (client) {
                          setTemplateClientName(client.name);
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select client to auto-fill name..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.slice(0, 15).map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} {client.phone && `• ${client.phone}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Master Supplies Section */}
        <Card className="border-amber-200">
          <CardHeader 
            className="cursor-pointer"
            onClick={() => {
              setShowMasterSupplies(!showMasterSupplies);
              if (!showMasterSupplies) loadMasterSupplies();
            }}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5 text-amber-600" />
                Materials & Supplies
                <Badge variant="outline" className="bg-amber-100 text-amber-700">
                  {supplyStats.itemCount} items
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-600">
                  ${supplyStats.totalSpent.toFixed(0)} total
                </Badge>
              </CardTitle>
              {showMasterSupplies ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {showMasterSupplies && (
            <CardContent className="pt-0 space-y-4">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-700">${supplyStats.totalSpent.toFixed(0)}</p>
                  <p className="text-xs text-amber-600">All Time</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-700">${supplyStats.thisMonthSpent.toFixed(0)}</p>
                  <p className="text-xs text-amber-600">This Month</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-700">{supplyStats.itemCount}</p>
                  <p className="text-xs text-amber-600">Total Items</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-700">{supplyStats.topItems.length}</p>
                  <p className="text-xs text-amber-600">Unique Items</p>
                </div>
              </div>

              {/* Top Items */}
              {supplyStats.topItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Most Used Items
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {supplyStats.topItems.slice(0, 6).map((item, idx) => (
                      <div key={idx} className="p-2 bg-white border rounded flex items-center justify-between">
                        <span className="text-sm capitalize">{item.item}</span>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs mr-1">×{item.count}</Badge>
                          <span className="text-xs text-muted-foreground">${item.totalCost.toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Supplies */}
              <div>
                <h4 className="font-medium text-sm mb-2">Recent Purchases</h4>
                {allSupplies.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {allSupplies.slice(0, 20).map(supply => (
                      <div key={supply.id} className="p-3 bg-white border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{supply.item}</p>
                            <p className="text-xs text-muted-foreground">
                              {supply.booking?.client?.name || 'Unknown'} • {supply.booking?.date ? format(parseISO(supply.booking.date), 'MMM d, yyyy') : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(supply.cost * supply.quantity).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">×{supply.quantity}</p>
                          </div>
                        </div>
                        {supply.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{supply.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No supplies recorded yet. Add supplies to bookings to see them here.
                  </p>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Monthly Subscriptions Section */}
        <Card className="border-green-200">
          <CardHeader 
            className="cursor-pointer"
            onClick={() => setShowSubscriptions(!showSubscriptions)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
                Monthly Subscriptions
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  {subscriptionStats.activeCount} active
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-600">
                  ${(subscriptionStats.monthlyRecurring / 100).toFixed(0)}/mo
                </Badge>
              </CardTitle>
              {showSubscriptions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {showSubscriptions && (
            <CardContent className="pt-0 space-y-4">
              {/* Stats Bar */}
              <div className="flex flex-wrap gap-4 p-3 bg-green-50 rounded-lg text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <strong>{subscriptionStats.activeCount}</strong> Active
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <strong>{subscriptionStats.pausedCount}</strong> Paused
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <strong>{subscriptionStats.cancelledCount}</strong> Cancelled
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <strong>${(subscriptionStats.monthlyRecurring / 100).toFixed(2)}</strong>/month recurring
                </span>
              </div>

              {/* Filter & Add */}
              <div className="flex items-center gap-2">
                <Select value={subscriptionFilter} onValueChange={(v: 'all' | 'active' | 'paused' | 'cancelled') => setSubscriptionFilter(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subscriptions</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => setShowNewSubscription(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Subscription
                </Button>
              </div>

              {/* New Subscription Form */}
              {showNewSubscription && (
                <div className="p-4 border border-green-200 rounded-lg bg-green-50/50 space-y-3">
                  <h4 className="font-medium">New Subscription</h4>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Client</Label>
                      <Select value={newSubscription.clientId} onValueChange={(v) => setNewSubscription(p => ({ ...p, clientId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Plan</Label>
                      <Select 
                        value={newSubscription.planId} 
                        onValueChange={(v) => {
                          const plan = subscriptionPlans.find(p => p.id === v);
                          setNewSubscription(p => ({ 
                            ...p, 
                            planId: v, 
                            price: plan ? String(plan.price_min) : '' 
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {subscriptionPlans.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} (${(p.price_min / 100).toFixed(0)}-${(p.price_max / 100).toFixed(0)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Monthly Price (cents)</Label>
                      <Input
                        value={newSubscription.price}
                        onChange={(e) => setNewSubscription(p => ({ ...p, price: e.target.value }))}
                        placeholder="e.g., 12500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCreateSubscription}>Create</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowNewSubscription(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Subscriptions List */}
              <div className="space-y-2">
                {subscriptions
                  .filter(s => subscriptionFilter === 'all' || s.status === subscriptionFilter)
                  .map(sub => (
                    <div 
                      key={sub.id} 
                      className={`p-4 rounded-lg border ${
                        sub.status === 'active' ? 'border-green-200 bg-green-50/50' :
                        sub.status === 'paused' ? 'border-yellow-200 bg-yellow-50/50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sub.client?.name || 'Unknown'}</span>
                            <Badge variant={
                              sub.status === 'active' ? 'default' :
                              sub.status === 'paused' ? 'secondary' : 'destructive'
                            }>
                              {sub.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {sub.plan?.name || sub.plan_id} • ${(sub.monthly_price / 100).toFixed(2)}/month
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Started {format(parseISO(sub.started_at), 'MMM d, yyyy')}
                            {sub.next_billing_date && ` • Next billing: ${format(parseISO(sub.next_billing_date), 'MMM d')}`}
                          </p>
                          {sub.client?.phone && (
                            <a href={`tel:${sub.client.phone}`} className="text-xs text-green-600 hover:underline">
                              {sub.client.phone}
                            </a>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {sub.status === 'active' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSubscriptionStatusChange(sub.id, 'paused')}
                              >
                                Pause
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">Cancel</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will cancel {sub.client?.name}'s {sub.plan?.name} subscription.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Active</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleSubscriptionStatusChange(sub.id, 'cancelled')}
                                      className="bg-destructive"
                                    >
                                      Cancel Subscription
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                          {sub.status === 'paused' && (
                            <Button 
                              size="sm"
                              onClick={() => handleSubscriptionStatusChange(sub.id, 'active')}
                            >
                              Resume
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                {subscriptions.filter(s => subscriptionFilter === 'all' || s.status === subscriptionFilter).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No {subscriptionFilter !== 'all' ? subscriptionFilter : ''} subscriptions found
                  </p>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Client Directory Section */}
        <Card className="border-teal-200">
          <CardHeader 
            className="cursor-pointer"
            onClick={() => setShowClients(!showClients)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-teal-600" />
                Client Directory
                <Badge variant="outline">{clients.length} clients</Badge>
              </CardTitle>
              {showClients ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {showClients && (
            <CardContent className="pt-0">
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Search clients by name, phone, or email..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="flex-1"
                />
                <Dialog open={showNewClient} onOpenChange={setShowNewClient}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1">
                      <Plus className="w-4 h-4" />
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="client-name">Name *</Label>
                          <Input
                            id="client-name"
                            value={newClient.name}
                            onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="John Smith"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="client-phone">Phone</Label>
                            <Input
                              id="client-phone"
                              value={newClient.phone}
                              onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="client-email">Email</Label>
                            <Input
                              id="client-email"
                              type="email"
                              value={newClient.email}
                              onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="john@email.com"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="client-address">Address</Label>
                          <Input
                            id="client-address"
                            value={newClient.address}
                            onChange={(e) => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="123 Main St, Lot 45"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="client-community">Community</Label>
                          <Input
                            id="client-community"
                            value={newClient.community}
                            onChange={(e) => setNewClient(prev => ({ ...prev, community: e.target.value }))}
                            placeholder="Sunny Palms MHP"
                          />
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={newClient.is_senior}
                              onCheckedChange={(checked) => setNewClient(prev => ({ ...prev, is_senior: !!checked }))}
                            />
                            <span className="text-sm">Senior (65+)</span>
                            <Star className="w-4 h-4 text-amber-500" />
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={newClient.is_military}
                              onCheckedChange={(checked) => setNewClient(prev => ({ ...prev, is_military: !!checked }))}
                            />
                            <span className="text-sm">Military/Vet</span>
                            <Shield className="w-4 h-4 text-blue-500" />
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setShowNewClient(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateClient} disabled={newClientLoading || !newClient.name.trim()}>
                          {newClientLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                          Add Client
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {/* Bulk Actions Bar */}
              {clients.length > 0 && (
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedClients.size === clients.length && clients.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedClients(new Set(clients.map(c => c.id)));
                        } else {
                          setSelectedClients(new Set());
                        }
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedClients.size > 0 ? `${selectedClients.size} selected` : 'Select all'}
                    </span>
                  </div>
                  {selectedClients.size > 0 && (
                    <AlertDialog onOpenChange={(open) => { if (!open) setClientDeleteConfirmText(''); }}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={deletingClients}>
                          {deletingClients ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                          Delete {selectedClients.size}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-red-200">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            Delete {selectedClients.size} Client{selectedClients.size > 1 ? 's' : ''}?
                          </AlertDialogTitle>
                          <AlertDialogDescription asChild>
                            <div className="space-y-3">
                              <p>Are you sure you want to <strong>permanently delete</strong> these clients?</p>
                              <p className="text-orange-600 font-medium">⚠️ Clients with existing bookings cannot be deleted.</p>
                              <p className="text-red-600 font-medium">⚠️ This action cannot be undone!</p>
                              <div className="pt-2">
                                <Label className="text-sm text-muted-foreground">
                                  Type <span className="font-mono font-bold text-red-600">Delete</span> to confirm:
                                </Label>
                                <Input
                                  value={clientDeleteConfirmText}
                                  onChange={(e) => setClientDeleteConfirmText(e.target.value)}
                                  placeholder="Delete"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setClientDeleteConfirmText('')}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleBulkDeleteClients}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={clientDeleteConfirmText !== 'Delete'}
                          >
                            Yes, Delete All Selected
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              )}
              {clients.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No clients yet.</p>
              ) : (
                <div className="space-y-2">
                  {clients
                    .filter(c => 
                      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                      c.phone?.toLowerCase().includes(clientSearch.toLowerCase()) ||
                      c.email?.toLowerCase().includes(clientSearch.toLowerCase())
                    )
                    .map(client => (
                    <div key={client.id} className={`flex items-start gap-3 ${selectedClients.has(client.id) ? 'ring-2 ring-teal-500 rounded-lg' : ''}`}>
                      <Checkbox
                        checked={selectedClients.has(client.id)}
                        onCheckedChange={(checked) => {
                          const newSet = new Set(selectedClients);
                          if (checked) {
                            newSet.add(client.id);
                          } else {
                            newSet.delete(client.id);
                          }
                          setSelectedClients(newSet);
                        }}
                        className="mt-5"
                      />
                    <Collapsible 
                      className="flex-1"
                      open={expandedClient === client.id}
                      onOpenChange={(open) => {
                        setExpandedClient(open ? client.id : null);
                        if (open) loadClientNotesFor(client.id);
                      }}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-teal-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{client.name}</span>
                                  {client.source === 'contact_form' && (
                                    <Badge variant="outline" className="bg-purple-100 text-purple-700 text-xs">Lead</Badge>
                                  )}
                                  {client.is_senior && <Star className="w-4 h-4 text-amber-500" title="Senior" />}
                                  {client.is_military && <Shield className="w-4 h-4 text-blue-500" title="Military" />}
                                </div>
                                <p className="text-sm text-muted-foreground">{client.phone || client.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{client.booking_count} bookings</p>
                              <p className="text-xs text-muted-foreground">
                                ${client.total_spent.toFixed(0)} total
                              </p>
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 bg-white border border-t-0 rounded-b-lg space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-muted-foreground">Phone</Label>
                              <p>{client.phone || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Email</Label>
                              <p>{client.email || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Address</Label>
                              <p>{client.address || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Community</Label>
                              <p>{client.community || 'N/A'}</p>
                            </div>
                          </div>

                          {/* Pet Info */}
                          {client.pet_info && (client.pet_info.has_pets || client.pet_info.dogs > 0 || client.pet_info.cats > 0) && (
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <Label className="text-amber-700 flex items-center gap-2 mb-2">
                                🐾 Pet Information
                              </Label>
                              <div className="text-sm space-y-1">
                                {client.pet_info.dogs > 0 && (
                                  <p>🐕 Dogs: {client.pet_info.dogs}</p>
                                )}
                                {client.pet_info.cats > 0 && (
                                  <p>🐱 Cats: {client.pet_info.cats}</p>
                                )}
                                {client.pet_info.names && (
                                  <p className="text-muted-foreground">Names: {client.pet_info.names}</p>
                                )}
                                {client.pet_info.breeds && (
                                  <p className="text-muted-foreground">Breeds: {client.pet_info.breeds}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Booking History */}
                          <div>
                            <Label className="text-muted-foreground mb-2 block">Booking History ({client.booking_count})</Label>
                            {client.all_bookings && client.all_bookings.length > 0 ? (
                              <div className="max-h-40 overflow-y-auto space-y-1 bg-gray-50 rounded-lg p-2">
                                {client.all_bookings.map(booking => (
                                  <button
                                    key={booking.id}
                                    className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-200 transition-colors text-sm flex items-center justify-between gap-2"
                                    onClick={() => {
                                      setShowClients(false);
                                      setExpandedBooking(booking.id);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <CalendarDays className="w-3 h-3 text-muted-foreground" />
                                      <span>{format(parseISO(booking.date), 'MMM d, yyyy')}</span>
                                      <span className="text-muted-foreground">@ {booking.time_slot}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="outline" className={`text-xs ${
                                        booking.status === 'completed' ? 'bg-green-50 text-green-700' :
                                        booking.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                                        booking.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                                        'bg-yellow-50 text-yellow-700'
                                      }`}>
                                        {booking.status}
                                      </Badge>
                                      {booking.invoice_amount && (
                                        <span className="text-xs text-muted-foreground">${booking.invoice_amount}</span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No bookings yet.</p>
                            )}
                          </div>
                          
                          {/* Flags */}
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox 
                                checked={client.is_senior || false}
                                onCheckedChange={(checked) => {
                                  updateClientFlags(client.id, { is_senior: !!checked });
                                  loadClients();
                                }}
                              />
                              <Star className="w-4 h-4 text-amber-500" />
                              <span className="text-sm">Senior</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox 
                                checked={client.is_military || false}
                                onCheckedChange={(checked) => {
                                  updateClientFlags(client.id, { is_military: !!checked });
                                  loadClients();
                                }}
                              />
                              <Shield className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">Military</span>
                            </label>
                          </div>

                          {/* Notes */}
                          <div>
                            <Label className="text-muted-foreground mb-2 block">Notes</Label>
                            {clientNotes[client.id]?.length > 0 ? (
                              <div className="space-y-2 mb-3">
                                {clientNotes[client.id].map(note => (
                                  <div key={note.id} className="p-2 bg-gray-50 rounded border text-sm">
                                    <p>{note.note}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {format(parseISO(note.created_at), 'MMM d, yyyy h:mm a')}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground mb-2">No notes yet.</p>
                            )}
                            {addingNoteFor === client.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={newNoteValue}
                                  onChange={(e) => setNewNoteValue(e.target.value)}
                                  placeholder="Add a note..."
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm"
                                    onClick={async () => {
                                      if (newNoteValue.trim()) {
                                        await addClientNote(client.id, newNoteValue);
                                        loadClientNotesFor(client.id);
                                        setNewNoteValue('');
                                        setAddingNoteFor(null);
                                      }
                                    }}
                                  >
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setAddingNoteFor(null);
                                      setNewNoteValue('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setAddingNoteFor(client.id)}
                              >
                                <Plus className="w-4 h-4 mr-1" /> Add Note
                              </Button>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2 pt-3 border-t">
                            <Button 
                              size="sm"
                              onClick={() => {
                                setNewBooking({
                                  name: client.name,
                                  email: client.email || '',
                                  phone: client.phone || '',
                                  address: client.address || '',
                                  community: client.community || '',
                                  date: undefined,
                                  timeSlot: '',
                                  services: [],
                                  notes: '',
                                  source: 'phone'
                                });
                                setShowNewBooking(true);
                              }}
                            >
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              Quick Book
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete {client.name}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this client and cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      await deleteClient(client.id);
                                      loadClients();
                                      toast({ title: "Client deleted" });
                                    }}
                                    className="bg-destructive"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </main>

      {/* Calendar View Modal */}
      <Dialog open={showCalendarView} onOpenChange={setShowCalendarView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendar View
            </DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedCalendarDate}
                onSelect={setSelectedCalendarDate}
                modifiers={{
                  hasBookings: (date) => datesWithBookings.has(format(date, 'yyyy-MM-dd'))
                }}
                modifiersStyles={{
                  hasBookings: {
                    backgroundColor: 'hsl(var(--primary) / 0.1)',
                    fontWeight: 'bold',
                    borderRadius: '50%'
                  }
                }}
                className="rounded-lg border p-3"
              />
            </div>
            <div>
              <h3 className="font-medium mb-3">
                {selectedCalendarDate 
                  ? `Bookings for ${format(selectedCalendarDate, 'EEEE, MMMM d, yyyy')}`
                  : 'Select a date to see bookings'
                }
              </h3>
              {selectedCalendarDate && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {getBookingsForDate(selectedCalendarDate).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No bookings on this date.</p>
                  ) : (
                    getBookingsForDate(selectedCalendarDate).map(booking => (
                      <div 
                        key={booking.id} 
                        className={`p-3 rounded-lg border cursor-pointer hover:ring-2 hover:ring-primary transition-all ${
                          booking.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                          booking.status === 'confirmed' ? 'bg-blue-50 border-blue-200' :
                          booking.status === 'completed' ? 'bg-green-50 border-green-200' :
                          'bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => {
                          setShowCalendarView(false);
                          setExpandedBooking(booking.id);
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{booking.client?.name}</span>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {getTimeLabel(booking.time_slot)}
                        </p>
                        {booking.client?.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {booking.client.phone}
                          </p>
                        )}
                        {booking.client?.email && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {booking.client.email}
                          </p>
                        )}
                        {booking.services && booking.services.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {booking.services.map((service: { id: string; name: string }) => (
                              <Badge key={service.id} variant="secondary" className="text-xs">
                                {service.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {booking.notes && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                            "{booking.notes}"
                          </p>
                        )}
                        <p className="text-xs text-primary mt-2">Click to view details →</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quote/Invoice Dialog */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {quoteType === 'invoice' ? 'Invoice' : 'Service Quote'}
            </DialogTitle>
          </DialogHeader>
          {quoteBooking && (
            <div className="space-y-4">
              {/* Toggle between Quote and Invoice */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={quoteType === 'quote' ? 'default' : 'outline'}
                  onClick={() => setQuoteType('quote')}
                >
                  Quote
                </Button>
                <Button
                  size="sm"
                  variant={quoteType === 'invoice' ? 'default' : 'outline'}
                  onClick={() => setQuoteType('invoice')}
                >
                  Invoice
                </Button>
              </div>

              {/* Preview - Senior Friendly Large Text */}
              <div className="p-4 bg-white border-2 border-gray-300 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                {generateQuoteText(quoteBooking, quoteType)}
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(generateQuoteText(quoteBooking, quoteType))}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Text
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const text = generateQuoteText(quoteBooking, quoteType);
                    const phone = quoteBooking.client?.phone?.replace(/\D/g, '');
                    if (phone) {
                      window.open(`sms:${phone}?body=${encodeURIComponent(text)}`, '_blank');
                    } else {
                      copyToClipboard(text);
                    }
                  }}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Send SMS
                </Button>
                <Button
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>${quoteType === 'invoice' ? 'Invoice' : 'Quote'} - ${quoteBooking.client?.name}</title>
                            <style>
                              body { font-family: monospace; font-size: 16px; padding: 40px; white-space: pre-wrap; }
                            </style>
                          </head>
                          <body>${generateQuoteText(quoteBooking, quoteType)}</body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }}
                >
                  <Printer className="w-4 h-4 mr-1" />
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Follow-up Booking Dialog */}
      <Dialog open={showFollowUpDialog} onOpenChange={setShowFollowUpDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-blue-600" />
              Schedule Follow-up Booking
            </DialogTitle>
          </DialogHeader>
          {followUpBooking && (
            <div className="space-y-4">
              {/* Original Booking Info */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-600">Original Booking</Badge>
                </div>
                <p className="font-medium">{followUpBooking.client?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Date: {format(parseISO(followUpBooking.date), 'MMM d, yyyy')} at {followUpBooking.time_slot}
                </p>
                <p className="text-sm text-muted-foreground">
                  Services: {followUpBooking.services?.map(s => s.service?.name || s.name).join(', ') || 'General'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Calendar Section */}
                <div className="space-y-2 min-w-0">
                  <Label>Select Follow-up Date</Label>
                  <div className="border rounded-lg p-2 overflow-hidden">
                    <Calendar
                      mode="single"
                      selected={followUpDate}
                      onSelect={(date) => {
                        setFollowUpDate(date);
                        if (date) loadFollowUpDateInfo(date);
                      }}
                      disabled={(date) => date < new Date()}
                      modifiers={{
                        booked: bookings
                          .filter(b => b.status !== 'cancelled')
                          .map(b => parseISO(b.date))
                      }}
                      modifiersStyles={{
                        booked: { backgroundColor: 'hsl(var(--primary) / 0.2)', fontWeight: 'bold' }
                      }}
                      className="rounded-md w-full [&_table]:w-full [&_td]:p-1 [&_th]:p-1 [&_button]:h-8 [&_button]:w-8 text-sm"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="inline-block w-3 h-3 bg-primary/20 rounded mr-1"></span>
                    Days with existing bookings
                  </p>
                </div>

                {/* Time Slots & Existing Bookings Section */}
                <div className="space-y-4 min-w-0">
                  {followUpDate && (
                    <>
                      {/* Existing Bookings on Selected Date */}
                      {followUpDateBookings.length > 0 && (
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            Existing Bookings on {format(followUpDate, 'MMM d')}
                          </Label>
                          <div className="max-h-32 overflow-y-auto space-y-1 bg-amber-50 rounded-lg p-2 border border-amber-200">
                            {followUpDateBookings.map(b => (
                              <div key={b.id} className="text-sm flex items-center gap-2 p-1 bg-white rounded">
                                <Badge variant="outline" className="text-xs">{b.time_slot}</Badge>
                                <span className="truncate">{b.client?.name || 'Unknown'}</span>
                                <span className="text-muted-foreground text-xs">({b.duration_minutes}min)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Time Slot Selection */}
                      <div className="space-y-2">
                        <Label>Select Time Slot</Label>
                        {followUpAvailableSlots.filter(s => s.available).length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                            {followUpAvailableSlots.map(slot => (
                              <Button
                                key={slot.time}
                                size="sm"
                                variant={followUpTimeSlot === slot.time ? "default" : "outline"}
                                onClick={() => slot.available && setFollowUpTimeSlot(slot.time)}
                                disabled={!slot.available}
                                className={`text-xs px-2 py-1 h-7 ${followUpTimeSlot === slot.time ? 'bg-primary' : ''} ${!slot.available ? 'opacity-40 line-through' : ''}`}
                              >
                                {slot.label}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-red-500 p-2 bg-red-50 rounded">
                            No available time slots on this date!
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {!followUpDate && (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p className="text-sm">← Select a date to see available times</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes for Follow-up</Label>
                <Textarea
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  placeholder="e.g., Check on previous repair, customer requested callback, finish painting..."
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-2 border-t">
                <Button variant="outline" onClick={() => {
                  setShowFollowUpDialog(false);
                  setFollowUpDate(undefined);
                  setFollowUpTimeSlot('');
                  setFollowUpAvailableSlots([]);
                  setFollowUpDateBookings([]);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateFollowUp} 
                  disabled={!followUpDate || !followUpTimeSlot}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Create Follow-up
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Job Dialog */}
      <Dialog open={!!sendJobBookingId} onOpenChange={(open) => !open && setSendJobBookingId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-600" />
              Send Job
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select who to send this job to. They'll be able to view and manage it from their portal.
            </p>
            
            {contractors.filter(c => c.is_active).length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-3">No contractors set up yet.</p>
                <Button size="sm" onClick={() => { setSendJobBookingId(null); setShowContractors(true); setShowNewContractor(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> Add Contractor
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Select Contractor</Label>
                  <select
                    value={selectedContractorId}
                    onChange={(e) => setSelectedContractorId(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Choose...</option>
                    {contractors.filter(c => c.is_active).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setSendJobBookingId(null)}>Cancel</Button>
                  <Button
                    onClick={handleSendJob}
                    disabled={!selectedContractorId || sendingJob}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {sendingJob ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                    Send Job
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contractors Management Dialog */}
      <Dialog open={showContractors} onOpenChange={setShowContractors}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Manage Contractors
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Add New Contractor */}
            {showNewContractor ? (
              <div className="p-4 border rounded-lg bg-purple-50/50 space-y-3">
                <h4 className="font-medium">New Contractor</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Name *</Label>
                    <Input
                      value={newContractor.name}
                      onChange={(e) => setNewContractor(p => ({ ...p, name: e.target.value }))}
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">PIN Code *</Label>
                    <Input
                      value={newContractor.pin_code}
                      onChange={(e) => setNewContractor(p => ({ ...p, pin_code: e.target.value }))}
                      placeholder="4-6 digits"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Phone</Label>
                    <Input
                      value={newContractor.phone}
                      onChange={(e) => setNewContractor(p => ({ ...p, phone: e.target.value }))}
                      placeholder="Phone"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Owner Cut %</Label>
                    <Input
                      type="number"
                      value={newContractor.owner_cut_percent}
                      onChange={(e) => setNewContractor(p => ({ ...p, owner_cut_percent: parseInt(e.target.value) || 10 }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateContractor}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowNewContractor(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button size="sm" onClick={() => setShowNewContractor(true)}>
                <Plus className="w-4 h-4 mr-1" /> Add Contractor
              </Button>
            )}

            {/* Contractors List */}
            <div className="space-y-2">
              {contractors.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No contractors yet</p>
              ) : (
                contractors.map(c => (
                  <div key={c.id} className={`p-3 border rounded-lg ${c.is_active ? 'bg-white' : 'bg-gray-100 opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">PIN: {c.pin_code} | Cut: {c.owner_cut_percent}%</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={async () => {
                          await deleteContractor(c.id);
                          loadContractors();
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Job Portal Link */}
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-2">Contractors access their jobs at:</p>
              <code className="text-xs bg-secondary p-2 rounded block">{window.location.origin}/jobs</code>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;

