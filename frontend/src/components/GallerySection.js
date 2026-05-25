import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";

export default function GallerySection({ items, contentData }) {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <section id="gallery" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 paper-texture" data-testid="gallery-section">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-4 mb-4">
          <span className="font-mono-label text-[10px] text-[#4A7A12]">03</span>
          <div className="h-px w-12 bg-[#4A7A12]" />
          <span className="font-mono-label text-[10px] text-[#6B7280]">{contentData?.label || "GALLERY"}</span>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold tracking-tight mb-12 text-[#1A1A1A]" style={{ fontFamily: 'Unbounded' }}>
          {contentData?.heading || "Visual"} <span className="text-[#4A7A12]">{contentData?.heading_accent || "Archive"}</span>
        </motion.h2>

        {/* Masonry-style columns that preserve original dimensions */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4" data-testid="gallery-grid">
          {items.map((item, i) => (
            <motion.div
              key={item.item_id || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative cursor-pointer break-inside-avoid border border-[#D4CBB8] bg-white shadow-sm overflow-hidden"
              onClick={() => setSelectedItem(item)}
              data-testid={`gallery-item-${i}`}
            >
              {item.type === "video" ? (
                <div className="relative group/vid">
                  <video
                    src={item.url}
                    poster={item.thumbnail || ""}
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                    className="w-full h-auto block"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-[#4A7A12]/90 flex items-center justify-center group-hover/vid:opacity-0 transition-opacity">
                      <Play size={20} className="text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
                />
              )}

              {/* Hover overlay with title */}
              <div className="absolute inset-0 bg-[#4A7A12]/0 group-hover:bg-[#4A7A12]/10 transition-colors duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1A1A1A]/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="font-mono-label text-[10px] text-[#CCFF00]">{item.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox - full original dimensions */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedItem(null)}
            data-testid="gallery-lightbox"
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-[#CCFF00] transition-colors z-50"
              data-testid="gallery-lightbox-close"
            >
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-[90vw] max-h-[90vh] flex flex-col items-center"
            >
              {selectedItem.type === "video" ? (
                <video
                  src={selectedItem.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] object-contain"
                  data-testid="gallery-lightbox-video"
                />
              ) : (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="max-w-full max-h-[85vh] object-contain"
                />
              )}
              <p className="font-mono-label text-[10px] text-[#CCFF00] mt-4 text-center">{selectedItem.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
