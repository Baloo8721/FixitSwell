import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Wrench
} from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import {
  getUpcomingBookings,
  getAllBookings,
  updateBookingStatus,
  updateBookingNotes,
  getBookingStats,
  type BookingWithDetails,
  type Booking,
  SERVICE_OPTIONS
} from "@/lib/supabase";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

type StatusFilter = 'all' | Booking['status'];

const Admin = () => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const loadBookings = async () => {
    setIsLoading(true);
    const filters: { status?: Booking['status'] } = {};
    if (statusFilter !== 'all') {
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

  const getStatusBadge = (status: Booking['status']) => {
    const variants: Record<Booking['status'], { className: string; icon: React.ReactNode }> = {
      pending: { className: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <AlertCircle className="w-3 h-3" /> },
      confirmed: { className: 'bg-blue-100 text-blue-800 border-blue-300', icon: <CheckCircle className="w-3 h-3" /> },
      completed: { className: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle className="w-3 h-3" /> },
      cancelled: { className: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="w-3 h-3" /> },
      no_show: { className: 'bg-gray-100 text-gray-800 border-gray-300', icon: <XCircle className="w-3 h-3" /> },
    };
    
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${variants[status].className}`}>
        {variants[status].icon}
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
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
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.client?.name?.toLowerCase().includes(query) ||
      booking.client?.email?.toLowerCase().includes(query) ||
      booking.client?.phone?.toLowerCase().includes(query) ||
      booking.client?.address?.toLowerCase().includes(query)
    );
  });

  // Group bookings by date
  const groupedBookings = filteredBookings.reduce((acc, booking) => {
    const dateKey = booking.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(booking);
    return acc;
  }, {} as Record<string, BookingWithDetails[]>);

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
            <Button onClick={loadBookings} variant="outline" size="sm" className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
              <p className="text-sm text-yellow-600">Pending</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{stats.confirmed}</p>
              <p className="text-sm text-blue-600">Confirmed</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{stats.completed}</p>
              <p className="text-sm text-green-600">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{stats.cancelled}</p>
              <p className="text-sm text-red-600">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
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
            </SelectContent>
          </Select>
        </div>

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
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dateKey, dateBookings]) => (
                <div key={dateKey}>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    {getDateLabel(dateKey)}
                    <span className="text-muted-foreground font-normal">
                      ({format(parseISO(dateKey), 'EEEE, MMMM d, yyyy')})
                    </span>
                    <Badge variant="secondary" className="ml-2">{dateBookings.length}</Badge>
                  </h3>
                  
                  <div className="space-y-3">
                    {dateBookings.map((booking) => (
                      <Card key={booking.id} className="overflow-hidden">
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
                                  <div className="flex items-center gap-2 min-w-[100px]">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{getTimeLabel(booking.time_slot)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{booking.client?.name || 'Unknown'}</span>
                                  </div>
                                  {booking.client?.address && (
                                    <div className="hidden md:flex items-center gap-2 text-muted-foreground">
                                      <MapPin className="w-4 h-4" />
                                      <span className="text-sm truncate max-w-[200px]">{booking.client.address}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  {getStatusBadge(booking.status)}
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
                                {(booking.status === 'completed' || booking.status === 'cancelled') && (
                                  <p className="text-sm text-muted-foreground">
                                    {booking.status === 'completed' ? 'Completed' : 'Cancelled'} on {
                                      booking.status === 'completed' && booking.completed_at
                                        ? format(parseISO(booking.completed_at), 'MMM d, yyyy')
                                        : 'N/A'
                                    }
                                  </p>
                                )}
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

