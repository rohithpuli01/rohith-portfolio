import { motion } from "framer-motion";
import { Download, GraduationCap, Award, Briefcase } from "lucide-react";

export default function ResumeSection({ data, aboutData }) {
  const experience = aboutData?.experience || [];
  const education = data?.education || [];
  const certifications = data?.certifications || [];

  return (
    <section id="resume" className="py-24 md:py-32 px-6 md:px-12 lg:px-24" data-testid="resume-section">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-4"
        >
          <span className="font-mono-label text-[10px] text-[#CCFF00]">04</span>
          <div className="h-px w-12 bg-[#CCFF00]" />
          <span className="font-mono-label text-[10px] text-[#A1A1AA]">RESUME</span>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold tracking-tight"
            style={{ fontFamily: 'Unbounded' }}
          >
            My <span className="text-[#CCFF00]">Resume</span>
          </motion.h2>
          {data?.resume_url && (
            <a
              href={data.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-[#CCFF00] text-[#0B0B0D] font-mono-label text-[11px] px-5 py-3 hover:bg-[#AADD00] transition-colors hover-brutalist"
              data-testid="resume-download-btn"
            >
              <Download size={14} /> DOWNLOAD CV
            </a>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Experience Timeline */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Briefcase size={18} className="text-[#CCFF00]" />
              <span className="font-mono-label text-[10px] text-[#A1A1AA]">EXPERIENCE</span>
            </div>
            <div className="relative" data-testid="resume-experience">
              {/* Dashed line */}
              <div className="absolute left-[7px] top-0 bottom-0 w-px border-l border-dashed border-[#333340]" />

              {experience.map((exp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative pl-8 pb-10 last:pb-0"
                >
                  {/* Glowing node */}
                  <div className="absolute left-0 top-1 w-[15px] h-[15px] rounded-full bg-[#0B0B0D] border-2 border-[#CCFF00] neon-glow" />

                  <div className="bg-[#17171C] border border-[#333340] p-6 hover-brutalist">
                    <span className="font-mono-label text-[9px] text-[#CCFF00]">{exp.period}</span>
                    <h4 className="text-base font-bold text-[#FAFAFA] mt-2">{exp.role}</h4>
                    <p className="text-sm text-[#A1A1AA] mt-1">{exp.company}</p>
                    <p className="text-xs text-[#A1A1AA]/70 mt-2">{exp.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Education & Certifications */}
          <div>
            {/* Education */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <GraduationCap size={18} className="text-[#CCFF00]" />
                <span className="font-mono-label text-[10px] text-[#A1A1AA]">EDUCATION</span>
              </div>
              <div data-testid="resume-education">
                {education.map((edu, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="bg-[#17171C] border border-[#333340] p-6 mb-4 hover-brutalist"
                  >
                    <span className="font-mono-label text-[9px] text-[#CCFF00]">{edu.year}</span>
                    <h4 className="text-base font-bold text-[#FAFAFA] mt-2">{edu.degree}</h4>
                    <p className="text-sm text-[#A1A1AA] mt-1">{edu.school}</p>
                    <p className="text-xs text-[#A1A1AA]/70 mt-2">{edu.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Award size={18} className="text-[#CCFF00]" />
                <span className="font-mono-label text-[10px] text-[#A1A1AA]">CERTIFICATIONS</span>
              </div>
              <div className="space-y-3" data-testid="resume-certifications">
                {certifications.map((cert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 bg-[#17171C] border border-[#333340] p-4 hover:border-[#CCFF00] transition-colors"
                  >
                    <div className="w-2 h-2 bg-[#CCFF00] flex-shrink-0" />
                    <span className="text-sm text-[#FAFAFA]">{cert}</span>
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
