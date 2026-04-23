import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ProductCard = ({ product, index = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: index * 0.06, ease: [0.25, 1, 0.5, 1] }}
            className="group"
            data-testid={`product-card-${product.id}`}
        >
            <Link to={`/shop/${product.id}`} className="block">
                <div className="relative overflow-hidden rounded-[1.75rem] bg-bloom-cream-muted aspect-[4/5]">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-bloom-sage text-2xl">
                            {product.name}
                        </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-sans font-semibold tracking-[0.2em] uppercase text-bloom-cocoa">
                        {product.category}
                    </div>
                </div>
                <div className="mt-5 flex justify-between items-start gap-4">
                    <h3 className="font-serif text-xl sm:text-2xl text-bloom-cocoa leading-snug">
                        {product.name}
                    </h3>
                    <div className="font-serif text-xl text-bloom-cocoa whitespace-nowrap">
                        ${Number(product.price).toFixed(2)}
                    </div>
                </div>
                <p className="mt-2 text-sm text-bloom-text2 line-clamp-2">{product.description}</p>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
