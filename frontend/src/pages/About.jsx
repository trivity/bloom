import React from "react";
import { Reveal, Overline, SectionTitle } from "../components/ui-bits";
import { Leaf, Flower, Branch } from "../components/BotanicalAccent";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const VALUES = [
    { title: "Innovative", body: "We weave fresh, evidence-based practice into every session." },
    { title: "Empowering", body: "We equip clients and families with tools they own for life." },
    { title: "Advocating", body: "We speak up for every voice at the table." },
    { title: "Connecting", body: "We bridge the clinical and the deeply personal." },
    { title: "Thriving", body: "We plant growth that keeps blooming after we leave the room." },
];

const About = () => {
    return (
        <div className="relative overflow-hidden">
            {/* HERO */}
            <section className="pt-20 pb-20 sm:pt-28 sm:pb-28 relative" data-testid="about-hero">
                <Leaf className="absolute left-[5%] top-[18%] w-14 h-14 opacity-60 hidden md:block" rotate={-30} />
                <Flower className="absolute right-[6%] top-[30%] w-12 h-12 hidden md:block" delay={0.4} />

                <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
                    <Overline>Our Story</Overline>
                    <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl mt-6 leading-[1.03] tracking-tight text-bloom-cocoa">
                        Rooted in clinical <em className="italic text-bloom-sage">care</em>.
                        <br />Grown with <em className="italic text-bloom-rose-hover">heart</em>.
                    </h1>
                    <p className="mt-8 text-lg text-bloom-text2 max-w-2xl mx-auto leading-relaxed">
                        The Blooming Branch Team is a small, senior-led practice that believes every
                        person — from a two-year-old finding their first word to a ninety-year-old
                        holding onto theirs — deserves a space to grow, speak, and bloom.
                    </p>
                </div>
            </section>

            {/* IMAGE BAND */}
            <section className="relative">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid md:grid-cols-12 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9 }}
                        className="md:col-span-7 aspect-[4/3] rounded-[2rem] overflow-hidden"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1768096043738-0675e58ddbdd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxzcGVlY2glMjB0aGVyYXB5JTIwc2Vzc2lvbiUyMG5hdHVyYWwlMjBsaWdodHxlbnwwfHx8fDE3NzY5MjQ1NjJ8MA&ixlib=rb-4.1.0&q=85"
                            alt="Therapy session"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.15 }}
                        className="md:col-span-5 aspect-[4/3] rounded-[2rem] overflow-hidden mt-8 md:mt-20"
                    >
                        <img
                            src="https://images.pexels.com/photos/5234585/pexels-photo-5234585.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                            alt="Coaching session"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </div>
            </section>

            {/* WHAT MAKES US UNIQUE */}
            <section className="py-24 sm:py-32">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-5">
                        <SectionTitle
                            eyebrow="Why we exist"
                            title={<>Clinical depth.<br />Transformational craft.</>}
                        />
                    </div>
                    <div className="lg:col-span-6 lg:col-start-7 space-y-6 text-base sm:text-lg text-bloom-text2 leading-relaxed">
                        <p>
                            Most practices choose a lane — evidence-based clinical work, or warm,
                            transformational coaching. We refused to choose. Our work braids both.
                        </p>
                        <p>
                            We sit with families at the kitchen table and in the therapy room. We study
                            the latest research and trust the wisdom of a grandmother who's been
                            watching her grandson grow for eighteen years. We are clinicians, first —
                            and storytellers, advocates, and fellow travelers, too.
                        </p>
                        <p className="font-serif italic text-2xl text-bloom-cocoa">
                            "Each leaf has growth, love, and support."
                        </p>
                    </div>
                </div>
            </section>

            {/* VALUES */}
            <section className="bg-bloom-cream-muted py-24 sm:py-32 border-y border-bloom-border">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="max-w-2xl">
                        <Overline>Our values</Overline>
                        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl mt-4 text-bloom-cocoa leading-[1.05] tracking-tight">
                            Five words we live by.
                        </h2>
                    </div>
                    <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {VALUES.map((v, i) => (
                            <Reveal key={v.title} delay={i * 0.08}>
                                <div className="h-full bg-white rounded-[1.5rem] p-8 border border-bloom-border">
                                    <div className="text-5xl font-serif italic text-bloom-sage leading-none">
                                        0{i + 1}
                                    </div>
                                    <h3 className="font-serif text-2xl text-bloom-cocoa mt-6">{v.title}</h3>
                                    <p className="text-sm text-bloom-text2 mt-3 leading-relaxed">{v.body}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* AGES BAND */}
            <section className="py-24 sm:py-32">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <Branch className="w-80 mx-auto mb-8" />
                    <Overline>Every age. Every stage.</Overline>
                    <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl mt-6 text-bloom-cocoa leading-[1.05]">
                        From the first <em className="italic text-bloom-sage">word</em> to the last
                        chapter — <em className="italic text-bloom-rose-hover">we're here.</em>
                    </h2>
                    <p className="mt-8 text-lg text-bloom-text2 max-w-2xl mx-auto leading-relaxed">
                        We work with children (2–18), teens with executive functioning needs, and
                        adults up to 99 — including residents of nursing homes, assisted, and
                        independent living communities.
                    </p>
                    <Link
                        to="/booking"
                        data-testid="about-cta-book"
                        className="mt-10 inline-flex items-center gap-2 bg-bloom-cocoa text-white rounded-full px-8 py-4 font-sans font-medium hover:bg-bloom-cocoa-hover hover:scale-[1.03] active:scale-95 transition-all"
                    >
                        Start the conversation
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default About;
