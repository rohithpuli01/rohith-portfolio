import { motion } from "framer-motion";
import { Code2, Layers, Palette, Film, Monitor, Sparkles } from "lucide-react";

const toolIcons = {
  "After Effects": Film,
  "Premiere Pro": Film,
  "Cinema 4D": Layers,
  "Blender": Layers,
  "Photoshop": Palette,
  "Illustrator": Palette,
  "Figma": Monitor,
  "DaVinci Resolve": Film,
};

export default function AboutSection({ data }) {
  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="about" className="py-24 md:py-32 px-6 md:px-12 lg:px-24" data-testid="about-section">
      <div className="max-w-7xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-16"
        >
          <span className="font-mono-label text-[10px] text-[#CCFF00]">01</span>
          <div className="h-px w-12 bg-[#CCFF00]" />
          <span className="font-mono-label text-[10px] text-[#A1A1AA]">ABOUT ME</span>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Bio Card - spans 2 cols */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-2 bg-[#17171C] border border-[#333340] p-8 md:p-10 hover-brutalist"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Unbounded' }}>
              About <span className="text-[#CCFF00]">Me</span>
            </h2>
            <p className="text-[#A1A1AA] text-sm md:text-base leading-relaxed" data-testid="about-bio">
              {data.bio}
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={fadeUp}
            className="bg-[#17171C] border border-[#333340] p-8 flex flex-col justify-between hover-brutalist"
          >
            <div>
              <span className="font-mono-label text-[9px] text-[#A1A1AA]">YEARS OF EXP</span>
              <p className="text-5xl font-bold text-[#CCFF00] mt-2 neon-text-glow" style={{ fontFamily: 'Unbounded' }}>
                {data.experience?.length ? `${data.experience.length}+` : "5+"}
              </p>
            </div>
            <div className="mt-6">
              <span className="font-mono-label text-[9px] text-[#A1A1AA]">PROJECTS</span>
              <p className="text-3xl font-bold text-[#FAFAFA] mt-1" style={{ fontFamily: 'Unbounded' }}>50+</p>
            </div>
          </motion.div>

          {/* Tools */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-2 lg:col-span-2 bg-[#17171C] border border-[#333340] p-8 hover-brutalist"
          >
            <span className="font-mono-label text-[9px] text-[#A1A1AA] block mb-6">TOOLS & SOFTWARE</span>
            <div className="flex flex-wrap gap-3" data-testid="about-tools">
              {(data.tools || []).map((tool, i) => {
                const Icon = toolIcons[tool] || Code2;
                return (
                  <motion.div
                    key={tool}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 bg-[#23232C] border border-[#333340] px-4 py-2 font-mono-label text-[10px] text-[#FAFAFA] hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors cursor-default"
                  >
                    <Icon size={14} />
                    {tool}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div
            variants={fadeUp}
            className="bg-[#17171C] border border-[#333340] p-8 hover-brutalist"
          >
            <span className="font-mono-label text-[9px] text-[#A1A1AA] block mb-6">SKILLS</span>
            <div className="space-y-4" data-testid="about-skills">
              {(data.skills || []).map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-1">
                    <span className="font-mono-label text-[10px] text-[#FAFAFA]">{skill.name}</span>
                    <span className="font-mono-label text-[10px] text-[#CCFF00]">{skill.level}%</span>
                  </div>
                  <div className="h-1 bg-[#23232C] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-[#CCFF00]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div
            variants={fadeUp}
            className="md:col-span-2 lg:col-span-3 bg-[#17171C] border border-[#333340] p-8 hover-brutalist"
          >
            <span className="font-mono-label text-[9px] text-[#A1A1AA] block mb-6">EXPERIENCE</span>
            <div className="grid md:grid-cols-3 gap-6" data-testid="about-experience">
              {(data.experience || []).map((exp, i) => (
                <div key={i} className="border-l-2 border-[#CCFF00] pl-4">
                  <p className="font-mono-label text-[9px] text-[#CCFF00] mb-1">{exp.period}</p>
                  <h4 className="text-sm font-bold text-[#FAFAFA] mb-1">{exp.role}</h4>
                  <p className="text-xs text-[#A1A1AA] mb-2">{exp.company}</p>
                  <p className="text-xs text-[#A1A1AA]/70">{exp.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
