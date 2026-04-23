import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import { Plus, Trash2, Upload, LogOut, Edit2, X, Eye, EyeOff } from "lucide-react";

const empty = { name: "", description: "", price: 0, category: "Digital Download", image_url: "", is_published: true };

const AdminDashboard = () => {
    const { logout } = useAuth();
    const nav = useNavigate();
    const [products, setProducts] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [tab, setTab] = useState("products");
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const [p, c, b] = await Promise.all([
                api.get("/admin/products"),
                api.get("/admin/contacts"),
                api.get("/admin/bookings"),
            ]);
            setProducts(p.data);
            setContacts(c.data);
            setBookings(b.data);
        } catch (err) {
            if (err?.response?.status === 401) {
                logout();
                nav("/admin/login");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openNew = () => {
        setEditing("new");
        setForm(empty);
    };
    const openEdit = (p) => {
        setEditing(p.id);
        setForm({ ...p });
    };
    const closeDialog = () => {
        setEditing(null);
        setForm(empty);
    };

    const save = async (e) => {
        e.preventDefault();
        try {
            if (editing === "new") {
                await api.post("/admin/products", { ...form, price: Number(form.price) });
                toast.success("Product created");
            } else {
                await api.put(`/admin/products/${editing}`, { ...form, price: Number(form.price) });
                toast.success("Product updated");
            }
            closeDialog();
            load();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Save failed");
        }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        try {
            await api.delete(`/admin/products/${id}`);
            toast.success("Deleted");
            load();
        } catch {
            toast.error("Could not delete");
        }
    };

    const uploadFile = async (id, file) => {
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        try {
            await api.post(`/admin/products/${id}/file`, fd, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success("File uploaded");
            load();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Upload failed");
        }
    };

    return (
        <div className="min-h-screen bg-bloom-cream">
            {/* Admin header */}
            <header className="bg-white border-b border-bloom-border sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Logo size={40} showText={false} />
                        <div>
                            <div className="font-serif text-xl text-bloom-cocoa">Admin Dashboard</div>
                            <div className="text-xs text-bloom-muted">Manage products, contacts & bookings</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-sm text-bloom-text2 hover:text-bloom-cocoa" data-testid="admin-view-site">View site</Link>
                        <button
                            onClick={() => {
                                logout();
                                nav("/admin/login");
                            }}
                            data-testid="admin-logout"
                            className="inline-flex items-center gap-2 text-sm bg-bloom-cocoa text-white rounded-full px-4 py-2 hover:bg-bloom-cocoa-hover transition-all"
                        >
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 flex gap-1 border-t border-bloom-border">
                    {[
                        { k: "products", label: `Products (${products.length})` },
                        { k: "contacts", label: `Messages (${contacts.length})` },
                        { k: "bookings", label: `Bookings (${bookings.length})` },
                    ].map((t) => (
                        <button
                            key={t.k}
                            onClick={() => setTab(t.k)}
                            data-testid={`admin-tab-${t.k}`}
                            className={`px-5 py-3 text-sm border-b-2 transition-all ${
                                tab === t.k
                                    ? "border-bloom-cocoa text-bloom-cocoa"
                                    : "border-transparent text-bloom-text2 hover:text-bloom-cocoa"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {loading ? (
                    <div className="text-center py-20 text-bloom-text2">Loading…</div>
                ) : tab === "products" ? (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-serif text-3xl text-bloom-cocoa">Products</h2>
                            <button
                                onClick={openNew}
                                data-testid="admin-new-product"
                                className="inline-flex items-center gap-2 bg-bloom-cocoa text-white rounded-full px-5 py-2.5 text-sm hover:bg-bloom-cocoa-hover transition-all"
                            >
                                <Plus size={16} /> New product
                            </button>
                        </div>

                        <div className="bg-white border border-bloom-border rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-bloom-cream-muted text-left text-xs tracking-[0.15em] uppercase text-bloom-text2">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Price</th>
                                        <th className="p-4">File</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-bloom-border">
                                    {products.map((p) => (
                                        <tr key={p.id} data-testid={`admin-product-row-${p.id}`}>
                                            <td className="p-4 text-bloom-cocoa font-medium">{p.name}</td>
                                            <td className="p-4 text-bloom-text2">{p.category}</td>
                                            <td className="p-4 text-bloom-text2">${Number(p.price).toFixed(2)}</td>
                                            <td className="p-4 text-xs">
                                                {p.original_filename ? (
                                                    <span className="text-bloom-sage">✓ {p.original_filename}</span>
                                                ) : (
                                                    <label className="cursor-pointer text-bloom-muted hover:text-bloom-cocoa inline-flex items-center gap-1">
                                                        <Upload size={14} /> Upload
                                                        <input type="file" className="hidden" onChange={(e) => uploadFile(p.id, e.target.files[0])} data-testid={`admin-upload-${p.id}`} />
                                                    </label>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs inline-flex items-center gap-1 ${p.is_published ? "text-bloom-sage" : "text-bloom-muted"}`}>
                                                    {p.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                                                    {p.is_published ? "Published" : "Hidden"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="inline-flex gap-2">
                                                    <label className="p-2 rounded-lg border border-bloom-border hover:bg-bloom-cream cursor-pointer" title="Replace file">
                                                        <Upload size={14} />
                                                        <input type="file" className="hidden" onChange={(e) => uploadFile(p.id, e.target.files[0])} />
                                                    </label>
                                                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg border border-bloom-border hover:bg-bloom-cream" data-testid={`admin-edit-${p.id}`}>
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => remove(p.id)} className="p-2 rounded-lg border border-bloom-border hover:bg-red-50 hover:text-red-600" data-testid={`admin-delete-${p.id}`}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : tab === "contacts" ? (
                    <div className="space-y-4">
                        <h2 className="font-serif text-3xl text-bloom-cocoa">Contact Messages</h2>
                        {contacts.length === 0 && <div className="text-bloom-text2">No messages yet.</div>}
                        {contacts.map((m) => (
                            <div key={m.id} className="bg-white border border-bloom-border rounded-2xl p-6" data-testid={`admin-message-${m.id}`}>
                                <div className="flex justify-between flex-wrap gap-2">
                                    <div>
                                        <div className="font-serif text-xl text-bloom-cocoa">{m.name}</div>
                                        <div className="text-sm text-bloom-text2">{m.email}{m.phone ? ` · ${m.phone}` : ""}</div>
                                    </div>
                                    <div className="text-xs text-bloom-muted">{new Date(m.created_at).toLocaleString()}</div>
                                </div>
                                {m.subject && <div className="mt-3 text-sm font-medium text-bloom-cocoa">Re: {m.subject}</div>}
                                <p className="mt-3 text-sm text-bloom-text2 whitespace-pre-wrap">{m.message}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="font-serif text-3xl text-bloom-cocoa">Booking Requests</h2>
                        {bookings.length === 0 && <div className="text-bloom-text2">No bookings yet.</div>}
                        {bookings.map((b) => (
                            <div key={b.id} className="bg-white border border-bloom-border rounded-2xl p-6" data-testid={`admin-booking-${b.id}`}>
                                <div className="flex justify-between flex-wrap gap-2">
                                    <div>
                                        <div className="font-serif text-xl text-bloom-cocoa">{b.name} — {b.service}</div>
                                        <div className="text-sm text-bloom-text2">{b.email}{b.phone ? ` · ${b.phone}` : ""}</div>
                                    </div>
                                    <div className="text-xs text-bloom-muted">{new Date(b.created_at).toLocaleString()}</div>
                                </div>
                                {(b.preferred_date || b.preferred_time) && (
                                    <div className="mt-3 text-sm text-bloom-cocoa">
                                        Preferred: {b.preferred_date || "any date"} · {b.preferred_time || "any time"}
                                    </div>
                                )}
                                {b.notes && <p className="mt-3 text-sm text-bloom-text2 whitespace-pre-wrap">{b.notes}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Product edit modal */}
            {editing && (
                <div className="fixed inset-0 z-50 bg-bloom-cocoa/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={closeDialog}>
                    <form
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={save}
                        className="bg-white rounded-[1.75rem] w-full max-w-xl p-8 space-y-4 relative"
                        data-testid="admin-product-modal"
                    >
                        <button type="button" onClick={closeDialog} className="absolute top-4 right-4 text-bloom-text2 hover:text-bloom-cocoa">
                            <X size={20} />
                        </button>
                        <h3 className="font-serif text-2xl text-bloom-cocoa">{editing === "new" ? "New product" : "Edit product"}</h3>

                        <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={ic} data-testid="admin-form-name" /></Field>
                        <Field label="Description"><textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={ic + " resize-none"} data-testid="admin-form-description" /></Field>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Price (USD)"><input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={ic} data-testid="admin-form-price" /></Field>
                            <Field label="Category"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={ic} data-testid="admin-form-category" /></Field>
                        </div>
                        <Field label="Image URL (optional)"><input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={ic} placeholder="https://…" data-testid="admin-form-image" /></Field>

                        <label className="flex items-center gap-2 text-sm text-bloom-text2">
                            <input
                                type="checkbox"
                                checked={!!form.is_published}
                                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                                data-testid="admin-form-published"
                            />
                            Published (visible on shop)
                        </label>

                        <div className="flex gap-3 pt-3">
                            <button type="submit" className="inline-flex items-center bg-bloom-cocoa text-white rounded-full px-6 py-3 text-sm hover:bg-bloom-cocoa-hover transition-all" data-testid="admin-form-save">
                                Save
                            </button>
                            <button type="button" onClick={closeDialog} className="inline-flex items-center border border-bloom-border text-bloom-cocoa rounded-full px-6 py-3 text-sm">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const ic = "w-full bg-white border border-bloom-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bloom-sage text-sm";
const Field = ({ label, children }) => (
    <label className="block">
        <span className="block text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-bloom-sage mb-1.5">{label}</span>
        {children}
    </label>
);

export default AdminDashboard;
