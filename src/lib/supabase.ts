import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pudvngvljwexztxntwnn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =============================================================================
// TypeScript Types for all tables
// =============================================================================

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  community: string | null;
  source: string | null;
  is_senior: boolean;
  is_military: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  category: 'service' | 'package' | 'monthly';
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  duration_minutes: number | null;
  is_active: boolean;
}

export interface Booking {
  id: string;
  client_id: string | null;
  date: string;
  time_slot: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  internal_notes: string | null;
  total_amount: number | null;
  google_event_id: string | null;
  manage_token: string;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancelled_by: 'customer' | 'staff' | null;
  images: string[];
  created_by: 'customer' | 'admin';
  // Invoice fields
  invoice_amount: number | null;
  invoice_status: 'none' | 'pending' | 'paid' | 'partial';
  invoice_created_at: string | null;
  invoice_paid_at: string | null;
  stripe_payment_intent_id: string | null;
  deposit_amount: number | null;
  deposit_paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingService {
  id: string;
  booking_id: string;
  service_id: string;
  quoted_price: number | null;
}

export interface BookingHistory {
  id: string;
  booking_id: string;
  action: 'created' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_by: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_min: number;
  price_max: number;
  visit_hours: number | null;
  description: string | null;
  best_for: string | null;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  client_id: string;
  plan_id: string;
  monthly_price: number;
  status: 'active' | 'paused' | 'cancelled';
  started_at: string;
  next_billing_date: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  subscription_id: string | null;
  booking_id: string | null;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'void';
  due_date: string | null;
  paid_at: string | null;
  payment_method: 'cash' | 'check' | 'venmo' | 'card' | 'other' | null;
  notes: string | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referrer_discount_applied: boolean;
  referred_discount_applied: boolean;
  referrer_booking_id: string | null;
  referred_booking_id: string | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  client_id: string | null;
  session_token: string;
  started_at: string;
  last_message_at: string;
  context: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  note: string;
  note_type: 'general' | 'call' | 'visit' | 'follow_up';
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  client_id: string | null;
  event_type: string;
  event_data: Record<string, unknown>;
  page_url: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface EmailLog {
  id: string;
  client_id: string | null;
  booking_id: string | null;
  email_type: 'confirmation' | 'reminder' | 'follow_up' | 'receipt' | 'marketing' | 'other';
  recipient_email: string;
  subject: string | null;
  status: 'sent' | 'failed' | 'bounced';
  sent_at: string;
}

// =============================================================================
// Time Slots Configuration
// =============================================================================

export interface TimeSlot {
  id: string;
  time: string;
  label: string;
  available: boolean;
}

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: '1', time: '08:30', label: '8:30 AM', available: true },
  { id: '2', time: '09:30', label: '9:30 AM', available: true },
  { id: '3', time: '10:30', label: '10:30 AM', available: true },
  { id: '4', time: '11:30', label: '11:30 AM', available: true },
  { id: '5', time: '12:30', label: '12:30 PM', available: true },
  { id: '6', time: '13:30', label: '1:30 PM', available: true },
];

// =============================================================================
// Client Functions
// =============================================================================

export async function findOrCreateClient(data: {
  name: string;
  email: string;
  phone: string;
  address?: string;
  community?: string;
}): Promise<{ data: Client | null; error: Error | null }> {
  try {
    // First, try to find existing client by email
    const { data: existing, error: findError } = await supabase
      .from('clients')
      .select('*')
      .eq('email', data.email)
      .single();

    if (existing && !findError) {
      // Update client info if different
      const updates: Partial<Client> = {};
      if (existing.phone !== data.phone) updates.phone = data.phone;
      if (existing.name !== data.name) updates.name = data.name;
      if (data.address && existing.address !== data.address) updates.address = data.address;
      if (data.community && existing.community !== data.community) updates.community = data.community;
      
      if (Object.keys(updates).length > 0) {
        await supabase
          .from('clients')
          .update(updates)
          .eq('id', existing.id);
      }
      return { data: { ...existing, ...updates } as Client, error: null };
    }

    // Create new client
    const { data: newClient, error: createError } = await supabase
      .from('clients')
      .insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address || null,
        community: data.community || null,
        source: 'website'
      }])
      .select()
      .single();

    if (createError) throw createError;
    return { data: newClient as Client, error: null };
  } catch (error) {
    console.error('Error finding/creating client:', error);
    return { data: null, error: error as Error };
  }
}

