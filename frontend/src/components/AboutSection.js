import { motion } from "framer-motion";
import { Code2, Layers, Palette, Film, Monitor } from "lucide-react";

const toolIcons = {
  "After Effects": Film, "Premiere Pro": Film, "Cinema 4D": Layers,
  "Blender": Layers, "Photoshop": Palette, "Illustrator": Palette,
  "Figma": Monitor, "DaVinci Resolve": Film,
};

export default function AboutSection({ data }) {
  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <section id="about" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 paper-texture" data-testid="about-section">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-4 mb-16">
          <span className="font-mono-label text-[10px] text-[#4A7A12]">01</span>
          <div className="h-px w-12 bg-[#4A7A12]" />
          <span className="font-mono-label text-[10px] text-[#6B7280]">ABOUT ME</span>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bio Card */}
          <motion.div variants={fadeUp} className="md:col-span-2 bg-white border border-[#D4CBB8] p-8 md:p-10 hover-paper shadow-sm paper-fold">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Unbounded' }}>
              {data.heading || "About"} <span className="text-[#4A7A12]">{data.heading_accent || "Me"}</span>
            </h2>
            <p className="text-[#6B7280] text-sm md:text-base leading-relaxed" data-testid="about-bio">{data.bio}</p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="bg-white border border-[#D4CBB8] p-8 flex flex-col justify-between hover-paper shadow-sm">
            <div>
              <span className="font-mono-label text-[9px] text-[#6B7280]">YEARS OF EXP</span>
              <p className="text-5xl font-bold text-[#4A7A12] mt-2" style={{ fontFamily: 'Unbounded' }} data-testid="about-years">{data.years_exp || "5+"}</p>
            </div>
            <div className="mt-6">
              <span className="font-mono-label text-[9px] text-[#6B7280]">PROJECTS</span>
              <p className="text-3xl font-bold text-[#1A1A1A] mt-1" style={{ fontFamily: 'Unbounded' }} data-testid="about-projects-count">{data.projects_count || "50+"}</p>
            </div>
          </motion.div>

          {/* Tools */}
          <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-2 bg-white border border-[#D4CBB8] p-8 hover-paper shadow-sm">
            <span className="font-mono-label text-[9px] text-[#6B7280] block mb-6">TOOLS & SOFTWARE</span>
            <div className="flex flex-wrap gap-3" data-testid="about-tools">
              {(data.tools || []).map((tool, i) => {
                const Icon = toolIcons[tool] || Code2;
                return (
                  <motion.div key={tool} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 bg-[#F5F0E8] border border-[#D4CBB8] px-4 py-2 font-mono-label text-[10px] text-[#1A1A1A] hover:border-[#4A7A12] hover:text-[#4A7A12] transition-colors cursor-default">
                    <Icon size={14} />{tool}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div variants={fadeUp} className="bg-white border border-[#D4CBB8] p-8 hover-paper shadow-sm">
            <span className="font-mono-label text-[9px] text-[#6B7280] block mb-6">SKILLS</span>
            <div className="space-y-4" data-testid="about-skills">
              {(data.skills || []).map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-1">
                    <span className="font-mono-label text-[10px] text-[#1A1A1A]">{skill.name}</span>
                    <span className="font-mono-label text-[10px] text-[#4A7A12]">{skill.level}%</span>
                  </div>
                  <div className="h-1.5 bg-[#EDE8DE] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${skill.level}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-[#4A7A12] rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div variants={fadeUp} className="md:col-span-2 lg:col-span-3 bg-white border border-[#D4CBB8] p-8 hover-paper shadow-sm">
            <span className="font-mono-label text-[9px] text-[#6B7280] block mb-6">EXPERIENCE</span>
            <div className="grid md:grid-cols-3 gap-6" data-testid="about-experience">
              {(data.experience || []).map((exp, i) => (
                <div key={i} className="border-l-2 border-[#4A7A12] pl-4">
                  <p className="font-mono-label text-[9px] text-[#4A7A12] mb-1">{exp.period}</p>
                  <h4 className="text-sm font-bold text-[#1A1A1A] mb-1">{exp.role}</h4>
                  <p className="text-xs text-[#6B7280] mb-2">{exp.company}</p>
                  <p className="text-xs text-[#6B7280]/70">{exp.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
