import { ShieldCheck } from "lucide-react";

const SafetyNote = () => {
  return (
    <section className="py-12 px-4 bg-background">
      <div className="container max-w-3xl mx-auto">
        <div className="bg-secondary/70 border border-border rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-xl text-foreground mb-2">
              Safety & Legal Transparency
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We only provide minor, non-structural services that are permitted in Florida 
              without a contractor license. This means no electrical wiring, no plumbing, 
              no HVAC work, and no major construction. Your safety always comes first — 
              and we&apos;ll always be honest about what we can and can&apos;t do.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetyNote;
