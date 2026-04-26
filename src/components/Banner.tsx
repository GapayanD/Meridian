import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const slides = [
  {
    id: 1,
    title: "Mid-Year Tech Gala",
    subtitle: "Upgrade your workspace with premium hardware. Up to 45% OFF with secure checkout.",
    badge: "Limited Time Offer",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1200",
    gradient: "from-[#2563EB] to-[#60A5FA]",
  },
  {
    id: 2,
    title: "Elegance Collection",
    subtitle: "Discover the new season of timeless pieces curated for modern living.",
    badge: "New Arrivals",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200",
    gradient: "from-[#1E293B] to-[#475569]",
  }
];

export const Banner: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[300px] md:h-[320px] w-full overflow-hidden rounded-2xl bg-gray-100 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 flex"
        >
          {/* Content Side */}
          <div className={cn("w-full md:w-[60%] flex flex-col justify-center px-8 md:px-16 text-white z-10 bg-gradient-to-r", slides[current].gradient)}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit mb-4"
            >
              {slides[current].badge}
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-black leading-tight mb-4 tracking-tighter"
            >
              {slides[current].title}
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base text-white/80 mb-8 max-w-sm font-medium leading-relaxed"
            >
              {slides[current].subtitle}
            </motion.p>
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-fit bg-white text-blue-600 px-8 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-xl active:scale-95"
            >
              Shop Now
            </motion.button>
          </div>

          {/* Image Side */}
          <div className="hidden md:block w-[40%] relative overflow-hidden">
            <img
              src={slides[current].image}
              className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
              alt={slides[current].title}
            />
            <div className={cn("absolute inset-y-0 left-0 w-24 bg-gradient-to-r to-transparent", slides[current].gradient)} />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 right-8 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-1.5 transition-all rounded-full",
              current === i ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  );
};