// =============================================================================
// Booking Functions
// =============================================================================

export interface CreateBookingData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time_slot: string;
  services: string[];
  notes?: string;
  address?: string;
  community?: string;
  images?: string[];
}

export async function createBooking(data: CreateBookingData): Promise<{ 
  data: { booking: Booking; client: Client } | null; 
  error: Error | null 
}> {
  try {
    // 1. Find or create the client
    const { data: client, error: clientError } = await findOrCreateClient({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      community: data.community
    });

    if (clientError || !client) {
      throw clientError || new Error('Failed to create client');
    }

    // 2. Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        client_id: client.id,
        date: data.date,
        time_slot: data.time_slot,
        notes: data.notes || null,
        images: data.images || [],
        status: 'pending',
        created_by: 'customer'
      }])
      .select()
      .single();

    if (bookingError) throw bookingError;

    // 3. Create booking_services entries
    const bookingServices = data.services.map(serviceId => ({
      booking_id: booking.id,
      service_id: serviceId
    }));

    const { error: servicesError } = await supabase
      .from('booking_services')
      .insert(bookingServices);

    if (servicesError) {
      console.error('Error adding booking services:', servicesError);
    }

    // 4. Log booking history
    await supabase
      .from('booking_history')
      .insert([{
        booking_id: booking.id,
        action: 'created',
        new_data: { date: data.date, time_slot: data.time_slot, services: data.services },
        changed_by: 'customer'
      }]);

    return { 
      data: { booking: booking as Booking, client }, 
      error: null 
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { data: null, error: error as Error };
  }
}

export async function getBookingsForDate(date: string): Promise<{ 
  data: Booking[] | null; 
  error: Error | null 
}> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('date', date)
      .neq('status', 'cancelled');

    if (error) throw error;
    return { data: data as Booking[], error: null };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { data: null, error: error as Error };
  }
}

export async function getAvailableTimeSlots(date: string): Promise<TimeSlot[]> {
  const { data: bookings } = await getBookingsForDate(date);
  const bookedTimes = bookings?.map(b => b.time_slot) || [];
  
  return DEFAULT_TIME_SLOTS.map(slot => ({
    ...slot,
    available: !bookedTimes.includes(slot.time)
  }));
}

