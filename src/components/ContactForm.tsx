import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission for now
    // TODO: Connect to backend when Lovable Cloud is enabled
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });
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
          placeholder="e.g., John Smith" 
          required
          className="h-14 text-lg rounded-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-lg">Phone Number</Label>
        <Input 
          id="phone" 
          name="phone"
          type="tel" 
          placeholder="e.g., (555) 123-4567" 
          required
          className="h-14 text-lg rounded-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-lg">How Can We Help?</Label>
        <Textarea 
          id="message" 
          name="message"
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
        Prefer to call? <a href="tel:+1234567890" className="text-primary underline">Click here</a>
      </p>
    </form>
  );
};

export default ContactForm;
