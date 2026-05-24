import { motion } from "framer-motion";
import { Download, GraduationCap, Award, Briefcase } from "lucide-react";

export default function ResumeSection({ data, aboutData }) {
  const experience = aboutData?.experience || [];
  const education = data?.education || [];
  const certifications = data?.certifications || [];

  return (
    <section id="resume" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-white paper-grain" data-testid="resume-section">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-4 mb-4">
          <span className="font-mono-label text-[10px] text-[#4A7A12]">04</span>
          <div className="h-px w-12 bg-[#4A7A12]" />
          <span className="font-mono-label text-[10px] text-[#6B7280]">RESUME</span>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'Unbounded' }}>
            {data?.heading || "My"} <span className="text-[#4A7A12]">{data?.heading_accent || "Resume"}</span>
          </motion.h2>
          {data?.resume_url && (
            <a href={data.resume_url} target="_blank" rel="noopener noreferrer"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-[#4A7A12] text-white font-mono-label text-[11px] px-5 py-3 hover:bg-[#3D6B0F] transition-colors hover-paper"
              data-testid="resume-download-btn">
              <Download size={14} /> DOWNLOAD CV
            </a>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Experience Timeline */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Briefcase size={18} className="text-[#4A7A12]" />
              <span className="font-mono-label text-[10px] text-[#6B7280]">EXPERIENCE</span>
            </div>
            <div className="relative" data-testid="resume-experience">
              <div className="absolute left-[7px] top-0 bottom-0 w-px border-l border-dashed border-[#D4CBB8]" />
              {experience.map((exp, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }} className="relative pl-8 pb-10 last:pb-0">
                  <div className="absolute left-0 top-1 w-[15px] h-[15px] rounded-full bg-[#F5F0E8] border-2 border-[#4A7A12] accent-glow" />
                  <div className="bg-[#F5F0E8] border border-[#D4CBB8] p-6 hover-paper shadow-sm">
                    <span className="font-mono-label text-[9px] text-[#4A7A12]">{exp.period}</span>
                    <h4 className="text-base font-bold text-[#1A1A1A] mt-2">{exp.role}</h4>
                    <p className="text-sm text-[#6B7280] mt-1">{exp.company}</p>
                    <p className="text-xs text-[#6B7280]/70 mt-2">{exp.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Education & Certifications */}
          <div>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <GraduationCap size={18} className="text-[#4A7A12]" />
                <span className="font-mono-label text-[10px] text-[#6B7280]">EDUCATION</span>
              </div>
              <div data-testid="resume-education">
                {education.map((edu, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }} className="bg-[#F5F0E8] border border-[#D4CBB8] p-6 mb-4 hover-paper shadow-sm">
                    <span className="font-mono-label text-[9px] text-[#4A7A12]">{edu.year}</span>
                    <h4 className="text-base font-bold text-[#1A1A1A] mt-2">{edu.degree}</h4>
                    <p className="text-sm text-[#6B7280] mt-1">{edu.school}</p>
                    <p className="text-xs text-[#6B7280]/70 mt-2">{edu.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-8">
                <Award size={18} className="text-[#4A7A12]" />
                <span className="font-mono-label text-[10px] text-[#6B7280]">CERTIFICATIONS</span>
              </div>
              <div className="space-y-3" data-testid="resume-certifications">
                {certifications.map((cert, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }} className="flex items-center gap-3 bg-[#F5F0E8] border border-[#D4CBB8] p-4 hover:border-[#4A7A12] transition-colors">
                    <div className="w-2 h-2 bg-[#4A7A12] flex-shrink-0" />
                    <span className="text-sm text-[#1A1A1A]">{cert}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
