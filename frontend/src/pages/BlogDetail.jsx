import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { ArrowLeft } from "lucide-react";

const renderParagraph = (block, idx) => {
    // Very light markdown-ish rendering: bold via **text** and paragraph breaks
    const parts = block.split(/(\*\*[^*]+\*\*)/g).map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) {
            return (
                <strong key={i} className="text-bloom-cocoa">
                    {p.slice(2, -2)}
                </strong>
            );
        }
        return <React.Fragment key={i}>{p}</React.Fragment>;
    });
    return (
        <p key={idx} className="text-base sm:text-lg text-bloom-text2 leading-[1.85] mt-6">
            {parts}
        </p>
    );
};

const BlogDetail = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get(`/blog/${slug}`)
            .then((r) => setPost(r.data))
            .catch(() => setPost(null))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-bloom-text2">Loading…</div>;
    if (!post)
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="font-serif text-3xl text-bloom-cocoa">Article not found.</div>
                <Link to="/blog" className="text-bloom-sage underline">Back to journal</Link>
            </div>
        );

    const blocks = (post.content || "").split(/\n\n+/);

    return (
        <article className="relative">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 pt-12">
                <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-bloom-text2 hover:text-bloom-cocoa mb-8" data-testid="blog-detail-back">
                    <ArrowLeft size={16} /> Back to journal
                </Link>

                <div className="text-xs font-sans tracking-[0.28em] uppercase text-bloom-sage">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : ""}
                    {post.author ? ` · ${post.author}` : ""}
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-bloom-cocoa mt-4 leading-[1.05] tracking-tight">
                    {post.title}
                </h1>

                {post.excerpt && (
                    <p className="mt-6 font-serif italic text-xl sm:text-2xl text-bloom-text2 leading-snug">
                        {post.excerpt}
                    </p>
                )}
            </div>

            {post.cover_image && (
                <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 mt-12">
                    <div className="aspect-[16/9] rounded-[2rem] overflow-hidden">
                        <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto px-6 sm:px-8 pt-12 pb-24 sm:pb-32">
                {blocks.map((b, i) => renderParagraph(b, i))}

                <div className="mt-16 pt-10 border-t border-bloom-border">
                    <Link
                        to="/booking"
                        data-testid="blog-detail-cta"
                        className="inline-flex items-center bg-bloom-cocoa text-white rounded-full px-8 py-3 text-sm font-sans font-medium hover:bg-bloom-cocoa-hover transition-all"
                    >
                        Book a free 15-minute consult
                    </Link>
                </div>
            </div>
        </article>
    );
};

export default BlogDetail;
