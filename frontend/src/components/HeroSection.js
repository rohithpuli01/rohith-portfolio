import { motion } from "framer-motion";
import Marquee from "react-fast-marquee";
import { ArrowDown } from "lucide-react";

export default function HeroSection({ data }) {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden" data-testid="hero-section">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("https://static.prod-images.emergentagent.com/jobs/f74c8429-af4c-4f76-9bdb-65d785ad9650/images/f49cc2295031c919d93c6568de25f0782c9f1e187b4c9714c8cf11162750c691.png")`,
        backgroundSize: "cover"
      }} />

      {/* Marquee behind */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full opacity-[0.06] pointer-events-none">
        <Marquee speed={40} gradient={false}>
          <span className="text-[12vw] font-bold tracking-tighter whitespace-nowrap text-[#CCFF00] mx-8" style={{ fontFamily: 'Unbounded' }}>
            MOTION GRAPHIC DESIGNER &bull; VISUAL STORYTELLER &bull; CREATIVE DIRECTOR &bull;&nbsp;
          </span>
        </Marquee>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-32 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-mono-label text-[10px] text-[#CCFF00] mb-6"
            >
              MOTION GRAPHIC DESIGNER
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.9] mb-8"
              style={{ fontFamily: 'Unbounded' }}
            >
              <span className="text-[#FAFAFA]">{data.name?.split(" ")[0] || "ROHITH"}</span>
              <br />
              <span className="text-[#CCFF00] neon-text-glow">{data.name?.split(" ")[1] || "PULI"}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[#A1A1AA] text-base md:text-lg max-w-md leading-relaxed mb-10"
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
                className="bg-[#CCFF00] text-[#0B0B0D] font-mono-label text-[11px] px-6 py-3 hover:bg-[#AADD00] transition-colors hover-brutalist"
                data-testid="hero-cta-projects"
              >
                VIEW WORK
              </a>
              <a
                href="#contact"
                className="border border-[#333340] text-[#FAFAFA] font-mono-label text-[11px] px-6 py-3 hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors"
                data-testid="hero-cta-contact"
              >
                GET IN TOUCH
              </a>
            </motion.div>
          </div>

          {/* Right - Profile image with torn edge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
              <div className="absolute -inset-4 border border-[#CCFF00]/20 rotate-3" />
              <div className="absolute -inset-2 border border-[#333340] -rotate-2" />
              <div className="torn-edge overflow-hidden w-full h-full">
                <img
                  src={data.profile_image || "https://images.pexels.com/photos/8242769/pexels-photo-8242769.jpeg"}
                  alt="Rohith Puli"
                  className="w-full h-full object-cover"
                  data-testid="hero-profile-image"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-[#CCFF00] text-[#0B0B0D] font-mono-label text-[10px] px-4 py-2 rotate-3">
                AVAILABLE FOR HIRE
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <a href="#about" className="flex flex-col items-center gap-2 text-[#A1A1AA] hover:text-[#CCFF00] transition-colors">
            <span className="font-mono-label text-[9px]">SCROLL</span>
            <ArrowDown size={14} className="animate-bounce" />
          </a>
        </motion.div>
      </div>

      {/* Neon line separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CCFF00]/40 to-transparent" />
    </section>
  );
}
