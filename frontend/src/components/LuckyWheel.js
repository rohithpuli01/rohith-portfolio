import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Gift, RotateCcw, Send, Check } from "lucide-react";
import { toast } from "sonner";

export default function LuckyWheel({ data }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [spinId, setSpinId] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [claimName, setClaimName] = useState("");
  const [claimed, setClaimed] = useState(false);
  const wheelRef = useRef(null);
  const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

  const segments = data?.segments || [];
  const numSegments = segments.length;
  const segmentAngle = 360 / numSegments;

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    setSpinId(null);
    setClaimed(false);
    setClaimName("");
    try {
      const res = await fetch(`${API}/wheel/spin`, { method: "POST" });
      if (res.status === 429) { toast.error("Too many spins. Try again later."); setSpinning(false); return; }
      const json = await res.json();
      const winIndex = json.index;
      const targetAngle = 360 - (winIndex * segmentAngle + segmentAngle / 2);
      const newRotation = rotation + 1440 + targetAngle;
      setRotation(newRotation);
      setTimeout(() => { setResult(json.result); setSpinId(json.spin_id); setSpinning(false); }, 4000);
    } catch (e) { console.error(e); setSpinning(false); }
  };

  const handleClaim = async () => {
    if (!claimName.trim() || !spinId) return;
    try {
      await fetch(`${API}/wheel/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spin_id: spinId, name: claimName.trim() }),
      });
      setClaimed(true);
      toast.success("Discount claimed! We'll be in touch.");
    } catch { toast.error("Failed to claim"); }
  };

  const createWheelSegments = () => {
    return segments.map((seg, i) => {
      const startAngle = i * segmentAngle;
      const endAngle = startAngle + segmentAngle;
      const startRad = (Math.PI / 180) * (startAngle - 90);
      const endRad = (Math.PI / 180) * (endAngle - 90);
      const x1 = 200 + 180 * Math.cos(startRad);
      const y1 = 200 + 180 * Math.sin(startRad);
      const x2 = 200 + 180 * Math.cos(endRad);
      const y2 = 200 + 180 * Math.sin(endRad);
      const largeArc = segmentAngle > 180 ? 1 : 0;
      const path = `M200,200 L${x1},${y1} A180,180 0 ${largeArc},1 ${x2},${y2} Z`;
      const midAngle = (startAngle + endAngle) / 2;
      const midRad = (Math.PI / 180) * (midAngle - 90);
      const textX = 200 + 120 * Math.cos(midRad);
      const textY = 200 + 120 * Math.sin(midRad);
      const isDark = seg.color === "#4A7A12" || seg.color === "#23232C" || seg.color.toLowerCase() === "#000000";
      return (
        <g key={i}>
          <path d={path} fill={seg.color} stroke="#D4CBB8" strokeWidth="1.5" />
          <text x={textX} y={textY} textAnchor="middle" dominantBaseline="middle"
            transform={`rotate(${midAngle}, ${textX}, ${textY})`}
            style={{ fontSize: "9px", fill: isDark ? "#FFFFFF" : "#1A1A1A", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
            {seg.label}
          </text>
        </g>
      );
    });
  };

  return (
    <section id="wheel" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 paper-texture" data-testid="wheel-section">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-4 mb-4">
          <span className="font-mono-label text-[10px] text-[#4A7A12]">05</span>
          <div className="h-px w-12 bg-[#4A7A12]" />
          <span className="font-mono-label text-[10px] text-[#6B7280]">SPIN & WIN</span>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#1A1A1A]" style={{ fontFamily: 'Unbounded' }}>
          {data?.heading || "Lucky"} <span className="text-[#4A7A12]">{data?.heading_accent || "Wheel"}</span>
        </motion.h2>
        <p className="text-[#6B7280] text-sm mb-16 max-w-md" data-testid="wheel-subtitle">
          {data?.subtitle || "Feeling lucky? Spin the wheel to win exclusive discounts on my design services!"}
        </p>

        <div className="flex flex-col items-center">
          <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
            <div className="absolute inset-0 rounded-full shadow-lg" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-[#4A7A12]" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
            </div>
            <svg ref={wheelRef} viewBox="0 0 400 400" className="w-full h-full"
              style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none" }}>
              <circle cx="200" cy="200" r="195" fill="none" stroke="#D4CBB8" strokeWidth="2" />
              {createWheelSegments()}
              <circle cx="200" cy="200" r="30" fill="#F5F0E8" stroke="#4A7A12" strokeWidth="2" />
            </svg>
            <button onClick={handleSpin} disabled={spinning}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#4A7A12] text-white font-mono-label text-[10px] font-bold hover:bg-[#3D6B0F] disabled:opacity-50 transition-all z-10 flex items-center justify-center shadow-md"
              data-testid="wheel-spin-btn">
              {spinning ? <RotateCcw size={18} className="animate-spin" /> : "SPIN"}
            </button>
          </div>

          {!result && (
            <button onClick={handleSpin} disabled={spinning}
              className="mt-8 bg-[#4A7A12] text-white font-mono-label text-[11px] px-8 py-3 hover:bg-[#3D6B0F] disabled:opacity-50 transition-all hover-paper shadow-md"
              data-testid="wheel-spin-external-btn">
              {spinning ? "SPINNING..." : "SPIN THE WHEEL"}
            </button>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-10 bg-white border-2 border-[#4A7A12] p-8 text-center shadow-lg w-full max-w-sm" data-testid="wheel-result">
              <Gift size={32} className="text-[#4A7A12] mx-auto mb-3" />
              <p className="font-mono-label text-[10px] text-[#6B7280] mb-2">CONGRATULATIONS! YOU WON</p>
              <p className="text-3xl font-bold text-[#4A7A12] mb-4" style={{ fontFamily: 'Unbounded' }}>{result}</p>

              {!claimed ? (
                <div className="border-t border-[#D4CBB8] pt-4 mt-4">
                  <p className="text-xs text-[#6B7280] mb-3">Enter your name to claim this discount!</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={claimName}
                      onChange={(e) => setClaimName(e.target.value)}
                      placeholder="Your name"
                      className="flex-1 bg-[#F5F0E8] border border-[#D4CBB8] text-[#1A1A1A] px-3 py-2 text-sm focus:border-[#4A7A12] focus:outline-none"
                      data-testid="wheel-claim-name"
                      onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                    />
                    <button
                      onClick={handleClaim}
                      disabled={!claimName.trim()}
                      className="bg-[#4A7A12] text-white font-mono-label text-[10px] px-4 py-2 hover:bg-[#3D6B0F] disabled:opacity-50 transition-colors flex items-center gap-1"
                      data-testid="wheel-claim-btn"
                    >
                      <Send size={12} /> CLAIM
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-[#D4CBB8] pt-4 mt-4">
                  <div className="flex items-center justify-center gap-2 text-[#4A7A12]">
                    <Check size={16} />
                    <span className="font-mono-label text-[10px]">CLAIMED BY {claimName.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-2">Contact me to redeem your discount!</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
