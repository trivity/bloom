import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const ServiceCard = ({ icon: Icon, title, description, to = "/services", imageUrl, index = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: index * 0.08, ease: [0.25, 1, 0.5, 1] }}
            data-testid={`service-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
        >
            <Link
                to={to}
                className="group relative block h-full bg-white rounded-[1.75rem] border border-bloom-border p-8 sm:p-10 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(74,58,40,0.08)]"
            >
                {imageUrl && (
                    <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full overflow-hidden opacity-30 group-hover:opacity-60 transition-opacity duration-700">
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="relative">
                    {Icon && (
                        <div className="w-12 h-12 rounded-2xl bg-bloom-cream flex items-center justify-center text-bloom-sage mb-6">
                            <Icon size={22} strokeWidth={1.5} />
                        </div>
                    )}
                    <h3 className="font-serif text-2xl sm:text-[28px] text-bloom-cocoa leading-snug">
                        {title}
                    </h3>
                    <p className="mt-4 text-[15px] text-bloom-text2 leading-relaxed">{description}</p>
                    <div className="mt-8 inline-flex items-center gap-2 text-sm font-sans font-medium text-bloom-cocoa">
                        Learn more
                        <ArrowUpRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ServiceCard;
