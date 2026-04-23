import React from "react";
import { motion } from "framer-motion";

/**
 * Small SVG leaf / flower accents that float in negative space.
 * Used as decorative elements throughout the site.
 */
export const Leaf = ({ className = "", rotate = 0, delay = 0 }) => (
    <motion.svg
        viewBox="0 0 64 64"
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{ opacity: { delay, duration: 1 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
        style={{ rotate: `${rotate}deg` }}
    >
        <path
            d="M32 4 C 18 16 10 30 12 48 C 30 50 46 40 54 22 C 48 14 40 8 32 4 Z"
            fill="#8A9A86"
            opacity="0.85"
        />
        <path d="M32 8 C 28 20 26 34 28 46" stroke="#4A3A28" strokeWidth="1" fill="none" opacity="0.4" />
    </motion.svg>
);

export const Flower = ({ className = "", delay = 0 }) => (
    <motion.svg
        viewBox="0 0 64 64"
        className={className}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, rotate: [0, 6, 0] }}
        transition={{ opacity: { delay, duration: 1 }, rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
    >
        {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
                key={deg}
                cx="32"
                cy="18"
                rx="7"
                ry="12"
                fill="#D4B8B1"
                transform={`rotate(${deg} 32 32)`}
            />
        ))}
        <circle cx="32" cy="32" r="5" fill="#4A3A28" />
    </motion.svg>
);

export const Branch = ({ className = "" }) => (
    <svg viewBox="0 0 200 80" className={className}>
        <path d="M0 40 Q 60 20, 120 40 T 200 40" stroke="#4A3A28" strokeWidth="2" fill="none" />
        <ellipse cx="40" cy="30" rx="8" ry="14" fill="#8A9A86" transform="rotate(-20 40 30)" />
        <ellipse cx="80" cy="50" rx="8" ry="14" fill="#8A9A86" transform="rotate(20 80 50)" />
        <ellipse cx="140" cy="28" rx="8" ry="14" fill="#8A9A86" transform="rotate(-15 140 28)" />
        <circle cx="170" cy="40" r="6" fill="#D4B8B1" />
        <circle cx="110" cy="20" r="6" fill="#D4B8B1" />
    </svg>
);
