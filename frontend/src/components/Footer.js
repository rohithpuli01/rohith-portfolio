import { Instagram, Linkedin, Youtube, Globe, Heart } from "lucide-react";

const socialIcons = { instagram: Instagram, linkedin: Linkedin, youtube: Youtube, behance: Globe, dribbble: Globe };

export default function Footer({ contactData, footerData }) {
  const socials = contactData?.socials || {};

  return (
    <footer className="border-t border-[#D4CBB8] py-12 px-6 md:px-12 lg:px-24 bg-white" data-testid="footer">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="font-mono-label text-xs text-[#4A7A12] tracking-widest">My portfolio</span>
            <p className="text-[#6B7280] text-xs mt-2" data-testid="footer-tagline">{footerData?.tagline || "Motion Graphic Designer"}</p>
          </div>
          <div className="flex items-center gap-4" data-testid="footer-socials">
            {Object.entries(socials).map(([key, url]) => {
              const Icon = socialIcons[key] || Globe;
              return (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#F5F0E8] border border-[#D4CBB8] flex items-center justify-center text-[#6B7280] hover:text-[#4A7A12] hover:border-[#4A7A12] transition-colors"
                  data-testid={`social-${key}`}>
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
          <p className="text-[#6B7280] text-xs flex items-center gap-1" data-testid="footer-copyright">
            {footerData?.copyright || <>Made with <Heart size={12} className="text-[#4A7A12]" /> by Rohith Puli</>}
          </p>
        </div>
      </div>
    </footer>
  );
}
