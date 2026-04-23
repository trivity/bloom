import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Brain, GraduationCap, Heart, Sparkles, BookOpen, Users } from "lucide-react";
import { Reveal, Overline, SectionTitle } from "../components/ui-bits";
import { Leaf } from "../components/BotanicalAccent";

const SERVICES = [
    {
        icon: MessageCircle,
        title: "Speech Therapy",
        summary: "Evidence-based support for speech sound production, language development, fluency, and social communication — for children and adults.",
        bullets: ["Articulation & phonology", "Receptive & expressive language", "Fluency (stuttering) & voice", "Social communication / pragmatics"],
        img: "https://images.unsplash.com/photo-1768096043738-0675e58ddbdd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxzcGVlY2glMjB0aGVyYXB5JTIwc2Vzc2lvbiUyMG5hdHVyYWwlMjBsaWdodHxlbnwwfHx8fDE3NzY5MjQ1NjJ8MA&ixlib=rb-4.1.0&q=85",
    },
    {
        icon: Brain,
        title: "Executive Functioning",
        summary: "Ages 11–99. Build lifelong skills for planning, focus, organization, time, and emotional regulation — at any stage of life.",
        bullets: ["Time management & planning", "Working memory strategies", "Task initiation & follow-through", "Emotional self-regulation"],
        img: "https://images.pexels.com/photos/8872203/pexels-photo-8872203.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
    {
        icon: GraduationCap,
        title: "Tutoring",
        summary: "Learning-style-first tutoring in reading, writing, and language — weaving clinical insight into every session.",
        bullets: ["Reading fluency & comprehension", "Writing & language", "Homework support", "Study-skill coaching"],
        img: "https://images.pexels.com/photos/5234585/pexels-photo-5234585.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
    {
        icon: Heart,
        title: "Early Intervention",
        summary: "For toddlers and preschoolers (2–5) and their families — gentle, play-based support for those first tender years.",
        bullets: ["Late-talker support", "Play-based language", "Parent–child interaction", "Feeding & oral-motor screening"],
        img: "https://images.pexels.com/photos/34256524/pexels-photo-34256524.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
    {
        icon: Sparkles,
        title: "Parent Coaching",
        summary: "Your child's biggest teacher is you. We give you scripts, strategies, and confidence to carry therapy into every-day life.",
        bullets: ["Evidence-based strategies", "In-the-moment coaching", "Routines & rituals", "Sibling & co-parent support"],
        img: "https://images.unsplash.com/photo-1764267703828-843753961a1e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxwYXJlbnQlMjBhbmQlMjBjaGlsZCUyMGxlYXJuaW5nJTIwdG9nZXRoZXIlMjB3YXJtJTIwbGlnaHR8ZW58MHx8fHwxNzc2OTI0NTYyfDA&ixlib=rb-4.1.0&q=85",
    },
    {
        icon: BookOpen,
        title: "Therapy Materials",
        summary: "Download clinician-crafted workbooks, flashcards, and PDFs that we actually use with our own clients.",
        bullets: ["Digital downloads", "Printable workbooks", "Therapist-ready bundles", "Monthly new releases"],
        link: "/shop",
        img: "https://images.pexels.com/photos/5206088/pexels-photo-5206088.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    },
    {
        icon: Users,
        title: "Consulting",
        summary: "For schools, therapists, and family-facing organizations — custom curriculum review, staff training, and clinical consultation.",
        bullets: ["Curriculum audits", "Staff trainings", "Case consultation", "Program design"],
        img: "https://images.unsplash.com/photo-1676116777245-1cc40079cd38?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwyfHxkaWdpdGFsJTIwcHJvZHVjdHMlMjBtb2NrdXAlMjB0YWJsZXR8ZW58MHx8fHwxNzc2OTI0NTczfDA&ixlib=rb-4.1.0&q=85",
    },
];

const Services = () => {
    return (
        <div className="relative overflow-hidden">
            <section className="pt-20 pb-14 sm:pt-28 sm:pb-20" data-testid="services-hero">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <SectionTitle
                        eyebrow="Services"
                        title={<>Thoughtful support, <em className="italic text-bloom-sage">meticulously</em> matched to you.</>}
                        subtitle="Browse our services below. Every engagement begins with a free 15-minute consult — no commitment, just conversation."
                    />
                </div>
            </section>

            <section className="pb-24 sm:pb-32">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-10">
                    {SERVICES.map((s, i) => {
                        const Icon = s.icon;
                        const reversed = i % 2 === 1;
                        return (
                            <Reveal key={s.title} delay={0.05}>
                                <div
                                    className={`group relative grid md:grid-cols-12 gap-8 bg-white rounded-[2rem] border border-bloom-border p-6 sm:p-10 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(74,58,40,0.08)] ${reversed ? "md:[&>*:first-child]:order-2" : ""}`}
                                    data-testid={`service-row-${s.title.toLowerCase().replace(/\s+/g, "-")}`}
                                >
                                    <div className="md:col-span-5 relative overflow-hidden rounded-[1.5rem] aspect-[4/3]">
                                        <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute top-4 left-4 w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-bloom-sage shadow">
                                            <Icon size={20} strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    <div className="md:col-span-7 flex flex-col justify-center">
                                        <Overline>Service 0{i + 1}</Overline>
                                        <h3 className="font-serif text-3xl sm:text-4xl mt-3 text-bloom-cocoa leading-tight">
                                            {s.title}
                                        </h3>
                                        <p className="mt-4 text-base text-bloom-text2 leading-relaxed">{s.summary}</p>
                                        <ul className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-2">
                                            {s.bullets.map((b) => (
                                                <li key={b} className="flex items-center gap-2 text-sm text-bloom-text2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-bloom-sage" /> {b}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-8 flex gap-3">
                                            <Link
                                                to={s.link || "/booking"}
                                                data-testid={`service-cta-${s.title.toLowerCase().replace(/\s+/g, "-")}`}
                                                className="inline-flex items-center bg-bloom-cocoa text-white rounded-full px-6 py-3 text-sm font-sans font-medium hover:bg-bloom-cocoa-hover transition-all"
                                            >
                                                {s.link ? "Shop Materials" : "Book a Consult"}
                                            </Link>
                                            <Link
                                                to="/contact"
                                                className="inline-flex items-center border border-bloom-cocoa text-bloom-cocoa rounded-full px-6 py-3 text-sm font-sans font-medium hover:bg-bloom-cocoa hover:text-white transition-all"
                                            >
                                                Ask a question
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Services;
