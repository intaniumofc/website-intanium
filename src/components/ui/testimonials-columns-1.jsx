import React from "react";
import { motion } from "framer-motion";

export const TestimonialsColumn = ({ className, testimonials, duration = 10 }) => {
  return (
    <div className={className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {testimonials.map(({ text, image, name, role }, i) => (
                <div 
                  className="p-8 rounded-3xl border border-[var(--border-color)] bg-white/70 backdrop-blur-md shadow-lg shadow-[var(--color-primary)]/5 max-w-xs w-full select-none hover:border-[var(--color-primary)] transition-all duration-300 group" 
                  key={i}
                >
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium italic">
                    "{text}"
                  </div>
                  <div className="flex items-center gap-3 mt-5">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-slate-100 group-hover:border-[var(--color-primary)] transition-colors duration-300"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="font-extrabold text-xs sm:text-sm tracking-tight leading-none text-slate-800 truncate">
                        {name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider leading-relaxed truncate mt-0.5">
                        {role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};
