import { Phone, Clock, CheckCircle, CalendarDays } from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="py-10 px-4 bg-background">
      <div className="container max-w-4xl mx-auto">
        <h2 className="font-heading text-heading-md text-center text-foreground mb-8">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-4 bg-secondary/30 rounded-xl">
            <div className="relative mb-4">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center">
                <Phone className="w-7 h-7 text-primary" />
              </div>
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-sm">
                1
              </span>
            </div>
            <h3 className="font-heading text-lg text-foreground mb-2">
              Reach Out
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              Tell us what you need — <a href="tel:+18137381655" className="text-primary underline hover:text-primary/80">call</a>, <a href="sms:+18137381655" className="text-primary underline hover:text-primary/80">text</a>, <a href="#message-form" className="text-primary underline hover:text-primary/80">message</a>, or <a href="#booking" className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1">schedule online <span className="inline-flex items-center justify-center w-5 h-5 bg-primary rounded-full"><CalendarDays className="w-3 h-3 text-primary-foreground" /></span></a>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-4 bg-secondary/30 rounded-xl">
            <div className="relative mb-4">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-sm">
                2
              </span>
            </div>
            <h3 className="font-heading text-lg text-foreground mb-2">
              We Arrive On Time
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              Friendly, respectful service at your convenience.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-4 bg-secondary/30 rounded-xl">
            <div className="relative mb-4">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-primary" />
              </div>
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-sm">
                3
              </span>
            </div>
            <h3 className="font-heading text-lg text-foreground mb-2">
              Job Done Safely
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              No mess, no stress — quality work and help you can trust.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
