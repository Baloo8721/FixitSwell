import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { saveContactMessage } from "@/lib/supabase";

// n8n webhook URL for contact form submissions (optional - for future notifications)
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_CONTACT_WEBHOOK || '';

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Email validation - requires proper domain with TLD (at least 2 chars)
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate email before submitting
    if (!isValidEmail(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address (e.g., john@email.com)",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Save to Supabase
      const { error: saveError } = await saveContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message || undefined
      });

      if (saveError) {
        throw saveError;
      }

      // Optionally send to n8n webhook for notifications (if configured)
      if (N8N_WEBHOOK_URL) {
        try {
          await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...formData,
              timestamp: new Date().toISOString(),
              source: 'website_contact_form'
            }),
          });
        } catch (webhookError) {
          // Don't fail the form if webhook fails - message is already saved
          console.warn('n8n webhook failed (message still saved):', webhookError);
        }
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitting(false);
      toast({
        title: "Something went wrong",
        description: "Please try calling us instead at (813) 738-1655",
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-heading text-xl text-foreground mb-2">
          Thank You!
        </h3>
        <p className="text-muted-foreground">
          We received your message and will call you back shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-lg">Your Name</Label>
        <Input 
          id="name" 
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., John Smith" 
          required
          className="h-14 text-lg rounded-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-lg">Your Email</Label>
        <Input 
          id="email" 
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="e.g., john@email.com" 
          required
          className={`h-14 text-lg rounded-lg ${formData.email && !isValidEmail(formData.email) ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
        {formData.email && !isValidEmail(formData.email) && (
          <p className="text-sm text-red-500">Please enter a valid email (e.g., john@email.com)</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-lg">Phone Number <span className="text-muted-foreground text-sm">(optional)</span></Label>
        <Input 
          id="phone" 
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="e.g., (555) 123-4567" 
          className="h-14 text-lg rounded-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-lg">How Can We Help?</Label>
        <Textarea 
          id="message" 
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us what you need — no detail is too small..." 
          rows={4}
          className="text-lg rounded-lg resize-none"
        />
      </div>

      <Button 
        type="submit" 
        size="lg"
        disabled={isSubmitting}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-xl"
      >
        {isSubmitting ? (
          "Sending..."
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Send Message
          </>
        )}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Prefer to call? <a href="tel:+18137381655" className="text-primary underline">Click here</a>
        <span className="mx-2">|</span>
        <a href="mailto:fixitswell@gmail.com" className="text-primary underline">Email us</a>
      </p>
    </form>
  );
};

export default ContactForm;
