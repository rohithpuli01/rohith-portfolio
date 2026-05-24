import { useState } from "react";
import { motion } from "framer-motion";
import { Send, MapPin, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

export default function ContactSection({ data }) {
  const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Message sent successfully!");
        setForm({ name: "", email: "", message: "" });
      } else {
        toast.error("Failed to send message");
      }
    } catch (e) {
      toast.error("Failed to send message");
    }
    setSending(false);
  };

  return (
    <section id="contact" className="py-24 md:py-32 px-6 md:px-12 lg:px-24" data-testid="contact-section">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-4"
        >
          <span className="font-mono-label text-[10px] text-[#CCFF00]">06</span>
          <div className="h-px w-12 bg-[#CCFF00]" />
          <span className="font-mono-label text-[10px] text-[#A1A1AA]">CONTACT</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold tracking-tight mb-16"
          style={{ fontFamily: 'Unbounded' }}
        >
          Get In <span className="text-[#CCFF00]">Touch</span>
        </motion.h2>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[#A1A1AA] text-sm leading-relaxed mb-10 max-w-md">
              Have a project in mind? Let's create something amazing together. Drop me a message and I'll get back to you soon.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#17171C] border border-[#333340] flex items-center justify-center">
                  <Mail size={16} className="text-[#CCFF00]" />
                </div>
                <div>
                  <span className="font-mono-label text-[9px] text-[#A1A1AA] block">EMAIL</span>
                  <span className="text-sm text-[#FAFAFA]" data-testid="contact-email">{data?.email || "rohith@example.com"}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#17171C] border border-[#333340] flex items-center justify-center">
                  <Phone size={16} className="text-[#CCFF00]" />
                </div>
                <div>
                  <span className="font-mono-label text-[9px] text-[#A1A1AA] block">PHONE</span>
                  <span className="text-sm text-[#FAFAFA]" data-testid="contact-phone">{data?.phone || "+1 234 567 890"}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#17171C] border border-[#333340] flex items-center justify-center">
                  <MapPin size={16} className="text-[#CCFF00]" />
                </div>
                <div>
                  <span className="font-mono-label text-[9px] text-[#A1A1AA] block">LOCATION</span>
                  <span className="text-sm text-[#FAFAFA]" data-testid="contact-location">{data?.location || "New York, USA"}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form - Brutalist style */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-4"
            data-testid="contact-form"
          >
            <div>
              <label className="font-mono-label text-[9px] text-[#A1A1AA] block mb-2">YOUR NAME</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#17171C] border border-[#333340] text-[#FAFAFA] px-4 py-3 text-sm focus:border-[#CCFF00] focus:outline-none transition-colors placeholder:text-[#A1A1AA]/40"
                placeholder="John Doe"
                data-testid="contact-name-input"
              />
            </div>
            <div>
              <label className="font-mono-label text-[9px] text-[#A1A1AA] block mb-2">YOUR EMAIL</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#17171C] border border-[#333340] text-[#FAFAFA] px-4 py-3 text-sm focus:border-[#CCFF00] focus:outline-none transition-colors placeholder:text-[#A1A1AA]/40"
                placeholder="john@example.com"
                data-testid="contact-email-input"
              />
            </div>
            <div>
              <label className="font-mono-label text-[9px] text-[#A1A1AA] block mb-2">MESSAGE</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-[#17171C] border border-[#333340] text-[#FAFAFA] px-4 py-3 text-sm focus:border-[#CCFF00] focus:outline-none transition-colors resize-none placeholder:text-[#A1A1AA]/40"
                placeholder="Tell me about your project..."
                data-testid="contact-message-input"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-[#CCFF00] text-[#0B0B0D] font-mono-label text-[11px] px-6 py-4 hover:bg-[#AADD00] disabled:opacity-50 transition-all hover-brutalist flex items-center justify-center gap-2"
              data-testid="contact-submit-btn"
            >
              <Send size={14} />
              {sending ? "SENDING..." : "SEND MESSAGE"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