export async function getBookingByToken(token: string): Promise<{
  data: (Booking & { client: Client; services: Service[] }) | null;
  error: Error | null;
}> {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:clients(*),
        booking_services(
          service:services(*)
        )
      `)
      .eq('manage_token', token)
      .single();

    if (error) throw error;
    
    // Transform the nested structure
    const result = {
      ...booking,
      client: booking.client,
      services: booking.booking_services?.map((bs: { service: Service }) => bs.service) || []
    };
    
    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching booking:', error);
    return { data: null, error: error as Error };
  }
}

export async function updateBookingStatus(
  bookingId: string, 
  status: Booking['status'],
  changedBy: 'customer' | 'staff' = 'customer'
): Promise<{ error: Error | null }> {
  try {
    // Get current booking state
    const { data: current, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError) {
      console.error('Error fetching booking:', fetchError);
      throw new Error(`Failed to fetch booking: ${fetchError.message}`);
    }

    // Update booking
    const updates: Partial<Booking> = { status };
    if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();
    if (status === 'completed') updates.completed_at = new Date().toISOString();
    if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
      updates.cancelled_by = changedBy;
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error updating booking:', updateError);
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    // Map status to valid history action
    // Valid actions: 'created' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed'
    let action: 'confirmed' | 'cancelled' | 'completed';
    if (status === 'cancelled') {
      action = 'cancelled';
    } else if (status === 'confirmed') {
      action = 'confirmed';
    } else if (status === 'completed' || status === 'no_show') {
      action = 'completed';
    } else {
      // For pending status, don't log history (or we could skip this)
      action = 'confirmed';
    }

    // Log history - don't fail the whole operation if this fails
    const { error: historyError } = await supabase
      .from('booking_history')
      .insert([{
        booking_id: bookingId,
        action,
        old_data: current,
        new_data: { ...current, ...updates },
        changed_by: changedBy
      }]);

    if (historyError) {
      console.warn('Failed to log booking history:', historyError);
      // Don't throw - the main update succeeded
    }

    return { error: null };
  } catch (error) {
    console.error('Error updating booking:', error);
    return { error: error as Error };
  }
}

export async function updateBookingNotes(
  bookingId: string,
  internalNotes: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ internal_notes: internalNotes })
      .eq('id', bookingId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating booking notes:', error);
    return { error: error as Error };
  }
}

export async function updateBookingByToken(
  token: string,
  updates: {
    date?: string;
    time_slot?: string;
    notes?: string;
    services?: string[];
  }
): Promise<{ error: Error | null }> {
  try {
    // First get the booking by token
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, date, time_slot')
      .eq('manage_token', token)
      .single();

    if (fetchError || !booking) {
      throw new Error('Booking not found');
    }

    // Prepare booking updates
    const bookingUpdates: Record<string, unknown> = {};
    if (updates.date) bookingUpdates.date = updates.date;
    if (updates.time_slot) bookingUpdates.time_slot = updates.time_slot;
    if (updates.notes !== undefined) bookingUpdates.notes = updates.notes;

    // Update booking if there are changes
    if (Object.keys(bookingUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('bookings')
        .update(bookingUpdates)
        .eq('id', booking.id);

      if (updateError) throw updateError;
    }

    // Update services if provided
    if (updates.services) {
      // Delete existing services
      await supabase
        .from('booking_services')
        .delete()
        .eq('booking_id', booking.id);

      // Insert new services
      if (updates.services.length > 0) {
        const bookingServices = updates.services.map(serviceId => ({
          booking_id: booking.id,
          service_id: serviceId
        }));
        await supabase
          .from('booking_services')
          .insert(bookingServices);
      }
    }

    // Log history if date/time changed
    if (updates.date || updates.time_slot) {
      await supabase
        .from('booking_history')
        .insert([{
          booking_id: booking.id,
          action: 'rescheduled',
          old_data: { date: booking.date, time_slot: booking.time_slot },
          new_data: { date: updates.date || booking.date, time_slot: updates.time_slot || booking.time_slot },
          changed_by: 'customer'
        }]);
    }

    return { error: null };
  } catch (error) {
    console.error('Error updating booking by token:', error);
    return { error: error as Error };
  }
}

export async function cancelBookingByToken(token: string): Promise<{ error: Error | null }> {
  try {
    // Get booking by token
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('manage_token', token)
      .single();

    if (fetchError || !booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new Error('Cannot cancel a completed booking');
    }

    // Update status to cancelled
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: 'customer'
      })
      .eq('id', booking.id);

    if (updateError) throw updateError;

    // Log history
    await supabase
      .from('booking_history')
      .insert([{
        booking_id: booking.id,
        action: 'cancelled',
        old_data: { status: booking.status },
        new_data: { status: 'cancelled' },
        changed_by: 'customer'
      }]);

    return { error: null };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { error: error as Error };
  }
}

// =============================================================================
// Services Functions
// =============================================================================

export async function getServices(): Promise<{ data: Service[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('category');

    if (error) throw error;
    return { data: data as Service[], error: null };
  } catch (error) {
    console.error('Error fetching services:', error);
    return { data: null, error: error as Error };
  }
}

// =============================================================================
// Analytics Functions
// =============================================================================

export async function trackEvent(
  eventType: string, 
  eventData: Record<string, unknown> = {},
  clientId?: string
): Promise<void> {
  try {
    await supabase
      .from('analytics_events')
      .insert([{
        event_type: eventType,
        event_data: eventData,
        client_id: clientId || null,
        page_url: typeof window !== 'undefined' ? window.location.href : null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
      }]);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

// =============================================================================
// Chat Session Functions
// =============================================================================

export async function getOrCreateChatSession(sessionToken: string): Promise<{
  data: ChatSession | null;
  error: Error | null;
}> {
  try {
    // Try to find existing session
    const { data: existing } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (existing) {
      // Update last_message_at
      await supabase
        .from('chat_sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', existing.id);
      return { data: existing as ChatSession, error: null };
    }

    // Create new session
    const { data: newSession, error } = await supabase
      .from('chat_sessions')
      .insert([{ session_token: sessionToken }])
      .select()
      .single();

    if (error) throw error;
    return { data: newSession as ChatSession, error: null };
  } catch (error) {
    console.error('Error with chat session:', error);
    return { data: null, error: error as Error };
  }
}

export async function addChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert([{
        session_id: sessionId,
        role,
        content,
        metadata
      }]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error adding chat message:', error);
    return { error: error as Error };
  }
}

export async function getChatHistory(sessionId: string): Promise<{
  data: ChatMessage[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data: data as ChatMessage[], error: null };
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return { data: null, error: error as Error };
  }
}

// =============================================================================
// Admin Functions
// =============================================================================

export interface BookingWithDetails extends Booking {
  client: Client | null;
  services: { service: Service }[];
}

export async function getAllBookings(filters?: {
  status?: Booking['status'];
  startDate?: string;
  endDate?: string;
}): Promise<{ data: BookingWithDetails[] | null; error: Error | null }> {
  try {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        client:clients(*),
        services:booking_services(
          service:services(*)
        )
      `)
      .order('date', { ascending: true })
      .order('time_slot', { ascending: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data as BookingWithDetails[], error: null };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return { data: null, error: error as Error };
  }
}

