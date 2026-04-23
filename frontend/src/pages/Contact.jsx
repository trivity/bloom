import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { Overline, SectionTitle } from "../components/ui-bits";
import { Leaf, Flower } from "../components/BotanicalAccent";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const [loading, setLoading] = useState(false);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/contact", form);
            toast.success("Message received — we'll be in touch within 2 business days.");
            setForm({ name: "", email: "", phone: "", subject: "", message: "" });
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Couldn't send. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative overflow-hidden">
            <section className="pt-20 pb-12 sm:pt-28" data-testid="contact-hero">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <SectionTitle
                        eyebrow="Let's Connect"
                        title={<>Say hello — we'd <em className="italic text-bloom-sage">love</em> to hear from you.</>}
                        subtitle="Questions about services, products, or just wondering where to start? Drop us a note and a real human on our team will reply."
                    />
                </div>
            </section>

            <section className="pb-24 sm:pb-32 relative">
                <Leaf className="absolute left-[2%] top-8 w-14 h-14 opacity-40 hidden md:block" rotate={-30} />
                <Flower className="absolute right-[3%] bottom-20 w-14 h-14 hidden md:block" />

                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-10">
                    {/* Info */}
                    <div className="lg:col-span-4 space-y-8">
                        {[
                            { icon: Mail, label: "Email", value: "hello@bloomingbranch.team" },
                            { icon: Phone, label: "Phone", value: "By consult request" },
                            { icon: MapPin, label: "Service area", value: "Virtual & In-person" },
                        ].map((c) => {
                            const Icon = c.icon;
                            return (
                                <div key={c.label} className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-bloom-cream-muted flex items-center justify-center text-bloom-sage">
                                        <Icon size={20} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <Overline>{c.label}</Overline>
                                        <div className="font-serif text-2xl text-bloom-cocoa mt-1">{c.value}</div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="bg-bloom-cream-muted border border-bloom-border rounded-[1.5rem] p-8 mt-10">
                            <div className="font-serif text-xl text-bloom-cocoa leading-snug">
                                "We try to respond within 2 business days, often sooner. Thank you for your patience."
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={submit}
                        className="lg:col-span-8 bg-white rounded-[2rem] border border-bloom-border p-8 sm:p-12 space-y-6"
                        data-testid="contact-form"
                    >
                        <div className="grid sm:grid-cols-2 gap-6">
                            <Field label="Name" required>
                                <input
                                    required
                                    data-testid="contact-name"
                                    value={form.name}
                                    onChange={set("name")}
                                    className={inputCls}
                                    placeholder="Your full name"
                                />
                            </Field>
                            <Field label="Email" required>
                                <input
                                    required
                                    type="email"
                                    data-testid="contact-email"
                                    value={form.email}
                                    onChange={set("email")}
                                    className={inputCls}
                                    placeholder="you@example.com"
                                />
                            </Field>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <Field label="Phone (optional)">
                                <input
                                    data-testid="contact-phone"
                                    value={form.phone}
                                    onChange={set("phone")}
                                    className={inputCls}
                                    placeholder="(555) 555-5555"
                                />
                            </Field>
                            <Field label="Subject">
                                <input
                                    data-testid="contact-subject"
                                    value={form.subject}
                                    onChange={set("subject")}
                                    className={inputCls}
                                    placeholder="e.g. Speech therapy for my 4-year-old"
                                />
                            </Field>
                        </div>
                        <Field label="Message" required>
                            <textarea
                                required
                                data-testid="contact-message"
                                value={form.message}
                                onChange={set("message")}
                                rows={6}
                                className={inputCls + " resize-none"}
                                placeholder="Tell us a little about who you're here for…"
                            />
                        </Field>
                        <button
                            type="submit"
                            disabled={loading}
                            data-testid="contact-submit"
                            className="w-full sm:w-auto inline-flex items-center justify-center bg-bloom-cocoa text-white rounded-full px-10 py-4 font-sans font-medium hover:bg-bloom-cocoa-hover hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                        >
                            {loading ? "Sending…" : "Send Message"}
                        </button>
                    </form>
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

export default Contact;
