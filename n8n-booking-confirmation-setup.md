# n8n Booking Confirmation Email Workflow Setup

This guide explains how to set up an n8n workflow that automatically sends confirmation emails to customers when they book an appointment.

## Overview

The workflow:
1. **Polls** Supabase every 5 minutes for new bookings that need confirmation emails
2. **Sends** a formatted HTML email via Gmail with booking details and a manage link
3. **Logs** the email to the `email_logs` table to prevent duplicates

## Prerequisites

- n8n instance with Gmail credentials configured
- Supabase service role key (for Edge Function authentication)

## Supabase Edge Functions (Already Deployed)

Two Edge Functions have been created:

1. **`get-pending-emails`** - Returns bookings that need confirmation emails
   - URL: `https://pudvngvljwexztxntwnn.supabase.co/functions/v1/get-pending-emails`

2. **`log-email-sent`** - Logs email after sending
   - URL: `https://pudvngvljwexztxntwnn.supabase.co/functions/v1/log-email-sent`

## n8n Workflow Setup

### Step 1: Create New Workflow

1. In n8n, create a new workflow named "FixitSwell - Booking Confirmation Emails"

### Step 2: Add Schedule Trigger

1. Add a **Schedule Trigger** node
2. Set to run every 5 minutes (or your preferred interval)

### Step 3: Add HTTP Request - Get Pending Bookings

1. Add an **HTTP Request** node
2. Configure:
   - Method: `GET`
   - URL: `https://pudvngvljwexztxntwnn.supabase.co/functions/v1/get-pending-emails`
   - Authentication: Add Header
     - Name: `Authorization`
     - Value: `Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY`
   - Headers:
     - `apikey`: Your Supabase anon key (find in Supabase Dashboard → Settings → API → anon public key)

### Step 4: Add IF Node - Check for Bookings

1. Add an **IF** node
2. Condition: `{{ $json.count > 0 }}`

### Step 5: Add Split In Batches

1. Add a **Split In Batches** node connected to IF (true branch)
2. Input: `{{ $json.bookings }}`

### Step 6: Add Code Node - Format Email

1. Add a **Code** node
2. Code:

```javascript
const booking = $input.first().json;
const client = booking.client;
const services = booking.services?.map(s => s.service?.name || 'Service').join(', ') || 'General Help';

// Format date
const date = new Date(booking.date);
const formattedDate = date.toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

// Format time
const [hours, minutes] = booking.time_slot.split(':');
const hour = parseInt(hours);
const ampm = hour >= 12 ? 'PM' : 'AM';
const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
const formattedTime = `${displayHour}:${minutes} ${ampm}`;

// Build manage URL - UPDATE THIS TO YOUR DOMAIN
const manageUrl = `https://fixitswell.com/manage/${booking.manage_token}`;

// Email HTML
const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #15803d; margin: 0; font-size: 28px;">FixitSwell</h1>
      <p style="color: #64748b; margin: 8px 0 0 0;">Your Trusted Handyman Service</p>
    </div>
    
    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0; color: #92400e; font-weight: 600;">📋 Booking Request Received</p>
      <p style="margin: 8px 0 0 0; color: #a16207;">We'll call you to confirm this appointment.</p>
    </div>
    
    <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px 0;">Appointment Details</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Date</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500; text-align: right;">${formattedDate}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Time</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500; text-align: right;">${formattedTime}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Services</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500; text-align: right;">${services}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Address</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500; text-align: right;">${client?.address || 'Not specified'}${client?.community ? '<br><span style="color: #64748b; font-weight: normal;">' + client.community + '</span>' : ''}</td>
      </tr>
    </table>
    
    <div style="margin-top: 32px; text-align: center;">
      <a href="${manageUrl}" style="display: inline-block; background-color: #15803d; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">Manage Your Booking</a>
      <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px;">Change date, time, or cancel if needed</p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
    
    <div style="text-align: center; color: #64748b; font-size: 14px;">
      <p style="margin: 0;">Questions? Call or text us anytime.</p>
      <p style="margin: 8px 0 0 0;">FixitSwell - Making your home swell again!</p>
    </div>
  </div>
</body>
</html>
`;

return {
  booking_id: booking.id,
  client_id: client?.id,
  recipient_email: client?.email,
  recipient_name: client?.name,
  subject: `FixitSwell - Booking Confirmation for ${formattedDate}`,
  emailHtml,
  manageUrl
};
```

### Step 7: Add Gmail Node

1. Add a **Gmail** node
2. Configure:
   - Credentials: Select your Gmail credentials
   - Resource: Message
   - Operation: Send
   - To: `{{ $json.recipient_email }}`
   - Subject: `{{ $json.subject }}`
   - Email Type: HTML
   - Message: `{{ $json.emailHtml }}`

### Step 8: Add HTTP Request - Log Email

1. Add another **HTTP Request** node
2. Configure:
   - Method: `POST`
   - URL: `https://pudvngvljwexztxntwnn.supabase.co/functions/v1/log-email-sent`
   - Authentication: Add Header
     - Name: `Authorization`
     - Value: `Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY`
   - Headers:
     - `apikey`: Your Supabase anon key
     - `Content-Type`: `application/json`
   - Body (JSON):
   ```json
   {
     "booking_id": "{{ $json.booking_id }}",
     "client_id": "{{ $json.client_id }}",
     "recipient_email": "{{ $json.recipient_email }}",
     "email_type": "confirmation",
     "subject": "{{ $json.subject }}",
     "status": "sent"
   }
   ```

### Step 9: Connect All Nodes

```
Schedule Trigger → HTTP Request (Get Pending) → IF (count > 0)
                                                    ↓ (true)
                                               Split In Batches
                                                    ↓
                                               Code (Format)
                                                    ↓
                                               Gmail (Send)
                                                    ↓
                                            HTTP Request (Log)
```

### Step 10: Activate Workflow

1. Save the workflow
2. Toggle the workflow to Active

## Important Configuration

### Update Your Domain

In the Code node, update the `manageUrl` to use your actual domain:

```javascript
const manageUrl = `https://YOUR-DOMAIN.com/manage/${booking.manage_token}`;
```

### Supabase Service Role Key

You'll need to add your Supabase service role key to authenticate with the Edge Functions. Find this in:
- Supabase Dashboard → Settings → API → Service Role Key

**Keep this key secure!** Never expose it in frontend code.

## Testing

1. Create a test booking through your website
2. Manually trigger the workflow in n8n
3. Check:
   - Email received with correct details
   - `email_logs` table has a new entry
   - Subsequent runs don't send duplicate emails

## Troubleshooting

- **No emails sending**: Check Gmail credentials and permissions
- **Edge Function errors**: Check Supabase Edge Function logs
- **Duplicate emails**: Verify `email_logs` table is being updated correctly

