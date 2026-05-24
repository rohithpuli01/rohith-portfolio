import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Gift, RotateCcw } from "lucide-react";

export default function LuckyWheel({ data }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
  const segments = data?.segments || [
    { label: "10% OFF", color: "#CCFF00" },
    { label: "15% OFF", color: "#23232C" },
    { label: "5% OFF", color: "#CCFF00" },
    { label: "20% OFF", color: "#23232C" },
    { label: "FREE CONSULT", color: "#CCFF00" },
    { label: "25% OFF", color: "#23232C" },
    { label: "LUCKY DIP", color: "#CCFF00" },
    { label: "30% OFF", color: "#23232C" },
  ];

  const numSegments = segments.length;
  const segmentAngle = 360 / numSegments;

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    try {
      const res = await fetch(`${API}/wheel/spin`, { method: "POST" });
      const json = await res.json();
      const winIndex = json.index;

      // Calculate rotation: multiple full spins + land on winner
      const targetAngle = 360 - (winIndex * segmentAngle + segmentAngle / 2);
      const newRotation = rotation + 1440 + targetAngle;
      setRotation(newRotation);

      setTimeout(() => {
        setResult(json.result);
        setSpinning(false);
      }, 4000);
    } catch (e) {
      console.error(e);
      setSpinning(false);
    }
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

      return (
        <g key={i}>
          <path d={path} fill={seg.color} stroke="#0B0B0D" strokeWidth="2" />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${midAngle}, ${textX}, ${textY})`}
            className="font-mono-label"
            style={{
              fontSize: "9px",
              fill: seg.color === "#CCFF00" ? "#0B0B0D" : "#FAFAFA",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
            }}
          >
            {seg.label}
          </text>
        </g>
      );
    });
  };

  return (
    <section id="wheel" className="py-24 md:py-32 px-6 md:px-12 lg:px-24" data-testid="wheel-section">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-4"
        >
          <span className="font-mono-label text-[10px] text-[#CCFF00]">05</span>
          <div className="h-px w-12 bg-[#CCFF00]" />
          <span className="font-mono-label text-[10px] text-[#A1A1AA]">SPIN & WIN</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
          style={{ fontFamily: 'Unbounded' }}
        >
          Lucky <span className="text-[#CCFF00]">Wheel</span>
        </motion.h2>
        <p className="text-[#A1A1AA] text-sm mb-16 max-w-md">
          Feeling lucky? Spin the wheel to win exclusive discounts on my design services!
        </p>

        <div className="flex flex-col items-center">
          {/* Wheel */}
          <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
            {/* Neon border glow */}
            <div className="absolute inset-0 rounded-full neon-glow" />

            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-[#CCFF00]" style={{ filter: "drop-shadow(0 0 8px rgba(204,255,0,0.5))" }} />
            </div>

            {/* SVG Wheel */}
            <svg
              ref={wheelRef}
              viewBox="0 0 400 400"
              className="w-full h-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              }}
            >
              {/* Outer ring */}
              <circle cx="200" cy="200" r="195" fill="none" stroke="#333340" strokeWidth="2" />
              <circle cx="200" cy="200" r="185" fill="none" stroke="#CCFF00" strokeWidth="1" opacity="0.3" />
              {createWheelSegments()}
              {/* Center */}
              <circle cx="200" cy="200" r="30" fill="#0B0B0D" stroke="#CCFF00" strokeWidth="2" />
            </svg>

            {/* Spin button */}
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#CCFF00] text-[#0B0B0D] font-mono-label text-[10px] font-bold hover:bg-[#AADD00] disabled:opacity-50 transition-all z-10 flex items-center justify-center"
              data-testid="wheel-spin-btn"
            >
              {spinning ? <RotateCcw size={18} className="animate-spin" /> : "SPIN"}
            </button>
          </div>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="mt-10 bg-[#17171C] border-2 border-[#CCFF00] p-8 text-center neon-glow"
              data-testid="wheel-result"
            >
              <Gift size={32} className="text-[#CCFF00] mx-auto mb-3" />
              <p className="font-mono-label text-[10px] text-[#A1A1AA] mb-2">CONGRATULATIONS! YOU WON</p>
              <p className="text-3xl font-bold text-[#CCFF00] neon-text-glow" style={{ fontFamily: 'Unbounded' }}>
                {result}
              </p>
              <p className="text-xs text-[#A1A1AA] mt-3">Contact me to redeem your discount!</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
