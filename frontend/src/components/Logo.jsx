import React from "react";

const LOGO_URL =
    "https://customer-assets.emergentagent.com/job_grow-speak-bloom/artifacts/6ataomx6_495029358_122102872016863635_1789127969748974907_n.jpg";

export const Logo = ({ size = 44, showText = true, className = "" }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <div
            className="rounded-full overflow-hidden bg-white ring-1 ring-bloom-border shadow-sm"
            style={{ width: size, height: size }}
        >
            <img src={LOGO_URL} alt="Blooming Branch Team logo" className="w-full h-full object-cover" />
        </div>
        {showText && (
            <div className="leading-tight">
                <div className="font-serif text-lg text-bloom-cocoa">Blooming Branch</div>
                <div className="font-sans text-[10px] tracking-[0.28em] uppercase text-bloom-sage">
                    The Team
                </div>
            </div>
        )}
    </div>
);

export default Logo;
