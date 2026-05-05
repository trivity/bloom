import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const NAV = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/shop", label: "Shop" },
    { to: "/blog", label: "Journal" },
    { to: "/booking", label: "Booking" },
    { to: "/contact", label: "Contact" },
];

const Header = () => {
    const [open, setOpen] = useState(false);
    const loc = useLocation();

    React.useEffect(() => {
        setOpen(false);
    }, [loc.pathname]);

    return (
        <header
            className="sticky top-0 z-50 bg-[#F5EFE5]/80 backdrop-blur-xl border-b border-bloom-border/50"
            data-testid="site-header"
        >
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
                <Link to="/" data-testid="logo-home-link">
                    <Logo />
                </Link>

                <nav className="hidden md:flex items-center gap-8" data-testid="desktop-nav">
                    {NAV.map((n) => (
                        <NavLink
                            key={n.to}
                            to={n.to}
                            end={n.to === "/"}
                            data-testid={`nav-${n.label.toLowerCase()}`}
                            className={({ isActive }) =>
                                `bloom-link font-sans text-sm tracking-wide transition-colors ${
                                    isActive ? "text-bloom-cocoa" : "text-bloom-text2 hover:text-bloom-cocoa"
                                }`
                            }
                        >
                            {n.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden md:block">
                    <Link
                        to="/booking"
                        data-testid="header-cta-book"
                        className="inline-flex items-center bg-bloom-cocoa text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-bloom-cocoa-hover hover:scale-[1.03] active:scale-95 transition-all"
                    >
                        Book a Consult
                    </Link>
                </div>

                <button
                    className="md:hidden p-2 text-bloom-cocoa"
                    onClick={() => setOpen((v) => !v)}
                    data-testid="mobile-menu-toggle"
                    aria-label="Toggle menu"
                >
                    {open ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-bloom-border/50 bg-bloom-cream overflow-hidden"
                        data-testid="mobile-nav"
                    >
                        <div className="px-6 py-6 space-y-4">
                            {NAV.map((n) => (
                                <NavLink
                                    key={n.to}
                                    to={n.to}
                                    end={n.to === "/"}
                                    data-testid={`mobile-nav-${n.label.toLowerCase()}`}
                                    className={({ isActive }) =>
                                        `block font-sans text-base ${
                                            isActive ? "text-bloom-cocoa" : "text-bloom-text2"
                                        }`
                                    }
                                >
                                    {n.label}
                                </NavLink>
                            ))}
                            <Link
                                to="/booking"
                                data-testid="mobile-cta-book"
                                className="inline-flex items-center bg-bloom-cocoa text-white rounded-full px-6 py-3 text-sm font-medium"
                            >
                                Book a Consult
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
