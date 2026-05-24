import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Tag, Play, X } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    fetch(`${API}/projects/${projectId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="text-[#4A7A12] font-mono-label text-sm animate-pulse">LOADING PROJECT...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center gap-4">
        <p className="text-[#6B7280] text-sm">Project not found</p>
        <button onClick={() => navigate("/")} className="text-[#4A7A12] font-mono-label text-xs underline">Go back</button>
      </div>
    );
  }

  const detailImages = project.detail_images || [project.image];
  const hasVideo = project.video_url;

  return (
    <div className="min-h-screen bg-[#F5F0E8] paper-texture" data-testid="project-detail-page">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#F5F0E8]/95 backdrop-blur-md border-b border-[#D4CBB8]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#4A7A12] transition-colors font-mono-label text-[10px]"
            data-testid="project-back-btn"
          >
            <ArrowLeft size={16} /> BACK TO PORTFOLIO
          </button>
          <span className="font-mono-label text-[10px] text-[#4A7A12]">PROJECT DETAIL</span>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-24 pb-20">
        {/* Hero cover image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full aspect-[16/7] overflow-hidden border border-[#D4CBB8] bg-white shadow-md mb-12"
        >
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
            data-testid="project-detail-cover"
          />
          {/* Tags overlay */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            {(project.tags || []).map((tag) => (
              <span
                key={tag}
                className="font-mono-label text-[9px] bg-white/90 text-[#4A7A12] border border-[#4A7A12]/30 px-3 py-1 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Project info */}
        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <span className="font-mono-label text-[10px] text-[#4A7A12] mb-4 block">PROJECT</span>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1A1A] mb-6"
              style={{ fontFamily: "Unbounded" }}
              data-testid="project-detail-title"
            >
              {project.title}
            </h1>
            <p className="text-[#6B7280] text-base md:text-lg leading-relaxed mb-6" data-testid="project-detail-description">
              {project.description}
            </p>

            {/* Detailed text */}
            {project.detail_text && (
              <div className="bg-white border border-[#D4CBB8] p-6 md:p-8 shadow-sm paper-fold" data-testid="project-detail-text">
                <span className="font-mono-label text-[9px] text-[#6B7280] block mb-4">ABOUT THIS PROJECT</span>
                <p className="text-[#1A1A1A] text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {project.detail_text}
                </p>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Tags card */}
            <div className="bg-white border border-[#D4CBB8] p-6 shadow-sm">
              <span className="font-mono-label text-[9px] text-[#6B7280] block mb-4">TAGS</span>
              <div className="flex flex-wrap gap-2">
                {(project.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 font-mono-label text-[10px] text-[#4A7A12] border border-[#4A7A12]/30 px-3 py-1.5"
                  >
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Link */}
            {project.link && project.link !== "#" && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#4A7A12] text-white font-mono-label text-[11px] px-6 py-3 hover:bg-[#3D6B0F] transition-colors hover-paper text-center shadow-sm"
                data-testid="project-detail-link"
              >
                <ExternalLink size={14} className="inline mr-2" /> VIEW LIVE PROJECT
              </a>
            )}

            {/* Video */}
            {hasVideo && (
              <div className="bg-white border border-[#D4CBB8] p-4 shadow-sm">
                <span className="font-mono-label text-[9px] text-[#6B7280] block mb-3">PROJECT VIDEO</span>
                <video
                  src={project.video_url}
                  controls
                  className="w-full border border-[#D4CBB8]"
                  data-testid="project-detail-video"
                />
              </div>
            )}

            {/* Back button */}
            <button
              onClick={() => navigate("/")}
              className="w-full border-2 border-[#4A7A12] text-[#4A7A12] font-mono-label text-[11px] px-6 py-3 hover:bg-[#4A7A12] hover:text-white transition-colors text-center"
            >
              <ArrowLeft size={14} className="inline mr-2" /> ALL PROJECTS
            </button>
          </motion.div>
        </div>

        {/* Project Gallery */}
        {detailImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="font-mono-label text-[10px] text-[#4A7A12] mb-6 block">PROJECT GALLERY</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="project-detail-gallery">
              {detailImages.map((img, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden border border-[#D4CBB8] bg-white shadow-sm cursor-pointer group"
                  onClick={() => setLightboxImg(img)}
                  data-testid={`project-gallery-img-${i}`}
                >
                  <div className={`${i === 0 && detailImages.length > 1 ? "md:col-span-2 aspect-[16/9]" : "aspect-[4/3]"} overflow-hidden`}>
                    <img
                      src={img}
                      alt={`${project.title} - ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-[#4A7A12]/0 group-hover:bg-[#4A7A12]/10 transition-colors duration-300" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-[#1A1A1A]/90 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setLightboxImg(null)}
        >
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 text-white hover:text-[#CCFF00] z-50"
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImg}
            alt="Full size"
            className="max-w-4xl max-h-[80vh] w-full object-contain border border-[#333]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
