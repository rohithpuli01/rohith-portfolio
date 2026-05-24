import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { ExternalLink } from "lucide-react";

export default function ProjectsSection({ projects }) {
  return (
    <section id="projects" className="py-24 md:py-32 overflow-hidden" data-testid="projects-section">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-4"
        >
          <span className="font-mono-label text-[10px] text-[#CCFF00]">02</span>
          <div className="h-px w-12 bg-[#CCFF00]" />
          <span className="font-mono-label text-[10px] text-[#A1A1AA]">SELECTED WORK</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold tracking-tight"
          style={{ fontFamily: 'Unbounded' }}
        >
          Projects
        </motion.h2>
      </div>

      {/* Moving frames carousel */}
      <Swiper
        modules={[Autoplay, FreeMode]}
        spaceBetween={24}
        slidesPerView="auto"
        speed={4000}
        autoplay={{ delay: 0, disableOnInteraction: false }}
        loop={true}
        freeMode={true}
        className="!px-6 md:!px-12"
        data-testid="projects-carousel"
      >
        {projects.map((project, i) => (
          <SwiperSlide key={project.project_id || i} style={{ width: "auto" }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative w-[300px] md:w-[400px] cursor-pointer"
            >
              {/* Film strip frame */}
              <div className="relative overflow-hidden border border-[#333340] bg-[#17171C]">
                {/* Top perforations */}
                <div className="flex justify-between px-2 py-1 bg-[#0B0B0D] border-b border-[#333340]">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div key={j} className="w-3 h-2 rounded-sm bg-[#23232C]" />
                  ))}
                </div>

                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-[#CCFF00]/0 group-hover:bg-[#CCFF00]/10 transition-colors duration-300 flex items-center justify-center">
                    <ExternalLink className="text-[#CCFF00] opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={32} />
                  </div>
                </div>

                {/* Bottom perforations */}
                <div className="flex justify-between px-2 py-1 bg-[#0B0B0D] border-t border-[#333340]">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div key={j} className="w-3 h-2 rounded-sm bg-[#23232C]" />
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 px-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  {(project.tags || []).map((tag) => (
                    <span key={tag} className="font-mono-label text-[9px] text-[#CCFF00] border border-[#CCFF00]/30 px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-sm font-bold text-[#FAFAFA] group-hover:text-[#CCFF00] transition-colors" data-testid={`project-title-${i}`}>
                  {project.title}
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-1">{project.description}</p>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
