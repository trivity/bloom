import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { Overline } from "../components/ui-bits";
import { ArrowLeft, Check, Download } from "lucide-react";
import SEO from "../components/SEO";

const ShopDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [buying, setBuying] = useState(false);

    useEffect(() => {
        api
            .get(`/products/${id}`)
            .then((r) => setProduct(r.data))
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
    }, [id]);

    const buy = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email — that's where we send your download link.");
        setBuying(true);
        try {
            const { data } = await api.post("/checkout/session", {
                product_id: product.id,
                email,
                origin_url: window.location.origin,
            });
            window.location.href = data.url;
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Could not start checkout.");
            setBuying(false);
        }
    };

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-bloom-text2">Loading…</div>;
    if (!product)
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="font-serif text-3xl text-bloom-cocoa">We couldn't find that product.</div>
                <Link to="/shop" className="text-bloom-sage underline">Back to shop</Link>
            </div>
        );

    return (
        <div className="relative">
            <SEO
                title={product.name}
                description={product.description}
                image={product.image_url}
                type="product"
            />
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 pb-24 sm:pb-32">
                <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-bloom-text2 hover:text-bloom-cocoa mb-8" data-testid="shop-detail-back">
                    <ArrowLeft size={16} /> Back to shop
                </Link>

                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-6">
                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-bloom-cream-muted">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-serif text-bloom-sage text-3xl px-8 text-center">
                                    {product.name}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-6">
                        <Overline>{product.category}</Overline>
                        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl mt-4 text-bloom-cocoa leading-[1.05] tracking-tight">
                            {product.name}
                        </h1>
                        <div className="mt-6 font-serif text-3xl text-bloom-sage">${Number(product.price).toFixed(2)}</div>
                        <p className="mt-8 text-base sm:text-lg text-bloom-text2 leading-relaxed">{product.description}</p>

                        <ul className="mt-8 space-y-3">
                            {["Instant digital download after checkout", "Print-ready PDF", "Clinician-designed & classroom-tested"].map((f) => (
                                <li key={f} className="flex items-center gap-3 text-sm text-bloom-text2">
                                    <span className="w-6 h-6 rounded-full bg-bloom-cream-muted flex items-center justify-center text-bloom-sage">
                                        <Check size={14} />
                                    </span>
                                    {f}
                                </li>
                            ))}
                        </ul>

                        <form onSubmit={buy} className="mt-10 space-y-4" data-testid="shop-detail-buy-form">
                            <label className="block">
                                <span className="block text-xs font-sans font-semibold tracking-[0.2em] uppercase text-bloom-sage mb-2">
                                    Email for download <span className="text-bloom-rose-hover ml-1">*</span>
                                </span>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    data-testid="shop-detail-email"
                                    placeholder="you@example.com"
                                    className="w-full bg-white border border-bloom-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-bloom-sage focus:border-transparent"
                                />
                            </label>
                            <button
                                type="submit"
                                disabled={buying}
                                data-testid="shop-detail-buy"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-bloom-cocoa text-white rounded-full px-10 py-4 font-sans font-medium hover:bg-bloom-cocoa-hover hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                            >
                                <Download size={18} /> {buying ? "Redirecting…" : `Buy — $${Number(product.price).toFixed(2)}`}
                            </button>
                            <p className="text-xs text-bloom-muted">
                                Secure checkout powered by Stripe. Use test card <code className="bg-bloom-cream-muted px-1.5 py-0.5 rounded">4242 4242 4242 4242</code>.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopDetail;
