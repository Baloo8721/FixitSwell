import { Phone, Menu, X, Info } from "lucide-react";
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
    { href: "#booking", label: "Book Now" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/">
              <img src={logo} alt="FixitSwell - Your Go-To Home Helper" className="h-20 md:h-24 w-auto" />
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => setIsAboutOpen(true)}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1"
              >
                <Info className="w-4 h-4" />
                About Us
              </button>
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
                <a href="tel:+18137381655">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </a>
              </Button>
            </nav>

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
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl w-full">
                <a href="tel:+18137381655">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </a>
              </Button>
            </nav>
          )}
        </div>
      </header>
      
      <AboutUsOverlay open={isAboutOpen} onOpenChange={setIsAboutOpen} />
    </>
  );
};

export default Header;
