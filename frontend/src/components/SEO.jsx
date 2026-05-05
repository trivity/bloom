import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_NAME = "The Blooming Branch Team";
const DEFAULT_DESCRIPTION =
    "Speech therapy, executive functioning, tutoring, early intervention, and parent coaching for ages 2–99. Let's grow, speak, and bloom together.";
const DEFAULT_IMAGE =
    "https://customer-assets.emergentagent.com/job_grow-speak-bloom/artifacts/6ataomx6_495029358_122102872016863635_1789127969748974907_n.jpg";

export const SEO = ({
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    type = "website",
    canonical,
}) => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — Grow, Speak, Bloom`;
    const url =
        canonical ||
        (typeof window !== "undefined" ? window.location.origin + window.location.pathname : "");

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {url && <link rel="canonical" href={url} />}

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            {url && <meta property="og:url" content={url} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;
