import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { Overline, SectionTitle } from "../components/ui-bits";
import { Flower } from "../components/BotanicalAccent";

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        api
            .get("/products")
            .then((r) => setProducts(r.data))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
    const visible = filter === "All" ? products : products.filter((p) => p.category === filter);

    return (
        <div className="relative overflow-hidden">
            <section className="pt-20 pb-12 sm:pt-28 relative" data-testid="shop-hero">
                <Flower className="absolute -right-4 top-10 w-16 h-16 hidden md:block" />
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <SectionTitle
                        eyebrow="Shop · Digital Downloads"
                        title={<>Clinician-crafted <em className="italic text-bloom-sage">resources</em>, ready to print.</>}
                        subtitle="Every download is the same resource we use with our own clients — thoughtfully designed, evidence-aligned, and made with love."
                    />
                </div>
            </section>

            <section className="pb-24 sm:pb-32">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    {categories.length > 1 && (
                        <div className="flex flex-wrap gap-3 mb-12" data-testid="shop-filters">
                            {categories.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setFilter(c)}
                                    data-testid={`shop-filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
                                    className={`font-sans text-sm px-5 py-2.5 rounded-full border transition-all ${
                                        filter === c
                                            ? "bg-bloom-cocoa text-white border-bloom-cocoa"
                                            : "border-bloom-border text-bloom-text2 hover:text-bloom-cocoa hover:border-bloom-cocoa"
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] rounded-[1.75rem] bg-bloom-cream-muted animate-pulse" />
                            ))}
                        </div>
                    ) : visible.length === 0 ? (
                        <div className="text-center py-20 text-bloom-text2">No products yet — check back soon!</div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10" data-testid="shop-grid">
                            {visible.map((p, i) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Shop;
