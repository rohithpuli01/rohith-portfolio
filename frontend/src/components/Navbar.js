import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Gallery", href: "#gallery" },
  { label: "Resume", href: "#resume" },
  { label: "Spin & Win", href: "#wheel" },
  { label: "Contact", href: "#contact" },
  { label: "Reviews", href: "#feedback" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/admin";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0B0B0D]/95 backdrop-blur-md border-b border-[#333340]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="font-mono-label text-xs text-[#CCFF00] tracking-widest cursor-pointer" data-testid="nav-logo">
          My portfolio
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono-label text-[10px] text-[#A1A1AA] hover:text-[#CCFF00] transition-colors duration-200"
              data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={handleLogin}
            className="font-mono-label text-[10px] bg-[#CCFF00] text-[#0B0B0D] px-4 py-2 hover:bg-[#AADD00] transition-colors"
            data-testid="nav-admin-login"
          >
            Admin
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-[#FAFAFA]"
          data-testid="nav-mobile-toggle"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0B0B0D] border-t border-[#333340] px-6 py-6 space-y-4" data-testid="nav-mobile-menu">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block font-mono-label text-xs text-[#A1A1AA] hover:text-[#CCFF00] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={handleLogin}
            className="w-full font-mono-label text-xs bg-[#CCFF00] text-[#0B0B0D] px-4 py-3 hover:bg-[#AADD00] transition-colors"
          >
            Admin Login
          </button>
        </div>
      )}
    </nav>
  );
}
