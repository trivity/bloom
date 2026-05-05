import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_ID = process.env.REACT_APP_GA_ID;
let initialised = false;

export const useAnalytics = () => {
    const location = useLocation();

    useEffect(() => {
        if (!GA_ID) return;
        if (!initialised && typeof window !== "undefined" && window.__bloom_ga_init) {
            window.__bloom_ga_init(GA_ID);
            initialised = true;
        }
        if (typeof window !== "undefined" && window.gtag) {
            window.gtag("event", "page_view", {
                page_path: location.pathname + location.search,
                page_location: window.location.href,
                page_title: document.title,
            });
        }
    }, [location.pathname, location.search]);
};
