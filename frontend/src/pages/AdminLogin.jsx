import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import Logo from "../components/Logo";
import { ArrowLeft } from "lucide-react";

const AdminLogin = () => {
    const { login, user } = useAuth();
    const nav = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (user) nav("/admin");
    }, [user, nav]);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.username, form.password);
            toast.success("Welcome back!");
            nav("/admin");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bloom-cream flex flex-col">
            <div className="p-6">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-bloom-text2 hover:text-bloom-cocoa" data-testid="admin-back-home">
                    <ArrowLeft size={16} /> Back to site
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="flex justify-center mb-8">
                        <Logo size={56} />
                    </div>
                    <div className="bg-white rounded-[2rem] border border-bloom-border p-8 sm:p-10 shadow-sm">
                        <h1 className="font-serif text-3xl text-bloom-cocoa text-center">Admin Portal</h1>
                        <p className="text-sm text-bloom-text2 text-center mt-2">Manage products and orders.</p>

                        <form onSubmit={submit} className="mt-8 space-y-5" data-testid="admin-login-form">
                            <label className="block">
                                <span className="block text-xs font-sans font-semibold tracking-[0.2em] uppercase text-bloom-sage mb-2">Username</span>
                                <input
                                    required
                                    data-testid="admin-username"
                                    value={form.username}
                                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                                    className="w-full bg-white border border-bloom-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-bloom-sage focus:border-transparent"
                                    autoComplete="username"
                                />
                            </label>
                            <label className="block">
                                <span className="block text-xs font-sans font-semibold tracking-[0.2em] uppercase text-bloom-sage mb-2">Password</span>
                                <input
                                    required
                                    type="password"
                                    data-testid="admin-password"
                                    value={form.password}
                                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                    className="w-full bg-white border border-bloom-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-bloom-sage focus:border-transparent"
                                    autoComplete="current-password"
                                />
                            </label>
                            <button
                                type="submit"
                                disabled={loading}
                                data-testid="admin-login-submit"
                                className="w-full inline-flex items-center justify-center bg-bloom-cocoa text-white rounded-full px-10 py-4 font-sans font-medium hover:bg-bloom-cocoa-hover hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-60"
                            >
                                {loading ? "Signing in…" : "Sign in"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
