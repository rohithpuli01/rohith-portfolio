import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";

export default function GallerySection({ items, contentData }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const sizes = ["row-span-2", "", "col-span-2", "", "row-span-2", ""];

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

        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[200px] md:auto-rows-[250px] gap-3" data-testid="gallery-grid">
          {items.map((item, i) => (
            <motion.div key={item.item_id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }} className={`group relative cursor-pointer overflow-hidden border border-[#D4CBB8] bg-white shadow-sm ${sizes[i % sizes.length]}`}
              onClick={() => setSelectedItem(item)} data-testid={`gallery-item-${i}`}>
              {item.type === "video" ? (
                <div className="w-full h-full relative group/vid">
                  <video src={item.url} poster={item.thumbnail || ""} muted loop playsInline
                    onMouseEnter={(e) => e.target.play()} onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                    className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-[#4A7A12]/90 flex items-center justify-center group-hover/vid:opacity-0 transition-opacity">
                      <Play size={20} className="text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <img src={item.url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
              <div className="absolute inset-0 bg-[#4A7A12]/0 group-hover:bg-[#4A7A12]/10 transition-colors duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1A1A1A]/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="font-mono-label text-[10px] text-[#CCFF00]">{item.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#1A1A1A]/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSelectedItem(null)} data-testid="gallery-lightbox">
            <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 text-white hover:text-[#CCFF00] transition-colors z-50" data-testid="gallery-lightbox-close">
              <X size={24} />
            </button>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} className="max-w-4xl max-h-[80vh] w-full">
              {selectedItem.type === "video" ? (
                <video src={selectedItem.url} controls autoPlay className="w-full max-h-[80vh] object-contain border border-[#333] bg-black" data-testid="gallery-lightbox-video" />
              ) : (
                <img src={selectedItem.url} alt={selectedItem.title} className="w-full h-auto max-h-[80vh] object-contain border border-[#333]" />
              )}
              <p className="font-mono-label text-[10px] text-[#CCFF00] mt-4 text-center">{selectedItem.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
