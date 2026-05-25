import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, MessageSquare, Quote } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function FeedbackSection({ contentData }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({ name: "", company: "", rating: 0, comment: "" });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch(`${API}/feedback`).then((r) => r.json()).then(setFeedbacks).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.comment || !form.rating) { toast.error("Please fill in name, rating and comment"); return; }
    setSending(true);
    try {
      const res = await fetch(`${API}/feedback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.status === 429) { toast.error("Too many submissions. Please try again later."); setSending(false); return; }
      if (res.ok) {
        const json = await res.json();
        setFeedbacks([{ ...form, feedback_id: json.feedback_id, created_at: new Date().toISOString() }, ...feedbacks]);
        setForm({ name: "", company: "", rating: 0, comment: "" });
        setShowForm(false);
        toast.success("Thank you for your feedback!");
      } else { toast.error("Failed to submit feedback"); }
    } catch { toast.error("Failed to submit feedback"); }
    setSending(false);
  };

  const avgRating = feedbacks.length ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1) : "0.0";

  return (
    <section id="feedback" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 paper-texture" data-testid="feedback-section">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-4 mb-4">
          <span className="font-mono-label text-[10px] text-[#4A7A12]">07</span>
          <div className="h-px w-12 bg-[#4A7A12]" />
          <span className="font-mono-label text-[10px] text-[#6B7280]">FEEDBACK</span>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold tracking-tight text-[#1A1A1A]" style={{ fontFamily: "Unbounded" }}>
              {contentData?.heading || "Client"} <span className="text-[#4A7A12]">{contentData?.heading_accent || "Reviews"}</span>
            </motion.h2>
            {feedbacks.length > 0 && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex">{[1,2,3,4,5].map((s) => (<Star key={s} size={16} className={s <= Math.round(Number(avgRating)) ? "text-[#4A7A12] fill-[#4A7A12]" : "text-[#D4CBB8]"} />))}</div>
                <span className="font-mono-label text-xs text-[#4A7A12]">{avgRating}</span>
                <span className="text-xs text-[#6B7280]">({feedbacks.length} reviews)</span>
              </div>
            )}
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="mt-4 md:mt-0 bg-[#4A7A12] text-white font-mono-label text-[11px] px-6 py-3 hover:bg-[#3D6B0F] transition-colors hover-paper flex items-center gap-2 shadow-sm"
            data-testid="feedback-write-btn">
            <MessageSquare size={14} />{showForm ? "CLOSE" : (contentData?.cta_text || "WRITE A REVIEW")}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit} className="bg-white border border-[#D4CBB8] p-6 md:p-8 mb-12 overflow-hidden shadow-sm" data-testid="feedback-form">
              <h3 className="text-lg font-bold mb-6 text-[#1A1A1A]" style={{ fontFamily: "Unbounded" }}>Leave Your <span className="text-[#4A7A12]">Review</span></h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="font-mono-label text-[9px] text-[#6B7280] block mb-2">YOUR NAME *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#F5F0E8] border border-[#D4CBB8] text-[#1A1A1A] px-4 py-3 text-sm focus:border-[#4A7A12] focus:outline-none placeholder:text-[#6B7280]/40"
                    placeholder="John Doe" data-testid="feedback-name-input" />
                </div>
                <div>
                  <label className="font-mono-label text-[9px] text-[#6B7280] block mb-2">COMPANY (OPTIONAL)</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full bg-[#F5F0E8] border border-[#D4CBB8] text-[#1A1A1A] px-4 py-3 text-sm focus:border-[#4A7A12] focus:outline-none placeholder:text-[#6B7280]/40"
                    placeholder="Company Inc." data-testid="feedback-company-input" />
                </div>
              </div>
              <div className="mb-4">
                <label className="font-mono-label text-[9px] text-[#6B7280] block mb-2">RATING *</label>
                <div className="flex gap-1" data-testid="feedback-rating-stars">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button" onMouseEnter={() => setHoveredStar(s)} onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setForm({ ...form, rating: s })} className="p-1 transition-transform hover:scale-110" data-testid={`feedback-star-${s}`}>
                      <Star size={28} className={`transition-colors ${s <= (hoveredStar || form.rating) ? "text-[#4A7A12] fill-[#4A7A12]" : "text-[#D4CBB8]"}`} />
                    </button>
                  ))}
                  {form.rating > 0 && <span className="font-mono-label text-xs text-[#4A7A12] ml-3 self-center">{form.rating}/5</span>}
                </div>
              </div>
              <div className="mb-4">
                <label className="font-mono-label text-[9px] text-[#6B7280] block mb-2">YOUR REVIEW *</label>
                <textarea rows={4} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  className="w-full bg-[#F5F0E8] border border-[#D4CBB8] text-[#1A1A1A] px-4 py-3 text-sm focus:border-[#4A7A12] focus:outline-none resize-none placeholder:text-[#6B7280]/40"
                  placeholder="Tell others about your experience..." data-testid="feedback-comment-input" />
              </div>
              <button type="submit" disabled={sending}
                className="bg-[#4A7A12] text-white font-mono-label text-[11px] px-8 py-3 hover:bg-[#3D6B0F] disabled:opacity-50 transition-all hover-paper flex items-center gap-2 shadow-sm"
                data-testid="feedback-submit-btn">
                <Send size={14} />{sending ? "SUBMITTING..." : "SUBMIT REVIEW"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {feedbacks.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#D4CBB8] bg-white/50">
            <MessageSquare size={40} className="text-[#D4CBB8] mx-auto mb-4" />
            <p className="text-[#6B7280] text-sm">No reviews yet. Be the first to leave a review!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="feedback-list">
            {feedbacks.map((fb, i) => (
              <motion.div key={fb.feedback_id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }} className="bg-white border border-[#D4CBB8] p-6 hover-paper shadow-sm relative paper-fold" data-testid={`feedback-card-${i}`}>
                <Quote size={24} className="text-[#4A7A12]/10 absolute top-4 right-4" />
                <div className="flex gap-0.5 mb-4">{[1,2,3,4,5].map((s) => (<Star key={s} size={14} className={s <= fb.rating ? "text-[#4A7A12] fill-[#4A7A12]" : "text-[#D4CBB8]"} />))}</div>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-4 line-clamp-4">"{fb.comment}"</p>
                <div className="border-t border-[#D4CBB8] pt-4">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{fb.name}</p>
                  {fb.company && <p className="font-mono-label text-[9px] text-[#6B7280] mt-0.5">{fb.company}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
