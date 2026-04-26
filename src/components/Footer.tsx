import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
            <Heart className="w-4 h-4 text-medic" />
            <span>Local Help You Can Trust</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FixitSwell. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-2">FixitSwell@gmail.com</p>
          <p className="text-sm text-muted-foreground">813-738-1655</p>
          <p className="text-sm text-muted-foreground mt-1">Licensed & Insured</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
