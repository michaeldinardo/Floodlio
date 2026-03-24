'use client'
import { useScroll, useTransform, motion } from 'framer-motion'

export default function BeerPour() {
  const { scrollYProgress } = useScroll()

  const fillHeight = useTransform(scrollYProgress, [0, 0.65], ['0%', '86%'])
  const foamOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1])
  const streamHeight = useTransform(scrollYProgress, [0, 0.55], [0, 60])
  const streamOpacity = useTransform(scrollYProgress, [0, 0.1, 0.55, 0.65], [0, 1, 1, 0])

  return (
    <div className="relative mx-auto select-none" style={{ width: 160, height: 240 }}>

      {/* Pouring stream from above */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: -8,
          width: 6,
          height: streamHeight,
          opacity: streamOpacity,
          background: 'linear-gradient(to bottom, transparent, #D4AF37cc)',
          borderRadius: 4,
        }}
      />

      {/* Glass body — clip-path for pint glass shape (wider at top) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: 'polygon(14% 0%, 86% 0%, 92% 100%, 8% 100%)' }}
      >
        {/* Beer fill rising from bottom */}
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: fillHeight }}
        >
          {/* Foam layer */}
          <motion.div
            className="absolute top-0 left-0 right-0"
            style={{ height: 18, opacity: foamOpacity, background: 'rgba(255,255,255,0.92)', borderRadius: '50% 50% 0 0' }}
          />
          {/* Beer body */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              top: 10,
              background: 'linear-gradient(to right, #C9A227cc, #D4AF37bb, #F5CC50cc, #D4AF37bb, #C9A227cc)',
            }}
          />
        </motion.div>
      </div>

      {/* Glass outline SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 240" fill="none">
        {/* Glass walls */}
        <path
          d="M22 3 H138 L147 237 H13 Z"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.45"
        />
        {/* Left shine */}
        <path
          d="M38 12 L28 224"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.18"
        />
        {/* Right shine */}
        <path
          d="M115 12 L125 224"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.08"
        />
      </svg>
    </div>
  )
}
