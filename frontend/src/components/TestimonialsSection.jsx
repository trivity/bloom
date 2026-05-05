import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { Overline, Reveal } from "./ui-bits";
import { Quote } from "lucide-react";

const TestimonialsSection = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        api.get("/testimonials").then((r) => setItems(r.data)).catch(() => setItems([]));
    }, []);

    if (items.length === 0) return null;

    return (
        <section className="py-24 sm:py-32 bg-bloom-cream-muted border-y border-bloom-border" data-testid="testimonials-section">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-10 mb-14">
                    <div className="lg:col-span-6">
                        <Overline>What families are saying</Overline>
                        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl mt-4 text-bloom-cocoa leading-[1.05] tracking-tight">
                            Stories that <em className="italic text-bloom-sage">root</em> us.
                        </h2>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {items.slice(0, 6).map((t, i) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.25, 1, 0.5, 1] }}
                            data-testid={`testimonial-${t.id}`}
                            className="relative bg-white rounded-[1.75rem] border border-bloom-border p-8 sm:p-10 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(74,58,40,0.06)]"
                        >
                            <Quote size={28} className="text-bloom-sage opacity-60" strokeWidth={1.5} />
                            <p className="mt-5 font-serif text-xl sm:text-2xl text-bloom-cocoa leading-snug italic">
                                "{t.quote}"
                            </p>
                            <div className="mt-8 pt-6 border-t border-bloom-border flex items-center gap-4">
                                {t.image_url ? (
                                    <img src={t.image_url} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-bloom-cream flex items-center justify-center font-serif text-bloom-sage text-lg">
                                        {t.name?.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <div className="font-sans font-semibold text-bloom-cocoa text-sm">{t.name}</div>
                                    {t.role && <div className="text-xs text-bloom-text2">{t.role}</div>}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
