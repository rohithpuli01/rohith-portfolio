import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, MessageSquare, Quote } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({ name: "", company: "", rating: 0, comment: "" });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch(`${API}/feedback`)
      .then((r) => r.json())
      .then(setFeedbacks)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.comment || !form.rating) {
      toast.error("Please fill in name, rating and comment");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 429) {
        toast.error("Too many submissions. Please try again later.");
        setSending(false);
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setFeedbacks([{ ...form, feedback_id: json.feedback_id, created_at: new Date().toISOString() }, ...feedbacks]);
        setForm({ name: "", company: "", rating: 0, comment: "" });
        setShowForm(false);
        toast.success("Thank you for your feedback!");
      } else {
        toast.error("Failed to submit feedback");
      }
    } catch {
      toast.error("Failed to submit feedback");
    }
    setSending(false);
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : "0.0";

  return (
    <section id="feedback" className="py-24 md:py-32 px-6 md:px-12 lg:px-24" data-testid="feedback-section">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-4"
        >
          <span className="font-mono-label text-[10px] text-[#CCFF00]">07</span>
          <div className="h-px w-12 bg-[#CCFF00]" />
          <span className="font-mono-label text-[10px] text-[#A1A1AA]">FEEDBACK</span>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold tracking-tight"
              style={{ fontFamily: "Unbounded" }}
            >
              Client <span className="text-[#CCFF00]">Reviews</span>
            </motion.h2>
            {feedbacks.length > 0 && (
              <div className="flex items-center gap-3 mt-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      className={s <= Math.round(Number(avgRating)) ? "text-[#CCFF00] fill-[#CCFF00]" : "text-[#333340]"}
                    />
                  ))}
                </div>
                <span className="font-mono-label text-xs text-[#CCFF00]">{avgRating}</span>
                <span className="text-xs text-[#A1A1AA]">({feedbacks.length} reviews)</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 md:mt-0 bg-[#CCFF00] text-[#0B0B0D] font-mono-label text-[11px] px-6 py-3 hover:bg-[#AADD00] transition-colors hover-brutalist flex items-center gap-2"
            data-testid="feedback-write-btn"
          >
            <MessageSquare size={14} />
            {showForm ? "CLOSE" : "WRITE A REVIEW"}
          </button>
        </div>

        {/* Feedback Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="bg-[#17171C] border border-[#333340] p-6 md:p-8 mb-12 overflow-hidden"
              data-testid="feedback-form"
            >
              <h3 className="text-lg font-bold mb-6" style={{ fontFamily: "Unbounded" }}>
                Leave Your <span className="text-[#CCFF00]">Review</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="font-mono-label text-[9px] text-[#A1A1AA] block mb-2">YOUR NAME *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#0B0B0D] border border-[#333340] text-[#FAFAFA] px-4 py-3 text-sm focus:border-[#CCFF00] focus:outline-none transition-colors placeholder:text-[#A1A1AA]/40"
                    placeholder="John Doe"
                    data-testid="feedback-name-input"
                  />
                </div>
                <div>
                  <label className="font-mono-label text-[9px] text-[#A1A1AA] block mb-2">COMPANY (OPTIONAL)</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full bg-[#0B0B0D] border border-[#333340] text-[#FAFAFA] px-4 py-3 text-sm focus:border-[#CCFF00] focus:outline-none transition-colors placeholder:text-[#A1A1AA]/40"
                    placeholder="Company Inc."
                    data-testid="feedback-company-input"
                  />
                </div>
              </div>

              {/* Star Rating */}
              <div className="mb-4">
                <label className="font-mono-label text-[9px] text-[#A1A1AA] block mb-2">RATING *</label>
                <div className="flex gap-1" data-testid="feedback-rating-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoveredStar(s)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setForm({ ...form, rating: s })}
                      className="p-1 transition-transform hover:scale-110"
                      data-testid={`feedback-star-${s}`}
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${
                          s <= (hoveredStar || form.rating)
                            ? "text-[#CCFF00] fill-[#CCFF00]"
                            : "text-[#333340]"
                        }`}
                      />
                    </button>
                  ))}
                  {form.rating > 0 && (
                    <span className="font-mono-label text-xs text-[#CCFF00] ml-3 self-center">
                      {form.rating}/5
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="font-mono-label text-[9px] text-[#A1A1AA] block mb-2">YOUR REVIEW *</label>
                <textarea
                  rows={4}
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  className="w-full bg-[#0B0B0D] border border-[#333340] text-[#FAFAFA] px-4 py-3 text-sm focus:border-[#CCFF00] focus:outline-none transition-colors resize-none placeholder:text-[#A1A1AA]/40"
                  placeholder="Tell others about your experience working with me..."
                  data-testid="feedback-comment-input"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="bg-[#CCFF00] text-[#0B0B0D] font-mono-label text-[11px] px-8 py-3 hover:bg-[#AADD00] disabled:opacity-50 transition-all hover-brutalist flex items-center gap-2"
                data-testid="feedback-submit-btn"
              >
                <Send size={14} />
                {sending ? "SUBMITTING..." : "SUBMIT REVIEW"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Feedback Cards */}
        {feedbacks.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#333340]">
            <MessageSquare size={40} className="text-[#333340] mx-auto mb-4" />
            <p className="text-[#A1A1AA] text-sm">No reviews yet. Be the first to leave a review!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="feedback-list">
            {feedbacks.map((fb, i) => (
              <motion.div
                key={fb.feedback_id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-[#17171C] border border-[#333340] p-6 hover-brutalist relative"
                data-testid={`feedback-card-${i}`}
              >
                <Quote size={24} className="text-[#CCFF00]/20 absolute top-4 right-4" />

                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={s <= fb.rating ? "text-[#CCFF00] fill-[#CCFF00]" : "text-[#333340]"}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4 line-clamp-4">
                  "{fb.comment}"
                </p>

                {/* Author */}
                <div className="border-t border-[#333340] pt-4">
                  <p className="text-sm font-semibold text-[#FAFAFA]">{fb.name}</p>
                  {fb.company && (
                    <p className="font-mono-label text-[9px] text-[#A1A1AA] mt-0.5">{fb.company}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
