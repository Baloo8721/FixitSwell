import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Lock,
  Briefcase,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  CheckCircle,
  Loader2,
  LogOut,
  Wrench,
  Play,
  Square,
  Timer,
  Plus,
  X,
  ImagePlus,
  Image as ImageIcon,
  AlertCircle,
  Trash2,
  Edit2,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  CalendarDays,
  RefreshCw,
  Mic,
  MicOff,
  Sparkles,
  Wand2,
  XCircle,
  FileText,
  UserPlus,
  Calendar as CalendarIcon,
  Users
} from "lucide-react";
import { format, parseISO, isBefore, startOfToday, addDays } from "date-fns";
import {
  verifyContractorPin,
  getContractorJobs,
  getContractorStats,
  addServiceToBooking,
  removeServiceFromBooking,
  getAllServicesForDropdown,
  startJob,
  stopJob,
  getTimeEntries,
  getActiveTimeEntry,
  deleteTimeEntry,
  getBookingNotes,
  addBookingNote,
  updateBookingNote,
  deleteBookingNote,
  toggleServiceCompletion,
  updateBookingStatus,
  uploadBookingImage,
  updateBookingImages,
  addFutureRepair,
  removeFutureRepair,
  createInvoice,
  updateInvoiceAmount,
  updateInvoiceStatus,
  getBookingSupplies,
  addBookingSupply,
  deleteBookingSupply,
  generateSupplySuggestions,
  updateBookingAISummary,
  createManualBooking,
  getAvailableTimeSlots,
  getContractorAvailableTimeSlots,
  assignJobToContractor,
  addNewClient,
  getAllClients,
  getContractorClients,
  type Contractor,
  type Client,
  type JobAssignment,
  type TimeEntry,
  type BookingNote,
  type BookingSupply,
  type SuggestedSupply,
  type TimeSlot
} from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const ContractorPortal = () => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [jobs, setJobs] = useState<JobAssignment[]>([]);
  const [stats, setStats] = useState({ totalJobs: 0, completedJobs: 0, pendingJobs: 0, totalEarnings: 0, ownerCutTotal: 0 });
  const [selectedJob, setSelectedJob] = useState<JobAssignment | null>(null);
  const [allServices, setAllServices] = useState<{ id: string; label: string; category: string; price_min: number | null }[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Per-booking state (matching Admin structure exactly)
  const [timeEntries, setTimeEntries] = useState<Record<string, TimeEntry[]>>({});
  const [activeTimers, setActiveTimers] = useState<Record<string, TimeEntry | null>>({});
  const [bookingNotes, setBookingNotes] = useState<Record<string, BookingNote[]>>({});
  const [supplies, setSupplies] = useState<Record<string, BookingSupply[]>>({});
  const [quickServiceInput, setQuickServiceInput] = useState<Record<string, string>>({});
  const [showServiceSuggestions, setShowServiceSuggestions] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [newRepairContent, setNewRepairContent] = useState<Record<string, string>>({});
  
  // Invoice state
  const [invoiceBookingId, setInvoiceBookingId] = useState<string | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [editInvoiceAmount, setEditInvoiceAmount] = useState('');
  
  // Supplies state
  const [addingSupply, setAddingSupply] = useState<string | null>(null);
  const [newSupply, setNewSupply] = useState({ item: '', cost: '', quantity: '1', notes: '', receipt_number: '', store_name: '' });
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFor, setRecordingFor] = useState<{ bookingId: string; field: 'notes' | 'internal' } | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Image upload
  const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(null);
  const [activeUploadBookingId, setActiveUploadBookingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New booking modal state
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [newBookingLoading, setNewBookingLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [newBooking, setNewBooking] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    community: '',
    date: undefined as Date | undefined,
    timeSlot: '',
    durationHours: 1,
    services: [] as string[],
    notes: '',
    source: 'phone' as 'website' | 'phone' | 'in_person' | 'referral' | 'subscription' | 'other'
  });
  const [newBookingServiceSearch, setNewBookingServiceSearch] = useState('');
  
  // Duration options
  const DURATION_OPTIONS = [
    { hours: 1, label: '1 hour' },
    { hours: 2, label: '2 hours' },
    { hours: 3, label: '3 hours' },
    { hours: 4, label: '4 hours' },
  ];

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

  // My Clients (contractor's own clients) state
  const [myClients, setMyClients] = useState<Client[]>([]);
  const [showMyClients, setShowMyClients] = useState(false);
  const [myClientsSearch, setMyClientsSearch] = useState('');

  // Calendar view state
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(undefined);

  // Compute dates with bookings for calendar
  const datesWithBookings = useMemo(() => {
    const dates = new Set<string>();
    jobs.forEach(job => {
      if (job.booking?.date) dates.add(job.booking.date);
    });
    return dates;
  }, [jobs]);

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return jobs
      .filter(job => job.booking?.date === dateStr)
      .map(job => job.booking)
      .filter(Boolean);
  };

  const handleLogin = async () => {
    if (pin.length < 4) {
      toast({ title: "Invalid PIN", description: "Please enter your PIN code", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { data, error } = await verifyContractorPin(pin);
    setIsLoading(false);

    if (error || !data) {
      toast({ title: "Invalid PIN", description: "PIN code not found or inactive", variant: "destructive" });
      return;
    }

    setContractor(data);
    loadJobs(data.id);
    loadStats(data.id);
    loadServices();
    loadClients();
    loadMyClients(data.id);
  };

  const loadJobs = async (contractorId: string) => {
    const { data } = await getContractorJobs(contractorId);
    setJobs(data || []);
  };

  const loadStats = async (contractorId: string) => {
    const statsData = await getContractorStats(contractorId);
    setStats(statsData);
  };

  const loadServices = async () => {
    const { data } = await getAllServicesForDropdown();
    setAllServices(data || []);
  };

  const loadClients = async () => {
    const { data } = await getAllClients();
    setClients(data || []);
  };

  const loadMyClients = async (contractorId: string) => {
    const { data } = await getContractorClients(contractorId);
    setMyClients(data || []);
  };

  // Load time slots when date or duration changes
  const loadContractorTimeSlots = async (date: Date, durationHours: number) => {
    if (!contractor) return;
    setLoadingSlots(true);
    const durationMinutes = durationHours * 60;
    const slots = await getContractorAvailableTimeSlots(format(date, 'yyyy-MM-dd'), contractor.id, durationMinutes);
    setAvailableSlots(slots || []);
    setLoadingSlots(false);
  };

  // New booking handlers
  const handleNewBookingDateChange = async (date: Date | undefined) => {
    setNewBooking(prev => ({ ...prev, date, timeSlot: '' }));
    if (date) {
      loadContractorTimeSlots(date, newBooking.durationHours);
    }
  };
  
  const handleDurationChange = (hours: number) => {
    setNewBooking(prev => ({ ...prev, durationHours: hours, timeSlot: '' }));
    if (newBooking.date) {
      loadContractorTimeSlots(newBooking.date, hours);
    }
  };

  const handleNewBookingServiceToggle = (serviceId: string) => {
    setNewBooking(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleCreateBooking = async () => {
    if (!newBooking.date || !newBooking.timeSlot || !newBooking.name || !newBooking.phone) {
      toast({
        title: "Missing required fields",
        description: "Please fill in name, phone, date and time",
        variant: "destructive"
      });
      return;
    }

    setNewBookingLoading(true);
    
    const { data, error } = await createManualBooking({
      name: newBooking.name,
      email: newBooking.email || `${newBooking.phone.replace(/\D/g, '')}@placeholder.local`,
      phone: newBooking.phone,
      address: newBooking.address || null,
      community: newBooking.community || null,
      date: format(newBooking.date, 'yyyy-MM-dd'),
      time_slot: newBooking.timeSlot,
      duration_minutes: newBooking.durationHours * 60,
      services: newBooking.services,
      notes: newBooking.notes || null,
      booking_source: newBooking.source
    });
    
    const booking = data?.booking;

    if (error) {
      toast({ title: "Error", description: "Failed to create booking", variant: "destructive" });
      setNewBookingLoading(false);
      return;
    }

    // Auto-assign to this contractor
    if (booking && contractor) {
      await assignJobToContractor(booking.id, contractor.id, 'contractor');
    }

    toast({ title: "Booking created!", description: "This job has been assigned to you" });
    setShowNewBooking(false);
    setNewBooking({
      name: '',
      email: '',
      phone: '',
      address: '',
      community: '',
      date: undefined,
      timeSlot: '',
      durationHours: 1,
      services: [],
      notes: '',
      source: 'phone'
    });
    setNewBookingServiceSearch('');
    setNewBookingLoading(false);
    
    // Refresh jobs list
    if (contractor) {
      loadJobs(contractor.id);
      loadStats(contractor.id);
    }
  };

  // New client handler
  const handleCreateClient = async () => {
    if (!newClient.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    setNewClientLoading(true);
    const { error } = await addNewClient({
      name: newClient.name,
      phone: newClient.phone || null,
      email: newClient.email || null,
      address: newClient.address || null,
      community: newClient.community || null,
      is_senior: newClient.is_senior,
      is_military: newClient.is_military,
      created_by_contractor_id: contractor?.id
    });

    setNewClientLoading(false);

    if (error) {
      toast({ title: "Error", description: "Failed to add client", variant: "destructive" });
    } else {
      toast({ title: "Client added", description: `${newClient.name} has been added to your clients` });
      setShowNewClient(false);
      setNewClient({ name: '', phone: '', email: '', address: '', community: '', is_senior: false, is_military: false });
      // Refresh contractor's clients list
      if (contractor) {
        loadMyClients(contractor.id);
        loadClients(); // Also refresh main clients list for new booking dropdown
      }
    }
  };

  const handleLogout = () => {
    setContractor(null);
    setJobs([]);
    setPin('');
    setSelectedJob(null);
  };

  const openJobDetails = async (job: JobAssignment) => {
    setSelectedJob(job);
    if (job.booking?.id) {
      const bookingId = job.booking.id;
      // Load time entries
      const { data: entries } = await getTimeEntries(bookingId);
      setTimeEntries(prev => ({ ...prev, [bookingId]: entries || [] }));
      const { data: activeEntry } = await getActiveTimeEntry(bookingId);
      setActiveTimers(prev => ({ ...prev, [bookingId]: activeEntry }));
      
      // Load notes
      const { data: notes } = await getBookingNotes(bookingId);
      setBookingNotes(prev => ({ ...prev, [bookingId]: notes || [] }));
      
      // Load supplies
      const suppliesData = await getBookingSupplies(bookingId);
      setSupplies(prev => ({ ...prev, [bookingId]: suppliesData }));
    }
  };

  const refreshCurrentJob = async () => {
    if (!contractor || !selectedJob) return;
    const { data } = await getContractorJobs(contractor.id);
    setJobs(data || []);
    const updated = data?.find(j => j.id === selectedJob.id);
    if (updated) {
      setSelectedJob(updated);
      if (updated.booking?.id) {
        const bookingId = updated.booking.id;
        const { data: entries } = await getTimeEntries(bookingId);
        setTimeEntries(prev => ({ ...prev, [bookingId]: entries || [] }));
        const { data: activeEntry } = await getActiveTimeEntry(bookingId);
        setActiveTimers(prev => ({ ...prev, [bookingId]: activeEntry }));
        const { data: notes } = await getBookingNotes(bookingId);
        setBookingNotes(prev => ({ ...prev, [bookingId]: notes || [] }));
        const suppliesData = await getBookingSupplies(bookingId);
        setSupplies(prev => ({ ...prev, [bookingId]: suppliesData }));
      }
    }
    if (contractor) loadStats(contractor.id);
  };

  // Voice-to-text handlers
  const startVoiceRecording = (bookingId: string, field: 'notes' | 'internal') => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({ title: "Not supported", description: "Voice recognition not available in this browser", variant: "destructive" });
      return;
    }

    const SpeechRecognition = (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (field === 'internal') {
        setNewNoteContent(prev => ({ ...prev, [bookingId]: (prev[bookingId] || '') + transcript }));
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setRecordingFor(null);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setRecordingFor(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setRecordingFor({ bookingId, field });
    toast({ title: "Recording started", description: "Speak now..." });
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setRecordingFor(null);
  };

  // Service handlers
  const handleQuickAddService = async (bookingId: string, serviceName: string) => {
    if (!serviceName.trim()) return;
    const { error } = await addServiceToBooking(bookingId, serviceName.trim());
    if (error) {
      toast({ title: "Error", description: "Failed to add service", variant: "destructive" });
    } else {
      toast({ title: "Service added" });
      setQuickServiceInput(prev => ({ ...prev, [bookingId]: '' }));
      setShowServiceSuggestions(null);
      refreshCurrentJob();
    }
  };

  const handleRemoveService = async (bookingId: string, serviceId: string) => {
    const { error } = await removeServiceFromBooking(bookingId, serviceId);
    if (!error) refreshCurrentJob();
  };

  const handleToggleServiceCompletion = async (bookingId: string, serviceId: string) => {
    await toggleServiceCompletion(bookingId, serviceId);
    refreshCurrentJob();
  };

  // Note handlers
  const handleAddNote = async (bookingId: string) => {
    const content = newNoteContent[bookingId]?.trim();
    if (!content) return;
    const { error } = await addBookingNote(bookingId, content, 'general');
    if (error) {
      toast({ title: "Error", description: "Failed to add note", variant: "destructive" });
    } else {
      setNewNoteContent(prev => ({ ...prev, [bookingId]: '' }));
      refreshCurrentJob();
    }
  };

  const handleUpdateNote = async (noteId: string, bookingId: string) => {
    const { error } = await updateBookingNote(noteId, editingNoteContent);
    if (!error) {
      setEditingNoteId(null);
      setEditingNoteContent('');
      refreshCurrentJob();
    }
  };

  const handleDeleteNote = async (noteId: string, bookingId: string) => {
    const { error } = await deleteBookingNote(noteId);
    if (!error) refreshCurrentJob();
  };

  // Future repair handlers
  const handleAddFutureRepair = async (bookingId: string) => {
    const repair = newRepairContent[bookingId]?.trim();
    if (!repair) return;
    const { error } = await addFutureRepair(bookingId, repair);
    if (!error) {
      setNewRepairContent(prev => ({ ...prev, [bookingId]: '' }));
      refreshCurrentJob();
    }
  };

  const handleRemoveFutureRepair = async (bookingId: string, index: number) => {
    await removeFutureRepair(bookingId, index);
    refreshCurrentJob();
  };

  // Invoice handlers
  const handleCreateInvoice = async (bookingId: string) => {
    const amount = parseFloat(invoiceAmount);
    const deposit = depositAmount ? parseFloat(depositAmount) : undefined;
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    setCreatingInvoice(true);
    const { error } = await createInvoice(bookingId, amount, deposit);
    setCreatingInvoice(false);
    if (!error) {
      toast({ title: "Invoice created" });
      setInvoiceBookingId(null);
      setInvoiceAmount('');
      setDepositAmount('');
      refreshCurrentJob();
    }
  };

  const handleUpdateInvoiceAmount = async (bookingId: string) => {
    const amount = parseFloat(editInvoiceAmount);
    if (isNaN(amount) || amount <= 0) return;
    await updateInvoiceAmount(bookingId, amount);
    setEditingInvoiceId(null);
    setEditInvoiceAmount('');
    refreshCurrentJob();
  };

  const handleCollectPayment = async (bookingId: string, method: 'cash' | 'check') => {
    await updateInvoiceStatus(bookingId, 'paid');
    toast({ title: "Payment collected", description: `Marked as paid via ${method}` });
    refreshCurrentJob();
  };

  const handleMarkPaid = async (bookingId: string) => {
    await updateInvoiceStatus(bookingId, 'paid');
    toast({ title: "Payment marked as received" });
    refreshCurrentJob();
  };

  // Supply handlers
  const handleAddSupply = async (bookingId: string) => {
    if (!newSupply.item.trim() || !newSupply.cost) return;
    const { error } = await addBookingSupply(
      bookingId,
      newSupply.item,
      parseFloat(newSupply.cost),
      parseInt(newSupply.quantity) || 1,
      newSupply.notes || undefined,
      newSupply.receipt_number || undefined,
      newSupply.store_name || undefined
    );
    if (!error) {
      setNewSupply({ item: '', cost: '', quantity: '1', notes: '', receipt_number: '', store_name: '' });
      setAddingSupply(null);
      const suppliesData = await getBookingSupplies(bookingId);
      setSupplies(prev => ({ ...prev, [bookingId]: suppliesData }));
    }
  };

  const handleDeleteSupply = async (supplyId: string, bookingId: string) => {
    await deleteBookingSupply(supplyId);
    const suppliesData = await getBookingSupplies(bookingId);
    setSupplies(prev => ({ ...prev, [bookingId]: suppliesData }));
  };

  // AI suggestions
  const handleGenerateAISuggestions = async (booking: JobAssignment['booking']) => {
    if (!booking) return;
    setGeneratingAI(booking.id);
    
    const clientNotes = booking.notes || '';
    const adminNotes = (bookingNotes[booking.id] || []).map(n => n.content).join(' ');
    const serviceNames = (booking.services || []).map(s => s.service?.name || '').filter(Boolean);
    
    const suggestions = generateSupplySuggestions(clientNotes, adminNotes, serviceNames);
    
    await updateBookingAISummary(booking.id, {
      ...booking.ai_summary,
      suggested_supplies: suggestions,
      generated_at: new Date().toISOString()
    });
    
    setGeneratingAI(null);
    toast({ title: "AI suggestions generated" });
    refreshCurrentJob();
  };

  // Image upload
  const handleAdminImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, booking: JobAssignment['booking']) => {
    if (!e.target.files?.length || !booking) return;
    setUploadingImageFor(booking.id);
    
    const newUrls: string[] = [];
    for (const file of Array.from(e.target.files)) {
      const { data } = await uploadBookingImage(file, booking.id);
      if (data) newUrls.push(data.url);
    }
    
    if (newUrls.length > 0) {
      const existingImages = booking.images || [];
      await updateBookingImages(booking.id, [...existingImages, ...newUrls]);
      refreshCurrentJob();
    }
    
    setUploadingImageFor(null);
    e.target.value = '';
  };

  // Status update
  const handleStatusUpdate = async (bookingId: string, status: string) => {
    setUpdatingId(bookingId);
    // Use 'staff' since contractors are staff members (cancelled_by only accepts 'customer' or 'staff')
    await updateBookingStatus(bookingId, status, 'staff');
    await refreshCurrentJob();
    setUpdatingId(null);
    toast({ title: `Status updated to ${status}` });
  };

  // Get service suggestions
  const getServiceSuggestions = (query: string, existingServices: { service?: { name?: string } }[]) => {
    const existingNames = existingServices.map(s => s.service?.name?.toLowerCase() || '');
    return allServices.filter(s => 
      s.label.toLowerCase().includes(query.toLowerCase()) &&
      !existingNames.includes(s.label.toLowerCase())
    );
  };

  // Get status badge (matching Admin exactly)
  const getStatusBadge = (status: string, cancelledBy?: string | null) => {
    switch (status) {
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Pending</Badge>;
      case 'confirmed': return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Confirmed</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-700 border-green-300">Completed</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-700 border-red-300">Cancelled{cancelledBy === 'customer' ? ' by customer' : ''}</Badge>;
      case 'no_show': return <Badge className="bg-gray-100 text-gray-700 border-gray-300">No Show</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const booking = selectedJob?.booking;
  const bookingId = booking?.id || '';
  const entries = timeEntries[bookingId] || [];
  const activeTimer = activeTimers[bookingId];
  const notes = bookingNotes[bookingId] || [];
  const bookingSupplies = supplies[bookingId] || [];

  // PIN Login Screen
  if (!contractor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-sm w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Job Portal</CardTitle>
            <p className="text-sm text-muted-foreground">Enter your PIN to view assigned jobs</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>PIN Code</Label>
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>
            <Button onClick={handleLogin} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Briefcase className="w-4 h-4 mr-2" />}
              Access Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Portal
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="font-heading text-lg font-bold">Job Portal</h1>
              <p className="text-sm text-muted-foreground">Welcome, {contractor.name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Exit
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => setShowNewBooking(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              New Booking
            </Button>
            <Button onClick={() => setShowNewClient(true)} variant="outline" size="sm">
              <UserPlus className="w-4 h-4 mr-1" />
              Add Client
            </Button>
            <Button onClick={() => setShowMyClients(true)} variant="outline" size="sm">
              <Users className="w-4 h-4 mr-1" />
              My Clients ({myClients.length})
            </Button>
            <Button onClick={() => setShowCalendarView(true)} variant="outline" size="icon" className="h-9 w-9" title="Calendar View">
              <CalendarIcon className="w-4 h-4" />
            </Button>
            <Button onClick={() => contractor && loadJobs(contractor.id)} variant="outline" size="icon" className="h-9 w-9" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <Briefcase className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-700">{stats.pendingJobs}</p>
              <p className="text-xs text-blue-600">Pending Jobs</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-700">{stats.completedJobs}</p>
              <p className="text-xs text-green-600">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200 col-span-2">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-700">${(stats.totalEarnings / 100).toFixed(2)}</p>
              <p className="text-xs text-purple-600">Your Total Earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">Your Jobs</h2>
          
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No jobs assigned yet</p>
              </CardContent>
            </Card>
          ) : (
            jobs.map(job => (
              <Card 
                key={job.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${
                  job.booking?.status === 'completed' ? 'border-l-green-500 opacity-70' :
                  job.booking?.status === 'confirmed' ? 'border-l-blue-500' :
                  'border-l-yellow-500'
                }`}
                onClick={() => openJobDetails(job)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">{job.booking?.client?.name || 'Client'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        {job.booking?.date ? format(parseISO(job.booking.date), 'MMM d, yyyy') : 'No date'}
                        <Clock className="w-3 h-3 ml-2 flex-shrink-0" />
                        {job.booking?.time_slot || 'No time'}
                      </div>
                      {job.booking?.client?.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{job.booking.client.address}</span>
                        </div>
                      )}
                    </div>
                    {job.booking?.status && getStatusBadge(job.booking.status)}
                  </div>
                  {job.status === 'completed' && job.contractor_earnings && (
                    <div className="mt-2 pt-2 border-t text-sm text-green-600 font-medium">
                      Earned: ${(job.contractor_earnings / 100).toFixed(2)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Job Details Modal - EXACT same structure as Admin */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className={`w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden border-l-4 ${
          booking?.status === 'pending' ? 'border-l-yellow-500' :
          booking?.status === 'confirmed' ? 'border-l-blue-500' :
          booking?.status === 'completed' ? 'border-l-green-500' :
          booking?.status === 'cancelled' ? 'border-l-red-500' :
          booking?.status === 'no_show' ? 'border-l-gray-500' : ''
        } [&_*]:max-w-full [&_input]:min-w-0 [&_textarea]:min-w-0`}>
          <DialogHeader className={`pb-3 border-b ${
            booking?.status === 'pending' ? 'border-yellow-200 bg-yellow-50/50' :
            booking?.status === 'confirmed' ? 'border-blue-200 bg-blue-50/50' :
            booking?.status === 'completed' ? 'border-green-200 bg-green-50/50' :
            booking?.status === 'cancelled' ? 'border-red-200 bg-red-50/50' :
            booking?.status === 'no_show' ? 'border-gray-200 bg-gray-50/50' : ''
          } -mx-6 -mt-6 px-6 pt-6 rounded-t-lg`}>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <CalendarDays className="w-5 h-5" />
              {booking?.client?.name} - {booking?.date ? format(parseISO(booking.date), 'MMM d, yyyy') : ''} @ {booking?.time_slot}
              {booking?.status && getStatusBadge(booking.status, booking.cancelled_by)}
            </DialogTitle>
          </DialogHeader>

          {booking ? (
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
                    
                    {/* Pet Info */}
                    {booking.client && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-2">🐾 Pet Info</p>
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
                              <p className="text-xs text-muted-foreground">Names: {booking.client.pet_info.names}</p>
                            )}
                            {booking.client.pet_info.breeds && (
                              <p className="text-xs text-muted-foreground">Breeds: {booking.client.pet_info.breeds}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">No pet info</span>
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
                      {booking.services.map((s: { id?: string; service?: { id?: string; name?: string }; is_completed?: boolean }, i: number) => {
                        const serviceId = s.service?.id || s.service?.name || `service-${i}`;
                        const isCompleted = s.is_completed || (booking.completed_services || []).includes(serviceId);
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
                              onClick={() => handleToggleServiceCompletion(bookingId, serviceId)}
                            >
                              <Checkbox 
                                checked={isCompleted}
                                className={isCompleted ? 'bg-green-600 border-green-600' : ''}
                              />
                              <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>
                                {s.service?.name || 'Service'}
                              </span>
                            </div>
                            {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {s.service?.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveService(bookingId, s.service!.id!);
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
                        value={quickServiceInput[bookingId] || ''}
                        onChange={(e) => {
                          setQuickServiceInput(prev => ({ ...prev, [bookingId]: e.target.value }));
                          setShowServiceSuggestions(e.target.value.length > 0 ? bookingId : null);
                        }}
                        onFocus={() => {
                          if ((quickServiceInput[bookingId] || '').length > 0) {
                            setShowServiceSuggestions(bookingId);
                          }
                        }}
                        onBlur={() => setTimeout(() => setShowServiceSuggestions(null), 200)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuickAddService(bookingId, quickServiceInput[bookingId] || '');
                          }
                        }}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleQuickAddService(bookingId, quickServiceInput[bookingId] || '')}
                        disabled={!quickServiceInput[bookingId]?.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {showServiceSuggestions === bookingId && (quickServiceInput[bookingId] || '').length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {getServiceSuggestions(quickServiceInput[bookingId] || '', booking.services || []).slice(0, 8).map((opt) => (
                          <button
                            key={opt.id}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleQuickAddService(bookingId, opt.id);
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                        {getServiceSuggestions(quickServiceInput[bookingId] || '', booking.services || []).length === 0 && (
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
                      <p className="text-sm mt-1 p-2 bg-background rounded border">{booking.notes}</p>
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

              {/* AI Summary Section */}
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
                        {booking.ai_summary.skills_needed.map((skill: string, i: number) => (
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

              {/* Staff Notes Section */}
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  Staff Notes ({notes.length})
                </h4>
                
                <div className="space-y-2 mb-3">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div key={note.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg group">
                        {editingNoteId === note.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingNoteContent}
                              onChange={(e) => setEditingNoteContent(e.target.value)}
                              rows={2}
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleUpdateNote(note.id, bookingId)}>
                                <CheckCircle className="w-3 h-3 mr-1" /> Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditingNoteId(null);
                                setEditingNoteContent('');
                              }}>
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
                                  onClick={() => handleDeleteNote(note.id, bookingId)}
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
                    className="flex-1 min-w-0 text-sm"
                    placeholder="Add a note..."
                    value={newNoteContent[bookingId] || ''}
                    onChange={(e) => setNewNoteContent(prev => ({ ...prev, [bookingId]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddNote(bookingId);
                      }
                    }}
                  />
                  {/* Voice Recording Button */}
                  <Button
                    size="sm"
                    variant={isRecording && recordingFor?.bookingId === bookingId && recordingFor?.field === 'internal' ? 'destructive' : 'outline'}
                    onClick={() => {
                      if (isRecording && recordingFor?.bookingId === bookingId) {
                        stopVoiceRecording();
                      } else {
                        startVoiceRecording(bookingId, 'internal');
                      }
                    }}
                    title="Voice to text"
                  >
                    {isRecording && recordingFor?.bookingId === bookingId && recordingFor?.field === 'internal' ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAddNote(bookingId)}
                    disabled={!newNoteContent[bookingId]?.trim()}
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
                
                <div className="space-y-2 mb-3">
                  {(booking.future_repairs || []).length > 0 ? (
                    (booking.future_repairs || []).map((repair: string, idx: number) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded-lg text-sm group"
                      >
                        <span>{repair}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveFutureRepair(bookingId, idx)}
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
                    className="flex-1 min-w-0 text-sm"
                    placeholder="Add future repair suggestion..."
                    value={newRepairContent[bookingId] || ''}
                    onChange={(e) => setNewRepairContent(prev => ({ ...prev, [bookingId]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddFutureRepair(bookingId);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddFutureRepair(bookingId)}
                    disabled={!newRepairContent[bookingId]?.trim()}
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
                
                {booking.images && booking.images.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
                    {booking.images.map((url: string, idx: number) => (
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
                  ref={activeUploadBookingId === bookingId ? fileInputRef : undefined}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleAdminImageUpload(e, booking)}
                  className="hidden"
                  id={`upload-${bookingId}`}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveUploadBookingId(bookingId);
                    setTimeout(() => {
                      document.getElementById(`upload-${bookingId}`)?.click();
                    }, 0);
                  }}
                  disabled={uploadingImageFor === bookingId}
                >
                  {uploadingImageFor === bookingId ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <ImagePlus className="w-4 h-4 mr-1" />
                  )}
                  {uploadingImageFor === bookingId ? 'Uploading...' : 'Add Photos'}
                </Button>
              </div>

              {/* Invoice & Supplies Section */}
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                <h4 className="font-heading font-semibold text-foreground flex items-center gap-2">
                  Invoice & Supplies
                </h4>
                
                {/* Invoice Status */}
                {booking.invoice_status === 'none' || !booking.invoice_amount ? (
                  invoiceBookingId === bookingId ? (
                    <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`invoice-${bookingId}`} className="text-sm">Invoice Amount ($)</Label>
                          <Input
                            id={`invoice-${bookingId}`}
                            type="number"
                            step="0.01"
                            value={invoiceAmount}
                            onChange={(e) => setInvoiceAmount(e.target.value)}
                            placeholder="150.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`deposit-${bookingId}`} className="text-sm">Deposit Amount (optional)</Label>
                          <Input
                            id={`deposit-${bookingId}`}
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
                          onClick={() => handleCreateInvoice(bookingId)}
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
                    <Button size="sm" variant="outline" onClick={() => setInvoiceBookingId(bookingId)}>
                      Create Invoice
                    </Button>
                  )
                ) : (
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      {editingInvoiceId === bookingId ? (
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
                          <Button size="sm" onClick={() => handleUpdateInvoiceAmount(bookingId)}>Save</Button>
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
                                setEditingInvoiceId(bookingId);
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
                              <AlertDialogAction onClick={() => handleCollectPayment(bookingId, 'cash')} className="bg-green-600">
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
                              <AlertDialogAction onClick={() => handleCollectPayment(bookingId, 'check')} className="bg-green-600">
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
                              <AlertDialogAction onClick={() => handleMarkPaid(bookingId)} className="bg-green-600">
                                Yes, Card Payment Received
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                        const { data: entriesData } = await getTimeEntries(bookingId);
                        setTimeEntries(prev => ({ ...prev, [bookingId]: entriesData || [] }));
                        const { data: active } = await getActiveTimeEntry(bookingId);
                        setActiveTimers(prev => ({ ...prev, [bookingId]: active }));
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                  {entries.length > 0 ? (
                    <div className="space-y-1 bg-blue-50/50 rounded-lg p-2">
                      {entries.map((entry, idx) => (
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
                                await deleteTimeEntry(entry.id, bookingId);
                                refreshCurrentJob();
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
                    {addingSupply !== bookingId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAddingSupply(bookingId)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                  
                  {bookingSupplies.length > 0 && (
                    <ul className="space-y-1 mb-2">
                      {bookingSupplies.map(supply => (
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
                            onClick={() => handleDeleteSupply(supply.id, bookingId)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </li>
                      ))}
                      <li className="text-sm font-medium pt-1 border-t">
                        Total: ${bookingSupplies.reduce((sum, s) => sum + (s.cost * s.quantity), 0).toFixed(2)}
                      </li>
                    </ul>
                  )}
                  
                  {addingSupply === bookingId && (
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
                        <Button size="sm" onClick={() => handleAddSupply(bookingId)}>
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
                      disabled={generatingAI === bookingId}
                    >
                      {generatingAI === bookingId ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-1" />
                      )}
                      {booking.ai_summary?.suggested_supplies?.length ? 'Regenerate' : 'Generate'}
                    </Button>
                  </div>
                  
                  {booking.ai_summary?.suggested_supplies?.length ? (
                    <div className="space-y-1">
                      {booking.ai_summary.suggested_supplies.map((suggestion: SuggestedSupply, idx: number) => (
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
                                setAddingSupply(bookingId);
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
                      onClick={() => handleStatusUpdate(bookingId, 'confirmed')}
                      disabled={updatingId === bookingId}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {updatingId === bookingId ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      Confirm
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={updatingId === bookingId}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel the booking for {booking.client?.name} on {format(parseISO(booking.date), 'MMMM d')} at {booking.time_slot}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleStatusUpdate(bookingId, 'cancelled')}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, Cancel Booking
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <>
                    {/* Start/Stop Job Timer */}
                    {!activeTimer ? (
                      <Button
                        size="sm"
                        onClick={async () => {
                          setUpdatingId(bookingId);
                          const { data, error } = await startJob(bookingId);
                          if (error) {
                            toast({ title: "Error", description: error.message, variant: "destructive" });
                          } else {
                            setActiveTimers(prev => ({ ...prev, [bookingId]: data }));
                            toast({ title: "Timer Started", description: "Timer is now running" });
                          }
                          await refreshCurrentJob();
                          setUpdatingId(null);
                        }}
                        disabled={updatingId === bookingId}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updatingId === bookingId ? (
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
                          setUpdatingId(bookingId);
                          const { data, error } = await stopJob(bookingId);
                          if (error) {
                            toast({ title: "Error", description: error.message, variant: "destructive" });
                          } else {
                            setActiveTimers(prev => ({ ...prev, [bookingId]: null }));
                            const { data: entriesData } = await getTimeEntries(bookingId);
                            setTimeEntries(prev => ({ ...prev, [bookingId]: entriesData || [] }));
                            toast({ title: "Timer Stopped", description: `Recorded ${data?.duration_minutes || 0} minutes` });
                          }
                          await refreshCurrentJob();
                          setUpdatingId(null);
                        }}
                        disabled={updatingId === bookingId}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {updatingId === bookingId ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <Square className="w-4 h-4 mr-1" />
                        )}
                        Stop Timer
                      </Button>
                    )}
                    {/* Show running indicator */}
                    {activeTimer && (
                      <span className="flex items-center gap-1 text-sm text-orange-600 font-medium animate-pulse">
                        <Timer className="w-4 h-4" />
                        Running since {format(parseISO(activeTimer.started_at), 'h:mm a')}
                      </span>
                    )}
                    {/* Complete Job Button */}
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(bookingId, 'completed')}
                      disabled={updatingId === bookingId || !!activeTimer}
                      className="bg-primary hover:bg-primary/90"
                      title={activeTimer ? "Stop timer first" : "Mark job as complete"}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(bookingId, 'no_show')}
                      disabled={updatingId === bookingId}
                    >
                      No Show
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={updatingId === bookingId}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel the booking for {booking.client?.name} on {format(parseISO(booking.date), 'MMMM d')} at {booking.time_slot}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleStatusUpdate(bookingId, 'cancelled')}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, Cancel Booking
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

                {/* Quote Button */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toast({ title: "Quote feature", description: "Use admin panel for quote messaging" });
                    }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    {booking.status === 'completed' ? 'Invoice' : 'Quote'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Loading job details...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Booking Dialog */}
      <Dialog open={showNewBooking} onOpenChange={setShowNewBooking}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Booking
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Quick Select Existing Client */}
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

            {/* Client Info */}
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
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
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

            {/* Duration Block Selection */}
            <div className="space-y-2">
              <Label>Time Block</Label>
              <div className="grid grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.hours}
                    onClick={() => handleDurationChange(option.hours)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      newBooking.durationHours === option.hours
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5 text-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <CalendarComponent
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
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
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
                {newBooking.timeSlot && newBooking.date && (
                  <div className="bg-primary/10 rounded-lg p-2 text-center mt-2">
                    <p className="text-primary font-medium text-sm">
                      Selected: {format(newBooking.date, 'MMM d')} at {availableSlots.find(s => s.time === newBooking.timeSlot)?.label} ({newBooking.durationHours}hr block)
                    </p>
                  </div>
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

      {/* Add Client Dialog */}
      <Dialog open={showNewClient} onOpenChange={setShowNewClient}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add New Client
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={newClient.is_senior}
                  onCheckedChange={(checked) => setNewClient(prev => ({ ...prev, is_senior: !!checked }))}
                />
                <span className="text-sm">Senior (65+)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={newClient.is_military}
                  onCheckedChange={(checked) => setNewClient(prev => ({ ...prev, is_military: !!checked }))}
                />
                <span className="text-sm">Military/Vet</span>
              </label>
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

      {/* Calendar View Dialog */}
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
              <CalendarComponent
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
                  ? `Jobs for ${format(selectedCalendarDate, 'EEEE, MMMM d, yyyy')}`
                  : 'Select a date to see jobs'
                }
              </h3>
              {selectedCalendarDate && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {getBookingsForDate(selectedCalendarDate).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No jobs on this date.</p>
                  ) : (
                    getBookingsForDate(selectedCalendarDate).map((bookingItem) => bookingItem && (
                      <div 
                        key={bookingItem.id} 
                        className={`p-3 rounded-lg border cursor-pointer hover:ring-2 hover:ring-primary transition-all ${
                          bookingItem.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                          bookingItem.status === 'confirmed' ? 'bg-blue-50 border-blue-200' :
                          bookingItem.status === 'completed' ? 'bg-green-50 border-green-200' :
                          'bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => {
                          setShowCalendarView(false);
                          const job = jobs.find(j => j.booking?.id === bookingItem.id);
                          if (job) openJobDetails(job);
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{bookingItem.client?.name}</span>
                          {getStatusBadge(bookingItem.status)}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {bookingItem.time_slot}
                        </p>
                        {bookingItem.client?.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {bookingItem.client.phone}
                          </p>
                        )}
                        {bookingItem.client?.address && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {bookingItem.client.address}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* My Clients Dialog */}
      <Dialog open={showMyClients} onOpenChange={setShowMyClients}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              My Clients ({myClients.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Search */}
            <Input
              placeholder="Search clients by name, phone, or address..."
              value={myClientsSearch}
              onChange={(e) => setMyClientsSearch(e.target.value)}
            />
            
            {/* Client List */}
            {myClients.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No clients yet.</p>
                <p className="text-sm">Add clients using the "Add Client" button.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {myClients
                  .filter(c => 
                    myClientsSearch === '' ||
                    c.name.toLowerCase().includes(myClientsSearch.toLowerCase()) ||
                    c.phone?.toLowerCase().includes(myClientsSearch.toLowerCase()) ||
                    c.email?.toLowerCase().includes(myClientsSearch.toLowerCase()) ||
                    c.address?.toLowerCase().includes(myClientsSearch.toLowerCase())
                  )
                  .map(client => (
                  <div 
                    key={client.id} 
                    className="p-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => {
                      // Quick select for new booking
                      setNewBooking(prev => ({
                        ...prev,
                        name: client.name,
                        email: client.email || '',
                        phone: client.phone || '',
                        address: client.address || '',
                        community: client.community || ''
                      }));
                      setShowMyClients(false);
                      setShowNewBooking(true);
                      toast({ title: "Client selected", description: `${client.name} selected for new booking` });
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{client.name}</p>
                        {client.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {client.phone}
                          </p>
                        )}
                        {client.email && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {client.email}
                          </p>
                        )}
                        {client.address && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {client.address}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {client.is_senior && (
                          <Badge variant="outline" className="text-xs">65+</Badge>
                        )}
                        {client.is_military && (
                          <Badge variant="outline" className="text-xs">🎖️</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add New Client Button */}
            <div className="pt-4 border-t flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Click a client to start a new booking</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowMyClients(false);
                  setShowNewClient(true);
                }}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Add New Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractorPortal;
