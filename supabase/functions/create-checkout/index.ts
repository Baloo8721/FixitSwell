import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token, successUrl, cancelUrl } = await req.json();

    if (!token) {
      throw new Error('Booking token is required');
    }

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, client:clients(*)')
      .eq('manage_token', token)
      .single();

    if (fetchError || !booking) {
      throw new Error('Booking not found');
    }

    if (!booking.invoice_amount) {
      throw new Error('No invoice amount set for this booking');
    }

    const customerEmail = isValidEmail(booking.client?.email) ? booking.client.email : undefined;

    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Handyman Services - ' + booking.date,
            description: 'Service for ' + (booking.client?.name || 'Customer'),
          },
          unit_amount: Math.round(booking.invoice_amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl || req.headers.get('origin') + '/manage/' + token + '?payment=success',
      cancel_url: cancelUrl || req.headers.get('origin') + '/manage/' + token + '?payment=cancelled',
      metadata: { booking_id: booking.id, manage_token: token },
    };

    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    await supabase
      .from('bookings')
      .update({ stripe_payment_intent_id: session.id, payment_method: 'card' })
      .eq('id', booking.id);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
