import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Overline, SectionTitle, Reveal } from "../components/ui-bits";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/blog").then((r) => setPosts(r.data)).catch(() => setPosts([])).finally(() => setLoading(false));
    }, []);

    return (
        <div className="relative">
            <section className="pt-20 pb-12 sm:pt-28" data-testid="blog-hero">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <SectionTitle
                        eyebrow="The Journal"
                        title={<>Stories, strategies & quiet <em className="italic text-bloom-sage">wisdom</em>.</>}
                        subtitle="Notes from our team — what we're learning, what we're trying, and the small moments that keep us grounded."
                    />
                </div>
            </section>

            <section className="pb-24 sm:pb-32">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] rounded-[1.75rem] bg-bloom-cream-muted animate-pulse" />
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-20 text-bloom-text2">No articles yet — check back soon.</div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10" data-testid="blog-grid">
                            {posts.map((p, i) => (
                                <motion.article
                                    key={p.id}
                                    initial={{ opacity: 0, y: 28 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-80px" }}
                                    transition={{ duration: 0.7, delay: i * 0.08, ease: [0.25, 1, 0.5, 1] }}
                                    data-testid={`blog-card-${p.slug}`}
                                    className="group"
                                >
                                    <Link to={`/blog/${p.slug}`} className="block">
                                        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-bloom-cream-muted">
                                            {p.cover_image ? (
                                                <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-serif text-bloom-sage text-2xl px-8 text-center">
                                                    {p.title}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-bloom-cocoa/40 via-transparent to-transparent" />
                                        </div>
                                        <div className="mt-6">
                                            <div className="text-xs font-sans tracking-[0.2em] uppercase text-bloom-sage">
                                                {p.published_at ? new Date(p.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : ""}
                                            </div>
                                            <h2 className="font-serif text-2xl sm:text-3xl text-bloom-cocoa leading-snug mt-3">
                                                {p.title}
                                            </h2>
                                            <p className="mt-3 text-sm text-bloom-text2 line-clamp-3 leading-relaxed">{p.excerpt}</p>
                                            <div className="mt-5 inline-flex items-center gap-2 text-sm font-sans font-medium text-bloom-cocoa">
                                                Read article
                                                <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Blog;
