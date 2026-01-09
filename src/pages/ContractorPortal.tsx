import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Lock,
  Briefcase,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
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
  Camera,
  Image as ImageIcon
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  verifyContractorPin,
  getContractorJobs,
  getContractorStats,
  updateJobAssignmentStatus,
  completeContractorJob,
  addServiceToBooking,
  removeServiceFromBooking,
  getAllServicesForDropdown,
  startJob,
  stopJob,
  getTimeEntries,
  updateBookingNotes,
  uploadBookingImage,
  updateBookingImages,
  type Contractor,
  type JobAssignment,
  type TimeEntry
} from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const ContractorPortal = () => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [jobs, setJobs] = useState<JobAssignment[]>([]);
  const [stats, setStats] = useState({ totalJobs: 0, completedJobs: 0, pendingJobs: 0, totalEarnings: 0, ownerCutTotal: 0 });
  const [selectedJob, setSelectedJob] = useState<JobAssignment | null>(null);
  const [allServices, setAllServices] = useState<{ id: string; label: string }[]>([]);
  const [quickServiceInput, setQuickServiceInput] = useState('');
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [addingService, setAddingService] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [completingJob, setCompletingJob] = useState(false);
  const [jobTotal, setJobTotal] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

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

  const handleLogout = () => {
    setContractor(null);
    setJobs([]);
    setPin('');
    setSelectedJob(null);
  };

  const openJobDetails = async (job: JobAssignment) => {
    setSelectedJob(job);
    setNotesValue(job.booking?.internal_notes || '');
    if (job.booking?.id) {
      const { data } = await getTimeEntries(job.booking.id);
      setTimeEntries(data || []);
    }
  };

  const handleStartTimer = async () => {
    if (!selectedJob?.booking?.id) return;
    const { error } = await startJob(selectedJob.booking.id);
    if (error) {
      toast({ title: "Error", description: "Failed to start timer", variant: "destructive" });
    } else {
      toast({ title: "Timer started" });
      const { data } = await getTimeEntries(selectedJob.booking.id);
      setTimeEntries(data || []);
    }
  };

  const handleStopTimer = async () => {
    if (!selectedJob?.booking?.id) return;
    const { error } = await stopJob(selectedJob.booking.id);
    if (error) {
      toast({ title: "Error", description: "Failed to stop timer", variant: "destructive" });
    } else {
      toast({ title: "Timer stopped" });
      const { data } = await getTimeEntries(selectedJob.booking.id);
      setTimeEntries(data || []);
    }
  };

  const handleAddService = async (serviceName: string) => {
    if (!selectedJob?.booking?.id) return;
    setAddingService(true);
    const { error } = await addServiceToBooking(selectedJob.booking.id, serviceName);
    setAddingService(false);
    if (error) {
      toast({ title: "Error", description: "Failed to add service", variant: "destructive" });
    } else {
      toast({ title: "Service added" });
      setQuickServiceInput('');
      setShowServiceSuggestions(false);
      if (contractor) loadJobs(contractor.id);
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    if (!selectedJob?.booking?.id) return;
    const { error } = await removeServiceFromBooking(selectedJob.booking.id, serviceId);
    if (error) {
      toast({ title: "Error", description: "Failed to remove service", variant: "destructive" });
    } else {
      if (contractor) loadJobs(contractor.id);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedJob?.booking?.id) return;
    const { error } = await updateBookingNotes(selectedJob.booking.id, notesValue);
    if (error) {
      toast({ title: "Error", description: "Failed to save notes", variant: "destructive" });
    } else {
      toast({ title: "Notes saved" });
      setEditingNotes(false);
      if (contractor) loadJobs(contractor.id);
    }
  };

  const handleCompleteJob = async () => {
    if (!selectedJob?.id) return;
    const total = parseFloat(jobTotal) * 100; // Convert to cents
    if (isNaN(total) || total <= 0) {
      toast({ title: "Invalid amount", description: "Please enter the job total", variant: "destructive" });
      return;
    }

    setCompletingJob(true);
    const { error } = await completeContractorJob(selectedJob.id, total);
    setCompletingJob(false);

    if (error) {
      toast({ title: "Error", description: "Failed to complete job", variant: "destructive" });
    } else {
      const ownerCut = total * ((contractor?.owner_cut_percent || 10) / 100);
      const earnings = total - ownerCut;
      toast({ 
        title: "Job completed!", 
        description: `Your earnings: $${(earnings / 100).toFixed(2)}` 
      });
      setSelectedJob(null);
      setJobTotal('');
      if (contractor) {
        loadJobs(contractor.id);
        loadStats(contractor.id);
      }
    }
  };

  const activeTimer = timeEntries.find(e => !e.stopped_at);
  const totalMinutes = timeEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

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
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-lg font-bold">Job Portal</h1>
            <p className="text-sm text-muted-foreground">Welcome, {contractor.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" />
            Exit
          </Button>
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
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  job.status === 'completed' ? 'opacity-60' : ''
                }`}
                onClick={() => openJobDetails(job)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium truncate">{job.booking?.client?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {job.booking?.date && format(parseISO(job.booking.date), 'MMM d, yyyy')}
                        <Clock className="w-3 h-3 ml-2" />
                        {job.booking?.time_slot}
                      </div>
                      {job.booking?.client?.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{job.booking.client.address}</span>
                        </div>
                      )}
                    </div>
                    <Badge className={
                      job.status === 'completed' ? 'bg-green-100 text-green-700' :
                      job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {job.status === 'completed' ? 'Done' : job.status === 'in_progress' ? 'In Progress' : 'Assigned'}
                    </Badge>
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

      {/* Job Details Modal */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Job Details
            </DialogTitle>
          </DialogHeader>

          {selectedJob?.booking && (
            <div className="space-y-4">
              {/* Client Info */}
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 font-medium">
                  <User className="w-4 h-4" />
                  {selectedJob.booking.client?.name}
                </div>
                {selectedJob.booking.client?.phone && (
                  <a href={`tel:${selectedJob.booking.client.phone}`} className="flex items-center gap-2 text-sm text-primary mt-1">
                    <Phone className="w-3 h-3" />
                    {selectedJob.booking.client.phone}
                  </a>
                )}
                {selectedJob.booking.client?.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {selectedJob.booking.client.address}
                  </div>
                )}
              </div>

              {/* Date/Time */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {format(parseISO(selectedJob.booking.date), 'EEEE, MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {selectedJob.booking.time_slot}
                </div>
              </div>

              {/* Services */}
              <div>
                <Label className="text-sm font-medium">Services</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedJob.booking.services?.map((s: { id?: string; name?: string; service?: { name?: string } }, i: number) => (
                    <Badge key={i} variant="secondary" className="pr-1">
                      {s.service?.name || s.name || 'Service'}
                      {selectedJob.status !== 'completed' && s.id && (
                        <button onClick={() => handleRemoveService(s.id!)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                
                {/* Quick add service */}
                {selectedJob.status !== 'completed' && (
                  <div className="relative mt-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add service..."
                        value={quickServiceInput}
                        onChange={(e) => {
                          setQuickServiceInput(e.target.value);
                          setShowServiceSuggestions(e.target.value.length > 0);
                        }}
                        className="text-sm"
                      />
                      <Button size="sm" disabled={!quickServiceInput.trim() || addingService} onClick={() => handleAddService(quickServiceInput)}>
                        {addingService ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      </Button>
                    </div>
                    {showServiceSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {allServices
                          .filter(s => s.label.toLowerCase().includes(quickServiceInput.toLowerCase()))
                          .slice(0, 6)
                          .map(s => (
                            <button
                              key={s.id}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-secondary"
                              onMouseDown={() => handleAddService(s.id)}
                            >
                              {s.label}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Time Tracking */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-blue-700">Time Tracking</Label>
                  <div className="flex items-center gap-1 text-blue-700">
                    <Timer className="w-4 h-4" />
                    <span className="font-mono">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</span>
                  </div>
                </div>
                {selectedJob.status !== 'completed' && (
                  <div className="flex gap-2">
                    {!activeTimer ? (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleStartTimer}>
                        <Play className="w-4 h-4 mr-1" /> Start Timer
                      </Button>
                    ) : (
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={handleStopTimer}>
                        <Square className="w-4 h-4 mr-1" /> Stop Timer
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Notes</Label>
                  {selectedJob.status !== 'completed' && !editingNotes && (
                    <Button variant="ghost" size="sm" onClick={() => setEditingNotes(true)}>Edit</Button>
                  )}
                </div>
                {editingNotes ? (
                  <div className="space-y-2">
                    <Textarea value={notesValue} onChange={(e) => setNotesValue(e.target.value)} rows={3} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveNotes}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingNotes(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm p-2 bg-secondary/50 rounded">{selectedJob.booking.internal_notes || selectedJob.booking.notes || 'No notes'}</p>
                )}
              </div>

              {/* Complete Job */}
              {selectedJob.status !== 'completed' && (
                <div className="pt-4 border-t space-y-3">
                  <Label className="text-sm font-medium">Complete Job</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Job total"
                        value={jobTotal}
                        onChange={(e) => setJobTotal(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Button onClick={handleCompleteJob} disabled={completingJob || !jobTotal} className="bg-green-600 hover:bg-green-700">
                      {completingJob ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                      Complete
                    </Button>
                  </div>
                  {jobTotal && (
                    <p className="text-xs text-muted-foreground">
                      Your earnings: ${(parseFloat(jobTotal) * (1 - (contractor.owner_cut_percent / 100))).toFixed(2)} 
                      <span className="text-muted-foreground/70"> (after {contractor.owner_cut_percent}% owner cut)</span>
                    </p>
                  )}
                </div>
              )}

              {/* Completed Job Summary */}
              {selectedJob.status === 'completed' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                    <CheckCircle className="w-5 h-5" />
                    Job Completed
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Job Total:</span>
                      <span className="ml-2 font-medium">${((selectedJob.job_total || 0) / 100).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Your Earnings:</span>
                      <span className="ml-2 font-medium text-green-600">${((selectedJob.contractor_earnings || 0) / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractorPortal;
