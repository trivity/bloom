import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api, API } from "../lib/api";
import { Flower, Leaf } from "../components/BotanicalAccent";
import { Overline } from "../components/ui-bits";
import { Download, CheckCircle2 } from "lucide-react";

const MAX_ATTEMPTS = 8;
const POLL_INTERVAL = 2500;

const CheckoutSuccess = () => {
    const [params] = useSearchParams();
    const sessionId = params.get("session_id");
    const [status, setStatus] = useState("checking"); // checking | paid | failed | expired
    const [data, setData] = useState(null);
    const attempts = useRef(0);

    useEffect(() => {
        if (!sessionId) {
            setStatus("failed");
            return;
        }
        let cancelled = false;
        const poll = async () => {
            if (cancelled) return;
            try {
                const { data: d } = await api.get(`/checkout/status/${sessionId}`);
                if (cancelled) return;
                setData(d);
                if (d.payment_status === "paid") {
                    setStatus("paid");
                    return;
                }
                if (d.status === "expired") {
                    setStatus("expired");
                    return;
                }
                attempts.current += 1;
                if (attempts.current >= MAX_ATTEMPTS) {
                    setStatus("failed");
                    return;
                }
                setTimeout(poll, POLL_INTERVAL);
            } catch {
                if (!cancelled) setStatus("failed");
            }
        };
        poll();
        return () => {
            cancelled = true;
        };
    }, [sessionId]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-16 px-6 relative overflow-hidden" data-testid="checkout-success-page">
            <Leaf className="absolute left-[8%] top-[15%] w-16 h-16 opacity-40 hidden md:block" rotate={-20} />
            <Flower className="absolute right-[10%] bottom-[15%] w-16 h-16 hidden md:block" />

            <div className="max-w-2xl w-full text-center">
                {status === "checking" && (
                    <>
                        <div className="w-16 h-16 rounded-full border-2 border-bloom-sage border-t-transparent animate-spin mx-auto" />
                        <h1 className="font-serif text-4xl sm:text-5xl text-bloom-cocoa mt-8">Confirming your order…</h1>
                        <p className="text-bloom-text2 mt-4">Hang tight — we're verifying your payment with Stripe.</p>
                    </>
                )}

                {status === "paid" && data && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-bloom-sage/20 text-bloom-sage flex items-center justify-center mx-auto">
                            <CheckCircle2 size={36} strokeWidth={1.5} />
                        </div>
                        <Overline className="mt-8">Thank you</Overline>
                        <h1 className="font-serif text-4xl sm:text-5xl text-bloom-cocoa mt-4 leading-tight">
                            Your <em className="italic text-bloom-sage">bloom</em> is ready.
                        </h1>
                        <p className="text-bloom-text2 mt-4">
                            {data.product_name ? <>Thank you for purchasing <strong>{data.product_name}</strong>. </> : null}
                            Click below to download your file. We'll also send a copy to your email.
                        </p>
                        {data.download_token ? (
                            <a
                                href={`${API}/download/${data.download_token}`}
                                data-testid="checkout-download-link"
                                className="mt-10 inline-flex items-center gap-2 bg-bloom-cocoa text-white rounded-full px-10 py-4 font-sans font-medium hover:bg-bloom-cocoa-hover hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <Download size={18} /> Download your file
                            </a>
                        ) : (
                            <div className="mt-8 text-sm text-bloom-muted">
                                The file will be emailed to you shortly. (Admin is still preparing the digital asset for this product.)
                            </div>
                        )}
                        <div className="mt-8">
                            <Link to="/shop" className="text-sm text-bloom-sage underline">Back to shop</Link>
                        </div>
                    </>
                )}

                {status === "expired" && (
                    <>
                        <h1 className="font-serif text-4xl text-bloom-cocoa">Session expired</h1>
                        <p className="text-bloom-text2 mt-4">Your checkout session timed out. Please try again.</p>
                        <Link to="/shop" className="mt-8 inline-flex items-center bg-bloom-cocoa text-white rounded-full px-8 py-3">Back to shop</Link>
                    </>
                )}

                {status === "failed" && (
                    <>
                        <h1 className="font-serif text-4xl text-bloom-cocoa">Something went wrong</h1>
                        <p className="text-bloom-text2 mt-4">
                            We couldn't confirm your payment yet. If you were charged, we'll email you the file shortly. Otherwise, please try again.
                        </p>
                        <Link to="/shop" className="mt-8 inline-flex items-center bg-bloom-cocoa text-white rounded-full px-8 py-3">Back to shop</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default CheckoutSuccess;
