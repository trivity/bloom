import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { Overline, SectionTitle } from "../components/ui-bits";
import { Leaf, Flower, Branch } from "../components/BotanicalAccent";
import SEO from "../components/SEO";

const SERVICES = [
    "Speech Therapy",
    "Executive Functioning",
    "Tutoring",
    "Early Intervention",
    "Parent Coaching",
    "Consulting (Schools / Staff)",
    "Not sure yet",
];

const Booking = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        service: SERVICES[0],
        preferred_date: "",
        preferred_time: "",
        notes: "",
    });
    const [loading, setLoading] = useState(false);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/booking", form);
            toast.success("Your consult request is in — we'll confirm a time shortly!");
            setForm({ name: "", email: "", phone: "", service: SERVICES[0], preferred_date: "", preferred_time: "", notes: "" });
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Couldn't submit. Try again?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative overflow-hidden">
            <SEO
                title="Book a Free Consult"
                description="Free 15-minute consult — no commitment, just a conversation. Tell us a little about who you're here for and we'll follow up within one business day."
            />
            <section className="pt-20 pb-12 sm:pt-28" data-testid="booking-hero">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
                    <Leaf className="absolute -right-4 top-0 w-20 h-20 opacity-50 hidden md:block" rotate={25} />
                    <SectionTitle
                        eyebrow="Book a Consult"
                        title={<>Free 15-minute <em className="italic text-bloom-sage">consult</em>.<br />No commitment — just a conversation.</>}
                        subtitle="Tell us a little about who you're here for and what you're hoping to explore. We'll follow up within one business day to schedule."
                    />
                </div>
            </section>

            <section className="pb-24 sm:pb-32">
                <div className="max-w-4xl mx-auto px-6 sm:px-8">
                    <form
                        onSubmit={submit}
                        className="bg-white rounded-[2rem] border border-bloom-border p-8 sm:p-12 space-y-6"
                        data-testid="booking-form"
                    >
                        <div className="grid sm:grid-cols-2 gap-6">
                            <Field label="Name" required>
                                <input required data-testid="booking-name" value={form.name} onChange={set("name")} className={inputCls} placeholder="Who should we address?" />
                            </Field>
                            <Field label="Email" required>
                                <input required type="email" data-testid="booking-email" value={form.email} onChange={set("email")} className={inputCls} placeholder="you@example.com" />
                            </Field>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <Field label="Phone (optional)">
                                <input data-testid="booking-phone" value={form.phone} onChange={set("phone")} className={inputCls} placeholder="(555) 555-5555" />
                            </Field>
                            <Field label="Service of interest" required>
                                <select required data-testid="booking-service" value={form.service} onChange={set("service")} className={inputCls}>
                                    {SERVICES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <Field label="Preferred date">
                                <input type="date" data-testid="booking-date" value={form.preferred_date} onChange={set("preferred_date")} className={inputCls} />
                            </Field>
                            <Field label="Preferred time">
                                <input type="time" data-testid="booking-time" value={form.preferred_time} onChange={set("preferred_time")} className={inputCls} />
                            </Field>
                        </div>
                        <Field label="Notes — tell us about the person we're supporting">
                            <textarea
                                data-testid="booking-notes"
                                value={form.notes}
                                onChange={set("notes")}
                                rows={5}
                                className={inputCls + " resize-none"}
                                placeholder="Age, concerns, goals, anything you'd like us to know…"
                            />
                        </Field>

                        <button
                            type="submit"
                            disabled={loading}
                            data-testid="booking-submit"
                            className="w-full sm:w-auto inline-flex items-center justify-center bg-bloom-cocoa text-white rounded-full px-10 py-4 font-sans font-medium hover:bg-bloom-cocoa-hover hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                        >
                            {loading ? "Sending…" : "Request Consult"}
                        </button>
                    </form>

                    <div className="mt-16 text-center">
                        <Branch className="w-72 mx-auto opacity-70" />
                        <p className="font-serif italic text-2xl text-bloom-cocoa mt-6">
                            "Growth begins with a single, brave conversation."
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

const inputCls =
    "w-full bg-white border border-bloom-border rounded-2xl px-5 py-4 font-sans text-bloom-cocoa placeholder:text-bloom-muted focus:outline-none focus:ring-2 focus:ring-bloom-sage focus:border-transparent transition-all";

const Field = ({ label, required, children }) => (
    <label className="block">
        <span className="block text-xs font-sans font-semibold tracking-[0.2em] uppercase text-bloom-sage mb-2">
            {label}
            {required && <span className="text-bloom-rose-hover ml-1">*</span>}
        </span>
        {children}
    </label>
);

export default Booking;