export async function getUpcomingBookings(): Promise<{ 
  data: BookingWithDetails[] | null; 
  error: Error | null 
}> {
  const today = new Date().toISOString().split('T')[0];
  return getAllBookings({ startDate: today });
}

export async function getAllClients(): Promise<{ data: Client[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data as Client[], error: null };
  } catch (error) {
    console.error('Error fetching clients:', error);
    return { data: null, error: error as Error };
  }
}

export async function getBookingStats(): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}> {
  try {
    const { data } = await supabase
      .from('bookings')
      .select('status');
    
    const stats = {
      total: data?.length || 0,
      pending: data?.filter(b => b.status === 'pending').length || 0,
      confirmed: data?.filter(b => b.status === 'confirmed').length || 0,
      completed: data?.filter(b => b.status === 'completed').length || 0,
      cancelled: data?.filter(b => b.status === 'cancelled').length || 0,
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  }
}

// =============================================================================
// Legacy SERVICE_OPTIONS for backward compatibility with BookingCalendar
// =============================================================================

export const SERVICE_OPTIONS = [
  { id: 'assembly', label: 'Assembly, Mounting & Setup', category: 'service' },
  { id: 'tech', label: 'Technology & WiFi Help', category: 'service' },
  { id: 'repairs', label: 'Repairs & Honey-Do Fixes', category: 'service' },
  { id: 'safety', label: 'Safety & Senior Support', category: 'service' },
  { id: 'outdoor', label: 'Outdoor & Seasonal', category: 'service' },
  { id: 'organizing', label: 'Organizing & Extras', category: 'service' },
  { id: 'tune-up', label: 'Basic Home Tune-Up Package', category: 'package' },
  { id: 'seasonal', label: 'Seasonal Prep Bundle', category: 'package' },
  { id: 'move-assist', label: 'Move-In/Move-Out Assist', category: 'package' },
  { id: 'peace-of-mind', label: 'Home Check & Peace-of-Mind (Monthly)', category: 'monthly' },
  { id: 'tech-support', label: 'Tech + Home Support (Monthly)', category: 'monthly' },
  { id: 'helper-plan', label: 'Trusted Helper Plan (Monthly)', category: 'monthly' },
];

// =============================================================================
// Image Upload Functions
// =============================================================================

export async function uploadBookingImage(file: File, bookingId?: string): Promise<{
  data: { url: string; path: string } | null;
  error: Error | null;
}> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const folder = bookingId || 'temp';
    const path = `${folder}/${timestamp}-${randomId}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('booking-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('booking-images')
      .getPublicUrl(path);

    return {
      data: { url: urlData.publicUrl, path },
      error: null
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { data: null, error: error as Error };
  }
}

export async function deleteBookingImage(path: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.storage
      .from('booking-images')
      .remove([path]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { error: error as Error };
  }
}

export async function updateBookingImages(
  bookingId: string,
  images: string[]
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ images })
      .eq('id', bookingId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating booking images:', error);
    return { error: error as Error };
  }
}

export async function addImagesToBookingByToken(
  token: string,
  newImages: string[]
): Promise<{ error: Error | null }> {
  try {
    // Get current booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, images')
      .eq('manage_token', token)
      .single();

    if (fetchError || !booking) {
      throw new Error('Booking not found');
    }

    // Append new images
    const updatedImages = [...(booking.images || []), ...newImages];

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ images: updatedImages })
      .eq('id', booking.id);

    if (updateError) throw updateError;
    return { error: null };
  } catch (error) {
    console.error('Error adding images to booking:', error);
    return { error: error as Error };
  }
}

// =============================================================================
// Admin Manual Booking Creation
// =============================================================================

export interface CreateManualBookingData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time_slot: string;
  services: string[];
  notes?: string;
  address?: string;
  community?: string;
  images?: string[];
}

export async function createManualBooking(data: CreateManualBookingData): Promise<{ 
  data: { booking: Booking; client: Client } | null; 
  error: Error | null 
}> {
  try {
    // 1. Find or create the client
    const { data: client, error: clientError } = await findOrCreateClient({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      community: data.community
    });

    if (clientError || !client) {
      throw clientError || new Error('Failed to create client');
    }

    // 2. Create the booking (marked as created by admin)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        client_id: client.id,
        date: data.date,
        time_slot: data.time_slot,
        notes: data.notes || null,
        images: data.images || [],
        status: 'confirmed', // Admin bookings are auto-confirmed
        created_by: 'admin'
      }])
      .select()
      .single();

    if (bookingError) throw bookingError;

    // 3. Create booking_services entries
    if (data.services.length > 0) {
      const bookingServices = data.services.map(serviceId => ({
        booking_id: booking.id,
        service_id: serviceId
      }));

      await supabase
        .from('booking_services')
        .insert(bookingServices);
    }

    // 4. Log booking history
    await supabase
      .from('booking_history')
      .insert([{
        booking_id: booking.id,
        action: 'created',
        new_data: { date: data.date, time_slot: data.time_slot, services: data.services, created_by: 'admin' },
        changed_by: 'staff'
      }]);

    return { 
      data: { booking: booking as Booking, client }, 
      error: null 
    };
  } catch (error) {
    console.error('Error creating manual booking:', error);
    return { data: null, error: error as Error };
  }
}

// =============================================================================
// Invoice Management
// =============================================================================

export async function createInvoice(
  bookingId: string,
  amount: number,
  depositAmount?: number
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({
        invoice_amount: amount,
        invoice_status: 'pending',
        invoice_created_at: new Date().toISOString(),
        deposit_amount: depositAmount || null
      })
      .eq('id', bookingId);

    if (error) throw error;

    await supabase
      .from('booking_history')
      .insert([{
        booking_id: bookingId,
        action: 'invoice_created',
        new_data: { amount, deposit_amount: depositAmount },
        changed_by: 'staff'
      }]);

    return { error: null };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { error: error as Error };
  }
}

export async function updateInvoiceStatus(
  bookingId: string,
  status: 'none' | 'pending' | 'paid' | 'partial'
): Promise<{ error: Error | null }> {
  try {
    const updates: Record<string, unknown> = { invoice_status: status };
    if (status === 'paid') {
      updates.invoice_paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return { error: error as Error };
  }
}

// =============================================================================
// Supplies Management
// =============================================================================

export interface BookingSupply {
  id: string;
  booking_id: string;
  item: string;
  quantity: number;
  cost: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function getBookingSupplies(bookingId: string): Promise<BookingSupply[]> {
  try {
    const { data, error } = await supabase
      .from('booking_supplies')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching supplies:', error);
    return [];
  }
}

export async function addBookingSupply(
  bookingId: string,
  item: string,
  cost: number,
  quantity: number = 1,
  notes?: string
): Promise<{ data: BookingSupply | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('booking_supplies')
      .insert([{ booking_id: bookingId, item, cost, quantity, notes }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding supply:', error);
    return { data: null, error: error as Error };
  }
}

export async function deleteBookingSupply(supplyId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('booking_supplies')
      .delete()
      .eq('id', supplyId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting supply:', error);
    return { error: error as Error };
  }
}

// =============================================================================
// Payment Functions
// =============================================================================

export async function createPaymentIntent(
  bookingId: string,
  type: 'invoice' | 'deposit' = 'invoice'
): Promise<{ clientSecret: string; amount: number } | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ bookingId, type })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
}

export async function createPaymentIntentByToken(
  token: string,
  type: 'invoice' | 'deposit' = 'invoice'
): Promise<{ clientSecret: string; amount: number } | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ token, type })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
}
