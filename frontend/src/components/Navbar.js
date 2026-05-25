import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    navigate("/admin");
  };

  return (
    <nav data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#F5F0E8]/95 backdrop-blur-md border-b border-[#D4CBB8] shadow-sm" : "bg-transparent"
      }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="font-mono-label text-xs text-[#4A7A12] tracking-widest cursor-pointer" data-testid="nav-logo">
          My portfolio
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}
              className="font-mono-label text-[10px] text-[#6B7280] hover:text-[#4A7A12] transition-colors duration-200"
              data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, '-')}`}>
              {link.label}
            </a>
          ))}
          <button onClick={handleLogin}
            className="font-mono-label text-[10px] bg-[#4A7A12] text-white px-4 py-2 hover:bg-[#3D6B0F] transition-colors shadow-sm"
            data-testid="nav-admin-login">
            Admin
          </button>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-[#1A1A1A]" data-testid="nav-mobile-toggle">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#F5F0E8] border-t border-[#D4CBB8] px-6 py-6 space-y-4" data-testid="nav-mobile-menu">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              className="block font-mono-label text-xs text-[#6B7280] hover:text-[#4A7A12] transition-colors">{link.label}</a>
          ))}
          <button onClick={handleLogin} className="w-full font-mono-label text-xs bg-[#4A7A12] text-white px-4 py-3 hover:bg-[#3D6B0F] transition-colors">
            Admin Login
          </button>
        </div>
      )}
    </nav>
  );
}
