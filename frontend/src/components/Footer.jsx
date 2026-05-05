import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Instagram, Mail, MapPin } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-bloom-cream-muted border-t border-bloom-border" data-testid="site-footer">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 grid md:grid-cols-4 gap-12">
                <div className="md:col-span-2 space-y-6">
                    <Logo size={48} />
                    <p className="font-serif italic text-2xl text-bloom-cocoa max-w-md leading-snug">
                        Let's grow, speak, and bloom together.
                    </p>
                    <p className="text-sm text-bloom-text2 max-w-md leading-relaxed">
                        A boutique practice blending clinical speech therapy with transformational
                        coaching — for families, educators, and individuals from age 2 to 99.
                    </p>
                </div>

                <div>
                    <h4 className="text-xs tracking-[0.28em] uppercase text-bloom-sage font-sans font-semibold mb-5">
                        Explore
                    </h4>
                    <ul className="space-y-3 text-sm">
                        <li><Link className="bloom-link text-bloom-text2 hover:text-bloom-cocoa" to="/about">About Us</Link></li>
                        <li><Link className="bloom-link text-bloom-text2 hover:text-bloom-cocoa" to="/services">Services</Link></li>
                        <li><Link className="bloom-link text-bloom-text2 hover:text-bloom-cocoa" to="/shop">Shop Downloads</Link></li>
                        <li><Link className="bloom-link text-bloom-text2 hover:text-bloom-cocoa" to="/blog">Journal</Link></li>
                        <li><Link className="bloom-link text-bloom-text2 hover:text-bloom-cocoa" to="/booking">Book a Consult</Link></li>
                        <li><Link className="bloom-link text-bloom-text2 hover:text-bloom-cocoa" to="/contact">Contact</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs tracking-[0.28em] uppercase text-bloom-sage font-sans font-semibold mb-5">
                        Say Hello
                    </h4>
                    <ul className="space-y-3 text-sm text-bloom-text2">
                        <li className="flex items-start gap-2"><Mail size={16} className="mt-0.5 text-bloom-sage" /> hello@bloomingbranch.team</li>
                        <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-bloom-sage" /> Serving families virtually & in-person</li>
                        <li className="flex items-start gap-2"><Instagram size={16} className="mt-0.5 text-bloom-sage" /> @bloomingbranchteam</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-bloom-border">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-bloom-muted">
                    <div>© {new Date().getFullYear()} The Blooming Branch Team. All rights reserved.</div>
                    <div className="flex gap-6">
                        <Link to="/admin/login" data-testid="admin-login-link" className="hover:text-bloom-cocoa">Admin</Link>
                        <span>Growth · Learn · Support</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
