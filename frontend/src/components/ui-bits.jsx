import React from "react";
import { motion } from "framer-motion";

export const Reveal = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay, ease: [0.25, 1, 0.5, 1] }}
        className={className}
    >
        {children}
    </motion.div>
);

export const Overline = ({ children, className = "" }) => (
    <div
        className={`font-sans text-xs sm:text-sm font-semibold tracking-[0.28em] uppercase text-bloom-sage ${className}`}
    >
        {children}
    </div>
);

export const SectionTitle = ({ eyebrow, title, subtitle, center = false }) => (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
        {eyebrow && <Overline>{eyebrow}</Overline>}
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-bloom-cocoa mt-4 leading-[1.05] tracking-tight">
            {title}
        </h2>
        {subtitle && (
            <p className="text-base sm:text-lg text-bloom-text2 mt-6 leading-relaxed">{subtitle}</p>
        )}
    </div>
);
