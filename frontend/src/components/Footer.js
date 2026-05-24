import { Instagram, Linkedin, Youtube, Globe, Heart } from "lucide-react";

const socialIcons = {
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  behance: Globe,
  dribbble: Globe,
};

export default function Footer({ contactData }) {
  const socials = contactData?.socials || {};

  return (
    <footer className="border-t border-[#333340] py-12 px-6 md:px-12 lg:px-24" data-testid="footer">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="font-mono-label text-xs text-[#CCFF00] tracking-widest">My portfolio</span>
            <p className="text-[#A1A1AA] text-xs mt-2">Motion Graphic Designer</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4" data-testid="footer-socials">
            {Object.entries(socials).map(([key, url]) => {
              const Icon = socialIcons[key] || Globe;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#17171C] border border-[#333340] flex items-center justify-center text-[#A1A1AA] hover:text-[#CCFF00] hover:border-[#CCFF00] transition-colors"
                  data-testid={`social-${key}`}
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>

          <p className="text-[#A1A1AA] text-xs flex items-center gap-1">
            Made with <Heart size={12} className="text-[#CCFF00]" /> by Rohith Puli
          </p>
        </div>
      </div>
    </footer>
  );
}
