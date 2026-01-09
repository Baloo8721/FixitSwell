import { Phone, Menu, X, Info, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logo from "@/assets/logo.jpeg";
import AboutUsOverlay from "@/components/AboutUsOverlay";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const navLinks = [
    { href: "#services", label: "Services" },
    { href: "#packages", label: "Packages" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - original sizing restored */}
            <a href="/" className="flex-shrink-0">
              <img 
                src={logo} 
                alt="FixitSwell - Your Go-To Home Helper" 
                className="h-20 md:h-24 w-auto" 
              />
            </a>

            {/* Desktop Nav - centered links with CTA buttons */}
            <nav className="hidden md:flex flex-1 items-center justify-center gap-5 lg:gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-foreground hover:text-primary transition-colors font-semibold text-base lg:text-lg whitespace-nowrap"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => setIsAboutOpen(true)}
                className="text-foreground hover:text-primary transition-colors font-semibold text-base lg:text-lg flex items-center gap-1.5 whitespace-nowrap"
              >
                <Info className="w-4 h-4 lg:w-5 lg:h-5" />
                About Us
              </button>
            </nav>
            
            {/* CTA Buttons - stacked on tablet, side-by-side on large */}
            <div className="hidden md:flex flex-col lg:flex-row gap-1.5 lg:gap-2 flex-shrink-0">
              <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl text-xs lg:text-sm px-3 lg:px-4">
                <a href="tel:+18137381655">
                  <Phone className="w-4 h-4 mr-1.5" />
                  Call Now
                </a>
              </Button>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs lg:text-sm px-3 lg:px-4">
                <a href="#booking">
                  <CalendarDays className="w-4 h-4 mr-1.5" />
                  Book Now
                </a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {isMenuOpen && (
            <nav className="md:hidden pt-4 pb-2 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAboutOpen(true);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2 text-left flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                About Us
              </button>
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl w-full">
                  <a href="#booking" onClick={() => setIsMenuOpen(false)}>
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Book Now
                  </a>
                </Button>
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl w-full">
                  <a href="tel:+18137381655">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </a>
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>
      
      <AboutUsOverlay open={isAboutOpen} onOpenChange={setIsAboutOpen} />
    </>
  );
};

export default Header;
