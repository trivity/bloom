import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Brain, GraduationCap, Heart, Sparkles, BookOpen } from "lucide-react";
import ServiceCard from "../components/ServiceCard";
import { Reveal, Overline, SectionTitle } from "../components/ui-bits";
import { Leaf, Flower, Branch } from "../components/BotanicalAccent";
import TestimonialsSection from "../components/TestimonialsSection";
import SEO from "../components/SEO";

const HERO_IMG =
    "https://images.unsplash.com/photo-1764267703828-843753961a1e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxwYXJlbnQlMjBhbmQlMjBjaGlsZCUyMGxlYXJuaW5nJTIwdG9nZXRoZXIlMjB3YXJtJTIwbGlnaHR8ZW58MHx8fHwxNzc2OTI0NTYyfDA&ixlib=rb-4.1.0&q=85";

const SERVICES = [
    {
        icon: MessageCircle,
        title: "Speech Therapy",
        description:
            "Evidence-based speech, language, and communication therapy for children and adults — from first words to confident conversation.",
        imageUrl:
            "https://images.unsplash.com/photo-1768096043738-0675e58ddbdd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxzcGVlY2glMjB0aGVyYXB5JTIwc2Vzc2lvbiUyMG5hdHVyYWwlMjBsaWdodHxlbnwwfHx8fDE3NzY5MjQ1NjJ8MA&ixlib=rb-4.1.0&q=85",
    },
    {
        icon: Brain,
        title: "Executive Functioning",
        description:
            "Organization, planning, working memory, and emotional regulation — for ages 11 to 99, including adults in independent & assisted living.",
        imageUrl:
            "https://images.pexels.com/photos/8872203/pexels-photo-8872203.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
    {
        icon: GraduationCap,
        title: "Tutoring",
        description:
            "One-on-one academic tutoring tailored to learning style and pace — reading, writing, and language skills that stick.",
        imageUrl:
            "https://images.pexels.com/photos/5234585/pexels-photo-5234585.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
    {
        icon: Heart,
        title: "Early Intervention",
        description:
            "Supporting little ones (ages 2–5) and their families through the most tender, transformative years of development.",
        imageUrl:
            "https://images.pexels.com/photos/34256524/pexels-photo-34256524.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
    {
        icon: Sparkles,
        title: "Parent Coaching",
        description:
            "We walk alongside you with strategies, scripts, and support — so the growth you see in session continues at home.",
        imageUrl:
            "https://images.unsplash.com/photo-1676116777245-1cc40079cd38?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxkaWdpdGFsJTIwcHJvZHVjdHMlMjBtb2NrdXAlMjB0YWJsZXR8ZW58MHx8fHwxNzc2OTI0NTczfDA&ixlib=rb-4.1.0&q=85",
    },
    {
        icon: BookOpen,
        title: "Therapy Materials",
        description:
            "Clinician-designed digital downloads and printable workbooks — resources we use with our own clients, now in your hands.",
        to: "/shop",
        imageUrl:
            "https://images.pexels.com/photos/5206088/pexels-photo-5206088.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
];

const Home = () => {
    return (
        <div className="relative overflow-hidden">
            <SEO
                title={null}
                description="Speech therapy, executive functioning, tutoring, and parent coaching for ages 2 to 99 — clinical depth meets transformational coaching. Let's grow, speak, and bloom together."
            />
            {/* HERO */}
            <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32" data-testid="home-hero">
                <Leaf className="absolute left-[4%] top-[14%] w-16 h-16 opacity-70 hidden md:block" rotate={-25} delay={0.3} />
                <Flower className="absolute right-[6%] top-[22%] w-14 h-14 hidden md:block" delay={0.6} />
                <Leaf className="absolute right-[3%] bottom-[10%] w-20 h-20 opacity-50 hidden lg:block" rotate={40} delay={0.9} />

                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                        >
                            <Overline>A Boutique Practice · Est. with care</Overline>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
                            className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-[88px] leading-[0.98] tracking-tight text-bloom-cocoa mt-6"
                        >
                            Let's{" "}
                            <span className="italic text-bloom-sage">grow</span>, speak,
                            <br />and bloom <span className="italic text-bloom-rose-hover">together.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.25 }}
                            className="mt-8 text-lg text-bloom-text2 max-w-xl leading-relaxed"
                        >
                            Clinical speech therapy, executive functioning coaching, tutoring, and family
                            support — thoughtfully woven together to help every person, from toddler to elder,
                            rediscover their own voice.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.35 }}
                            className="mt-10 flex flex-wrap items-center gap-4"
                        >
                            <Link
                                to="/booking"
                                data-testid="hero-cta-book"
                                className="inline-flex items-center gap-2 bg-bloom-cocoa text-white rounded-full px-8 py-4 font-sans font-medium hover:bg-bloom-cocoa-hover hover:scale-[1.03] active:scale-95 transition-all"
                            >
                                Book a Consult <ArrowRight size={18} />
                            </Link>
                            <Link
                                to="/services"
                                data-testid="hero-cta-services"
                                className="inline-flex items-center gap-2 border border-bloom-cocoa text-bloom-cocoa rounded-full px-8 py-4 font-sans font-medium hover:bg-bloom-cocoa hover:text-white transition-all"
                            >
                                Explore Services
                            </Link>
                        </motion.div>

                        <div className="mt-14 flex items-center gap-8 text-xs font-sans tracking-[0.2em] uppercase text-bloom-muted">
                            <span>Ages 2–99</span><span className="opacity-40">·</span>
                            <span>Virtual & In-Person</span><span className="opacity-40">·</span>
                            <span>Clinician-Led</span>
                        </div>
                    </div>

                    <div className="lg:col-span-5 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                            className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_30px_80px_rgba(74,58,40,0.12)]"
                        >
                            <img src={HERO_IMG} alt="Mother and child sharing a moment" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-bloom-cocoa/30 via-transparent to-transparent" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.6 }}
                            className="absolute -bottom-6 -left-6 sm:-left-12 bg-white rounded-2xl p-5 shadow-lg max-w-[220px] border border-bloom-border"
                        >
                            <Flower className="w-8 h-8 mb-2" />
                            <div className="font-serif italic text-bloom-cocoa leading-snug text-sm">
                                "Each leaf has growth, love, and support."
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* VALUES BAND */}
            <section className="border-y border-bloom-border bg-bloom-cream-muted/50">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 grid grid-cols-2 md:grid-cols-5 gap-6">
                    {["Innovative", "Empowering", "Advocating", "Connecting", "Thriving"].map((w, i) => (
                        <Reveal key={w} delay={i * 0.08} className="text-center">
                            <div className="font-serif italic text-2xl sm:text-3xl text-bloom-cocoa">{w}</div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* SERVICES */}
            <section className="py-24 sm:py-32" data-testid="home-services-section">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="grid lg:grid-cols-12 gap-10 mb-16">
                        <div className="lg:col-span-6">
                            <SectionTitle
                                eyebrow="What we offer"
                                title={<>A full circle of <em className="font-serif italic text-bloom-sage">care</em> — from first words to lifelong learning.</>}
                            />
                        </div>
                        <div className="lg:col-span-5 lg:col-start-8 flex lg:items-end">
                            <p className="text-base sm:text-lg text-bloom-text2 leading-relaxed">
                                Every service we offer blends clinical expertise with a deeply human,
                                family-centered approach. Pick where you are — we'll meet you there.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {SERVICES.map((s, i) => (
                            <ServiceCard key={s.title} {...s} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* UNIQUE BAND */}
            <section className="relative py-24 sm:py-32 bg-bloom-cocoa text-white overflow-hidden">
                <Branch className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[600px] opacity-10" />
                <div className="max-w-5xl mx-auto px-6 text-center relative">
                    <Overline className="!text-bloom-rose">What makes us different</Overline>
                    <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl mt-6 leading-[1.05] text-white">
                        We blend <em className="italic text-bloom-rose">clinical depth</em> with
                        transformational speech training — so families connect,
                        and individuals rediscover their ability to be uniquely,
                        independently successful.
                    </h2>
                    <div className="mt-10">
                        <Link
                            to="/about"
                            data-testid="home-cta-about"
                            className="inline-flex items-center gap-2 bg-white text-bloom-cocoa rounded-full px-8 py-4 font-sans font-medium hover:scale-[1.03] active:scale-95 transition-all"
                        >
                            Our Story <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* AUDIENCES */}
            <section className="py-24 sm:py-32">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <SectionTitle
                        eyebrow="Who we serve"
                        title="Three audiences. One mission."
                        subtitle="Parents, educators, and therapists — and the beautiful humans (ages 2 to 99) they champion."
                    />
                    <div className="mt-14 grid md:grid-cols-3 gap-6">
                        {[
                            { label: "Parents", body: "Strategies, encouragement, and in-home coaching so progress sticks.", img: "https://images.unsplash.com/photo-1764267703828-843753961a1e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxwYXJlbnQlMjBhbmQlMjBjaGlsZCUyMGxlYXJuaW5nJTIwdG9nZXRoZXIlMjB3YXJtJTIwbGlnaHR8ZW58MHx8fHwxNzc2OTI0NTYyfDA&ixlib=rb-4.1.0&q=85" },
                            { label: "Educators", body: "Classroom-ready materials, curriculum guidance, and collaborative consults.", img: "https://images.pexels.com/photos/5234585/pexels-photo-5234585.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
                            { label: "Therapists", body: "Clinician-designed downloads to save time and elevate your sessions.", img: "https://images.pexels.com/photos/5206088/pexels-photo-5206088.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" },
                        ].map((a, i) => (
                            <Reveal key={a.label} delay={i * 0.1}>
                                <div className="group relative aspect-[4/5] overflow-hidden rounded-[1.75rem]">
                                    <img src={a.img} alt={a.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-bloom-cocoa/80 via-bloom-cocoa/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                        <Overline className="!text-bloom-rose">For</Overline>
                                        <div className="font-serif text-3xl sm:text-4xl mt-2">{a.label}</div>
                                        <p className="mt-2 text-sm opacity-90 leading-relaxed">{a.body}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <TestimonialsSection />

            <section className="pb-24 sm:pb-32 pt-24 sm:pt-32">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="relative bg-bloom-cream-muted rounded-[2.5rem] p-10 sm:p-16 text-center overflow-hidden border border-bloom-border">
                        <Leaf className="absolute -top-6 -left-6 w-24 h-24 opacity-40" rotate={-20} />
                        <Flower className="absolute -bottom-6 -right-6 w-24 h-24" />
                        <Overline>Ready when you are</Overline>
                        <h2 className="font-serif text-4xl sm:text-5xl text-bloom-cocoa mt-6 leading-tight">
                            Begin with a free <em className="italic text-bloom-sage">15-minute</em> consult.
                        </h2>
                        <p className="mt-6 text-bloom-text2 max-w-xl mx-auto">
                            Tell us a little about who you're here for — and we'll help you find the right path forward.
                        </p>
                        <Link
                            to="/booking"
                            data-testid="footer-cta-book"
                            className="mt-10 inline-flex items-center gap-2 bg-bloom-cocoa text-white rounded-full px-8 py-4 font-sans font-medium hover:bg-bloom-cocoa-hover hover:scale-[1.03] active:scale-95 transition-all"
                        >
                            Book a Consult <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
