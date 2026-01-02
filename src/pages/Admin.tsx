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
  ArrowDown
} from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
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
  createInvoice,
  updateInvoiceStatus,
  getBookingSupplies,
  addBookingSupply,
  deleteBookingSupply,
  markPaymentCollected,
  deleteBooking,
  DEFAULT_TIME_SLOTS,
  type BookingWithDetails,
  type Booking,
  type BookingSupply,
  type TimeSlot,
  SERVICE_OPTIONS
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
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, completedUnpaid: 0, completedNoInvoice: 0, totalUnpaid: 0, needsAttention: 0 });
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
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
    notes: ''
  });

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
  const [supplies, setSupplies] = useState<Record<string, BookingSupply[]>>({});
  const [newSupply, setNewSupply] = useState({ item: '', cost: '', quantity: '1', notes: '' });
  const [addingSupply, setAddingSupply] = useState<string | null>(null);

  const loadSupplies = async (bookingId: string) => {
    const data = await getBookingSupplies(bookingId);
    setSupplies(prev => ({ ...prev, [bookingId]: data }));
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

  // Sort state
  const [sortBy, setSortBy] = useState<'scheduled' | 'created'>('scheduled');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

    const { error } = await addBookingSupply(bookingId, newSupply.item, cost, quantity, newSupply.notes || undefined);
    if (error) {
      toast({
        title: "Error adding supply",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setNewSupply({ item: '', cost: '', quantity: '1', notes: '' });
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
      notes: newBooking.notes
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
        notes: ''
      });
      loadBookings();
    }
  };

  const handleAdminImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, booking: BookingWithDetails) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImageFor(booking.id);
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
        loadBookings();
      }
    }

    setUploadingImageFor(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

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
    setSavingNotes(true);
    const { error } = await updateBookingNotes(bookingId, notesValue);
    setSavingNotes(false);

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
      loadBookings();
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
    
    // Filter by needs attention (completed: either unpaid or no invoice)
    if (statusFilter === 'needs_attention') {
      if (booking.status !== 'completed') {
        return false;
      }
      // Must be either: has invoice but unpaid, OR no invoice at all
      const hasUnpaidInvoice = booking.invoice_amount && booking.invoice_status !== 'paid';
      const hasNoInvoice = !booking.invoice_amount;
      if (!hasUnpaidInvoice && !hasNoInvoice) {
        return false;
      }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <Home className="w-5 h-5" />
              </Link>
              <h1 className="font-heading text-2xl font-bold text-foreground">Admin Dashboard</h1>
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
                      <Label>Services</Label>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {SERVICE_OPTIONS.filter(s => s.category === 'service').map((service) => (
                          <label
                            key={service.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                              newBooking.services.includes(service.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/30'
                            }`}
                          >
                            <Checkbox
                              checked={newBooking.services.includes(service.id)}
                              onCheckedChange={() => handleNewBookingServiceToggle(service.id)}
                            />
                            <span className="text-sm">{service.label}</span>
                          </label>
                        ))}
                      </div>
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
              <Button onClick={loadBookings} variant="outline" size="sm" className="gap-2">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
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
                  {stats.completedUnpaid > 0 && <p>{stats.completedUnpaid} unpaid</p>}
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
              <AlertDialog>
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
                    <AlertDialogDescription>
                      <p className="mb-2">Are you sure you want to <strong>permanently delete</strong> these bookings?</p>
                      <p className="text-red-600 font-medium">⚠️ This action cannot be undone!</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-700"
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
                        className={`overflow-hidden border-l-4 ${
                          booking.status === 'pending' ? 'border-l-yellow-500 bg-yellow-50/30' :
                          booking.status === 'confirmed' ? 'border-l-blue-500 bg-blue-50/30' :
                          booking.status === 'completed' ? 'border-l-green-500 bg-green-50/30' :
                          booking.status === 'cancelled' ? 'border-l-red-500 bg-red-50/30' :
                          booking.status === 'no_show' ? 'border-l-gray-500 bg-gray-50/30' : ''
                        }`}
                      >
                        <Collapsible
                          open={expandedBooking === booking.id}
                          onOpenChange={() => setExpandedBooking(
                            expandedBooking === booking.id ? null : booking.id
                          )}
                        >
                          <CollapsibleTrigger asChild>
                            <div className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {/* Selection Checkbox */}
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                      checked={selectedBookings.has(booking.id)}
                                      onCheckedChange={() => toggleBookingSelection(booking.id)}
                                    />
                                  </div>
                                  {/* Show scheduled date when sorting by created */}
                                  {sortBy === 'created' && (
                                    <div className="flex items-center gap-1 min-w-[90px] text-xs text-muted-foreground">
                                      <CalendarDays className="w-3 h-3" />
                                      <span>{format(parseISO(booking.date), 'MMM d')}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 min-w-[100px]">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{getTimeLabel(booking.time_slot)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{booking.client?.name || 'Unknown'}</span>
                                  </div>
                                  {/* Show created date when sorting by created */}
                                  {sortBy === 'created' && (
                                    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                                      <span>Created: {format(parseISO(booking.created_at), 'MMM d, h:mm a')}</span>
                                    </div>
                                  )}
                                  {booking.client?.address && (
                                    <div className="hidden md:flex items-center gap-2 text-muted-foreground">
                                      <MapPin className="w-4 h-4" />
                                      <span className="text-sm truncate max-w-[200px]">{booking.client.address}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                  {/* Payment Status Indicator */}
                                  {booking.invoice_amount ? (
                                    booking.invoice_status === 'paid' ? (
                                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                                        💵 Paid {booking.payment_method && `(${booking.payment_method})`}
                                      </Badge>
                                    ) : booking.payment_pending_collection ? (
                                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs animate-pulse">
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
                                  {expandedBooking === booking.id ? (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                              
                              {/* Services preview */}
                              {booking.services && booking.services.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {booking.services.slice(0, 3).map((s, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {SERVICE_OPTIONS.find(opt => opt.id === s.service?.name)?.label || s.service?.name || 'Service'}
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
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <div className="px-4 pb-4 pt-2 border-t border-border bg-secondary/10">
                              <div className="grid md:grid-cols-2 gap-6">
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
                                  </div>
                                </div>

                                {/* Services & Notes */}
                                <div className="space-y-3">
                                  <h4 className="font-heading font-semibold text-foreground flex items-center gap-2">
                                    <Wrench className="w-4 h-4" />
                                    Services Requested
                                  </h4>
                                  {booking.services && booking.services.length > 0 ? (
                                    <ul className="space-y-1 text-sm">
                                      {booking.services.map((s, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                          {SERVICE_OPTIONS.find(opt => opt.id === s.service?.name)?.label || s.service?.name || 'Service'}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No services selected</p>
                                  )}
                                  
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

                              {/* Internal Notes Section */}
                              <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                  Internal Notes (Staff Only)
                                </h4>
                                {editingNotes === booking.id ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={notesValue}
                                      onChange={(e) => setNotesValue(e.target.value)}
                                      placeholder="Add internal notes about this booking..."
                                      rows={3}
                                      className="text-sm"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleNotesSave(booking.id)}
                                        disabled={savingNotes}
                                      >
                                        {savingNotes ? (
                                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                        ) : (
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                        )}
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleNotesCancel}
                                        disabled={savingNotes}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {booking.internal_notes ? (
                                      <p className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded">
                                        {booking.internal_notes}
                                      </p>
                                    ) : (
                                      <p className="text-sm text-muted-foreground italic">No internal notes</p>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleNotesEdit(booking)}
                                    >
                                      {booking.internal_notes ? 'Edit Notes' : 'Add Notes'}
                                    </Button>
                                  </div>
                                )}
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
                                      <span className="font-medium">Invoice: ${booking.invoice_amount?.toFixed(2)}</span>
                                      <Badge variant={booking.invoice_status === 'paid' ? 'default' : 'secondary'}>
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
                                                <Button size="sm">💳 Paid by Card</Button>
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
                                        <li key={supply.id} className="flex items-center justify-between text-sm p-2 bg-white rounded border">
                                          <span>
                                            {supply.item} (×{supply.quantity}) — ${supply.cost.toFixed(2)}
                                          </span>
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
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                      disabled={updatingId === booking.id}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      {updatingId === booking.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                      ) : (
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                      )}
                                      Mark Complete
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
                                  <p className="text-sm text-muted-foreground">
                                    Completed on {booking.completed_at
                                      ? format(parseISO(booking.completed_at), 'MMM d, yyyy')
                                      : 'N/A'
                                    }
                                  </p>
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
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;

