import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import { ArrowDown } from "lucide-react";

export default function HeroSection({ data }) {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden paper-texture" data-testid="hero-section">
      {/* Marquee behind */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full opacity-[0.04] pointer-events-none">
        <Marquee speed={40} gradient={false}>
          <span className="text-[12vw] font-bold tracking-tighter whitespace-nowrap text-[#4A7A12] mx-8" style={{ fontFamily: 'Unbounded' }}>
            {data.marquee_text || "MOTION GRAPHIC DESIGNER \u2022 VISUAL STORYTELLER \u2022 CREATIVE DIRECTOR"}&nbsp;&bull;&nbsp;
          </span>
        </Marquee>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-32 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] mb-8"
              style={{ fontFamily: 'Unbounded' }}
              data-testid="hero-title-label"
            >
              <span className="text-[#1A1A1A]">{data.name?.split(" ")[0] || "ROHITH"}</span>
              <br />
              <span className="text-[#4A7A12]">{data.name?.split(" ")[1] || "PULI"}</span>
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-mono-label text-sm sm:text-base md:text-lg text-[#4A7A12] mb-6 tracking-[0.15em]"
              data-testid="hero-name"
            >
              {data.title || "MOTION GRAPHIC DESIGNER"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[#6B7280] text-base md:text-lg max-w-md leading-relaxed mb-10"
              data-testid="hero-subtitle"
            >
              {data.subtitle || "Crafting visual stories through motion & design"}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex gap-4"
            >
              <a
                href="#projects"
                className="bg-[#4A7A12] text-white font-mono-label text-[11px] px-6 py-3 hover:bg-[#3D6B0F] transition-colors hover-paper"
                data-testid="hero-cta-projects"
              >
                {data.cta_primary || "VIEW WORK"}
              </a>
              <a
                href="#contact"
                className="border-2 border-[#4A7A12] text-[#4A7A12] font-mono-label text-[11px] px-6 py-3 hover:bg-[#4A7A12] hover:text-white transition-colors"
                data-testid="hero-cta-contact"
              >
                {data.cta_secondary || "GET IN TOUCH"}
              </a>
            </motion.div>
          </div>

          {/* Profile image with torn paper + tape */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
              {/* Clean paper frame - no semi-transparent overlays */}
              <div className="absolute -inset-3 bg-[#EDE8DE] rotate-2 shadow-md border border-[#D4CBB8]" />
              <div className="absolute -inset-1 bg-white -rotate-1 shadow-sm border border-[#D4CBB8]" />
              <div className="overflow-hidden w-full h-full bg-white shadow-lg relative border border-[#D4CBB8]">
                {/* Tape on top - outside image area */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#CCFF00]/50 rotate-[-2deg] z-10" />
                <img
                  src={data.profile_image || "https://images.pexels.com/photos/8242769/pexels-photo-8242769.jpeg"}
                  alt="Rohith Puli"
                  className="w-full h-full object-cover"
                  style={{ imageRendering: "auto" }}
                  data-testid="hero-profile-image"
                />
              </div>
              <div className="absolute -bottom-5 -right-5 bg-[#CCFF00] text-[#1A1A1A] font-mono-label text-[10px] px-4 py-2 rotate-3 shadow-md" data-testid="hero-badge">
                {data.badge_text || "AVAILABLE FOR HIRE"}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2"
        >
          <a href="#about" className="flex flex-col items-center gap-2 text-[#6B7280] hover:text-[#4A7A12] transition-colors">
            <span className="font-mono-label text-[9px]">SCROLL</span>
            <ArrowDown size={14} className="animate-bounce" />
          </a>
        </motion.div>
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[#D4CBB8]" />
    </section>
  );
}
