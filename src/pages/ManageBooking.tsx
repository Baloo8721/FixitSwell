import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
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
  CalendarDays,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Home,
  Wrench,
  ArrowLeft,
  Edit,
  Save,
  X
} from "lucide-react";
import { format, parseISO, addDays, isBefore, startOfToday } from "date-fns";
import {
  getBookingByToken,
  updateBookingByToken,
  cancelBookingByToken,
  getAvailableTimeSlots,
  SERVICE_OPTIONS,
  DEFAULT_TIME_SLOTS,
  type Booking,
  type Client,
  type Service,
  type TimeSlot
} from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

type BookingWithDetails = Booking & { client: Client; services: Service[] };

const ManageBooking = () => {
  const { token } = useParams<{ token: string }>();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Edit form state
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editTimeSlot, setEditTimeSlot] = useState('');
  const [editServices, setEditServices] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>(DEFAULT_TIME_SLOTS);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const loadBooking = async () => {
    if (!token) {
      setError('No booking token provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error: fetchError } = await getBookingByToken(token);
    
    if (fetchError || !data) {
      setError('Booking not found. The link may be invalid or expired.');
      setIsLoading(false);
      return;
    }

    setBooking(data);
    setEditDate(parseISO(data.date));
    setEditTimeSlot(data.time_slot);
    setEditServices(data.services?.map(s => s.id || s.name) || []);
    setEditNotes(data.notes || '');
    setIsLoading(false);
  };

  useEffect(() => {
    loadBooking();
  }, [token]);

  // Load available time slots when date changes
  useEffect(() => {
    if (editDate && isEditing) {
      setLoadingSlots(true);
      const dateStr = format(editDate, 'yyyy-MM-dd');
      getAvailableTimeSlots(dateStr)
        .then(slots => {
          // If the booking's original date is the same, mark the current slot as available
          if (booking && dateStr === booking.date) {
            setAvailableSlots(slots.map(s => 
              s.time === booking.time_slot ? { ...s, available: true } : s
            ));
          } else {
            setAvailableSlots(slots);
          }
          setLoadingSlots(false);
        })
        .catch(() => {
          setAvailableSlots(DEFAULT_TIME_SLOTS);
          setLoadingSlots(false);
        });
    }
  }, [editDate, isEditing, booking]);

  const handleServiceToggle = (serviceId: string) => {
    setEditServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = async () => {
    if (!token || !editDate) return;

    setIsSaving(true);
    const { error: saveError } = await updateBookingByToken(token, {
      date: format(editDate, 'yyyy-MM-dd'),
      time_slot: editTimeSlot,
      services: editServices,
      notes: editNotes
    });

    setIsSaving(false);

    if (saveError) {
      toast({
        title: "Error saving changes",
        description: saveError.message || "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Changes saved",
        description: "Your booking has been updated.",
      });
      setIsEditing(false);
      loadBooking();
    }
  };

  const handleCancel = async () => {
    if (!token) return;

    setIsCancelling(true);
    const { error: cancelError } = await cancelBookingByToken(token);
    setIsCancelling(false);

    if (cancelError) {
      toast({
        title: "Error cancelling booking",
        description: cancelError.message || "Failed to cancel booking. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled.",
      });
      loadBooking();
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    const variants: Record<Booking['status'], { className: string; icon: React.ReactNode; label: string }> = {
      pending: { className: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <AlertCircle className="w-3 h-3" />, label: 'Pending Confirmation' },
      confirmed: { className: 'bg-blue-100 text-blue-800 border-blue-300', icon: <CheckCircle className="w-3 h-3" />, label: 'Confirmed' },
      completed: { className: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle className="w-3 h-3" />, label: 'Completed' },
      cancelled: { className: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="w-3 h-3" />, label: 'Cancelled' },
      no_show: { className: 'bg-gray-100 text-gray-800 border-gray-300', icon: <XCircle className="w-3 h-3" />, label: 'No Show' },
    };

    const variant = variants[status];
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${variant.className}`}>
        {variant.icon}
        {variant.label}
      </Badge>
    );
  };

  const getTimeLabel = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const canModify = booking && !['cancelled', 'completed', 'no_show'].includes(booking.status);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading your booking...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">
              Booking Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The booking link may be invalid or expired.'}
            </p>
            <Link to="/">
              <Button>
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <h1 className="font-heading text-2xl font-bold text-foreground">Manage Your Booking</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="overflow-hidden">
          <CardHeader className="bg-secondary/30 border-b border-border">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-xl">Your Appointment</CardTitle>
                <p className="text-muted-foreground mt-1">
                  {format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')} at {getTimeLabel(booking.time_slot)}
                </p>
              </div>
              {getStatusBadge(booking.status)}
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Status Messages */}
            {booking.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Awaiting Confirmation</p>
                  <p className="text-sm text-yellow-700">We'll call you to confirm this appointment.</p>
                </div>
              </div>
            )}

            {booking.status === 'confirmed' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Confirmed</p>
                  <p className="text-sm text-blue-700">Your appointment is confirmed. We'll see you soon!</p>
                </div>
              </div>
            )}

            {booking.status === 'cancelled' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Cancelled</p>
                  <p className="text-sm text-red-700">This booking has been cancelled.</p>
                </div>
              </div>
            )}

            {!isEditing ? (
              /* View Mode */
              <>
                {/* Appointment Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-primary" />
                      Appointment Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        <span>{format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{getTimeLabel(booking.time_slot)}</span>
                      </div>
                      {booking.client?.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <span>
                            {booking.client.address}
                            {booking.client.community && (
                              <span className="block text-muted-foreground">{booking.client.community}</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Contact Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.client?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.client?.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.client?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services */}
                {booking.services && booking.services.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-primary" />
                      Services Requested
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {booking.services.map((service, i) => (
                        <Badge key={i} variant="secondary">
                          {SERVICE_OPTIONS.find(opt => opt.id === service.id || opt.id === service.name)?.label || service.name || 'Service'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {booking.notes && (
                  <div className="space-y-2">
                    <h3 className="font-heading font-semibold text-foreground">Notes</h3>
                    <p className="text-sm p-3 bg-secondary/50 rounded-lg">{booking.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {canModify && (
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Booking
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isCancelling}>
                          {isCancelling ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Cancel Booking
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Your appointment on {format(parseISO(booking.date), 'MMMM d')} at {getTimeLabel(booking.time_slot)} will be cancelled.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                          <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Yes, Cancel Booking
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </>
            ) : (
              /* Edit Mode */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-semibold text-foreground">Edit Your Booking</h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>

                {/* Date Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Select Date</Label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={editDate}
                      onSelect={(date) => {
                        setEditDate(date);
                        setEditTimeSlot('');
                      }}
                      disabled={(date) => isBefore(date, startOfToday()) || isBefore(addDays(new Date(), 60), date)}
                      className="rounded-xl border-2 border-border p-4 bg-background"
                    />
                  </div>
                </div>

                {/* Time Selection */}
                {editDate && (
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Select Time</Label>
                    {loadingSlots ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => slot.available && setEditTimeSlot(slot.time)}
                            disabled={!slot.available}
                            className={`p-3 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                              editTimeSlot === slot.time
                                ? 'border-primary bg-primary text-primary-foreground'
                                : slot.available
                                  ? 'border-border bg-card hover:border-primary/50 text-foreground'
                                  : 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Services Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Services</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {SERVICE_OPTIONS.filter(s => s.category === 'service').map((service) => (
                      <label
                        key={service.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          editServices.includes(service.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30 bg-card'
                        }`}
                      >
                        <Checkbox
                          checked={editServices.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <span className="text-sm">{service.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="edit-notes" className="text-base font-medium">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>

                {/* Save Button */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button onClick={handleSave} disabled={isSaving || !editDate || !editTimeSlot}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to FixitSwell
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ManageBooking;

