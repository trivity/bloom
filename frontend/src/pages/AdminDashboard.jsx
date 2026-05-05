import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { api, API } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import {
    Plus,
    Trash2,
    Upload,
    LogOut,
    Edit2,
    X,
    Eye,
    EyeOff,
    RefreshCw,
    Copy,
    ExternalLink,
} from "lucide-react";

const emptyProduct = { name: "", description: "", price: 0, category: "Digital Download", image_url: "", is_published: true };
const emptyBlog = { title: "", slug: "", excerpt: "", content: "", cover_image: "", author: "The Blooming Branch Team", is_published: true };
const emptyTestimonial = { quote: "", name: "", role: "", image_url: "", rating: 5, is_published: true, sort_order: 0 };

const AdminDashboard = () => {
    const { logout } = useAuth();
    const nav = useNavigate();
    const [tab, setTab] = useState("products");
    const [loading, setLoading] = useState(true);

    const [products, setProducts] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [posts, setPosts] = useState([]);
    const [testimonials, setTestimonials] = useState([]);

    const [editing, setEditing] = useState(null); // {kind, id|"new"}
    const [form, setForm] = useState(emptyProduct);

    const load = async () => {
        try {
            const [p, c, b, o, bl, t] = await Promise.all([
                api.get("/admin/products"),
                api.get("/admin/contacts"),
                api.get("/admin/bookings"),
                api.get("/admin/orders"),
                api.get("/admin/blog"),
                api.get("/admin/testimonials"),
            ]);
            setProducts(p.data);
            setContacts(c.data);
            setBookings(b.data);
            setOrders(o.data);
            setPosts(bl.data);
            setTestimonials(t.data);
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

    // ----- Product CRUD -----
    const openProduct = (id) => {
        setEditing({ kind: "product", id: id || "new" });
        setForm(id ? products.find((p) => p.id === id) || emptyProduct : emptyProduct);
    };
    const saveProduct = async () => {
        const payload = { ...form, price: Number(form.price) };
        if (editing.id === "new") await api.post("/admin/products", payload);
        else await api.put(`/admin/products/${editing.id}`, payload);
        toast.success("Product saved");
    };
    const deleteProduct = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        await api.delete(`/admin/products/${id}`);
        toast.success("Deleted");
        load();
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

    // ----- Blog CRUD -----
    const openBlog = (id) => {
        setEditing({ kind: "blog", id: id || "new" });
        setForm(id ? posts.find((p) => p.id === id) || emptyBlog : emptyBlog);
    };
    const saveBlog = async () => {
        if (editing.id === "new") await api.post("/admin/blog", form);
        else await api.put(`/admin/blog/${editing.id}`, form);
        toast.success("Article saved");
    };
    const deleteBlog = async (id) => {
        if (!window.confirm("Delete this article?")) return;
        await api.delete(`/admin/blog/${id}`);
        toast.success("Deleted");
        load();
    };

    // ----- Testimonial CRUD -----
    const openTestimonial = (id) => {
        setEditing({ kind: "testimonial", id: id || "new" });
        setForm(id ? testimonials.find((t) => t.id === id) || emptyTestimonial : emptyTestimonial);
    };
    const saveTestimonial = async () => {
        const payload = { ...form, rating: Number(form.rating), sort_order: Number(form.sort_order) };
        if (editing.id === "new") await api.post("/admin/testimonials", payload);
        else await api.put(`/admin/testimonials/${editing.id}`, payload);
        toast.success("Testimonial saved");
    };
    const deleteTestimonial = async (id) => {
        if (!window.confirm("Delete this testimonial?")) return;
        await api.delete(`/admin/testimonials/${id}`);
        toast.success("Deleted");
        load();
    };

    // ----- Save dispatcher -----
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editing.kind === "product") await saveProduct();
            else if (editing.kind === "blog") await saveBlog();
            else if (editing.kind === "testimonial") await saveTestimonial();
            setEditing(null);
            load();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Save failed");
        }
    };

    // ----- Orders -----
    const safeCopy = async (text) => {
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (e) {
            // permission denied or unavailable
        }
        try {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            return true;
        } catch {
            return false;
        }
    };
    const reissue = async (orderId) => {
        try {
            const { data } = await api.post(`/admin/orders/${orderId}/reissue`);
            toast.success("New download link generated");
            load();
            const link = `${API}/download/${data.download_token}`;
            const ok = await safeCopy(link);
            toast(ok ? `Copied to clipboard: ${link}` : `Link: ${link}`, { duration: 8000 });
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Could not reissue");
        }
    };
    const copyLink = async (token) => {
        const link = `${API}/download/${token}`;
        const ok = await safeCopy(link);
        if (ok) toast.success("Download link copied");
        else toast(`Link: ${link}`, { duration: 8000 });
    };

    const tabs = [
        { k: "products", label: `Products (${products.length})` },
        { k: "orders", label: `Orders (${orders.length})` },
        { k: "blog", label: `Journal (${posts.length})` },
        { k: "testimonials", label: `Testimonials (${testimonials.length})` },
        { k: "contacts", label: `Messages (${contacts.length})` },
        { k: "bookings", label: `Bookings (${bookings.length})` },
    ];

    return (
        <div className="min-h-screen bg-bloom-cream">
            <header className="bg-white border-b border-bloom-border sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Logo size={40} showText={false} />
                        <div>
                            <div className="font-serif text-xl text-bloom-cocoa">Admin Dashboard</div>
                            <div className="text-xs text-bloom-muted">Manage your site, content & orders</div>
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
                <div className="max-w-7xl mx-auto px-6 flex gap-1 border-t border-bloom-border overflow-x-auto">
                    {tabs.map((t) => (
                        <button
                            key={t.k}
                            onClick={() => setTab(t.k)}
                            data-testid={`admin-tab-${t.k}`}
                            className={`px-5 py-3 text-sm whitespace-nowrap border-b-2 transition-all ${
                                tab === t.k ? "border-bloom-cocoa text-bloom-cocoa" : "border-transparent text-bloom-text2 hover:text-bloom-cocoa"
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
                    <ProductsTab
                        products={products}
                        onNew={() => openProduct(null)}
                        onEdit={(id) => openProduct(id)}
                        onDelete={deleteProduct}
                        onUpload={uploadFile}
                    />
                ) : tab === "orders" ? (
                    <OrdersTab orders={orders} onReissue={reissue} onCopy={copyLink} />
                ) : tab === "blog" ? (
                    <BlogTab posts={posts} onNew={() => openBlog(null)} onEdit={(id) => openBlog(id)} onDelete={deleteBlog} />
                ) : tab === "testimonials" ? (
                    <TestimonialsTab items={testimonials} onNew={() => openTestimonial(null)} onEdit={(id) => openTestimonial(id)} onDelete={deleteTestimonial} />
                ) : tab === "contacts" ? (
                    <MessagesTab items={contacts} />
                ) : (
                    <BookingsTab items={bookings} />
                )}
            </main>

            {editing && (
                <Modal onClose={() => setEditing(null)} onSubmit={handleSave} title={modalTitle(editing)}>
                    {editing.kind === "product" && <ProductForm form={form} setForm={setForm} />}
                    {editing.kind === "blog" && <BlogForm form={form} setForm={setForm} />}
                    {editing.kind === "testimonial" && <TestimonialForm form={form} setForm={setForm} />}
                </Modal>
            )}
        </div>
    );
};

const modalTitle = (e) => {
    const isNew = e.id === "new";
    if (e.kind === "product") return isNew ? "New product" : "Edit product";
    if (e.kind === "blog") return isNew ? "New article" : "Edit article";
    if (e.kind === "testimonial") return isNew ? "New testimonial" : "Edit testimonial";
    return "";
};

// ===== Tabs =====
const ProductsTab = ({ products, onNew, onEdit, onDelete, onUpload }) => (
    <>
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-3xl text-bloom-cocoa">Products</h2>
            <button onClick={onNew} data-testid="admin-new-product" className="inline-flex items-center gap-2 bg-bloom-cocoa text-white rounded-full px-5 py-2.5 text-sm hover:bg-bloom-cocoa-hover transition-all">
                <Plus size={16} /> New product
            </button>
        </div>
        <div className="bg-white border border-bloom-border rounded-2xl overflow-hidden overflow-x-auto">
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
                                        <input type="file" className="hidden" onChange={(e) => onUpload(p.id, e.target.files[0])} data-testid={`admin-upload-${p.id}`} />
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
                                        <input type="file" className="hidden" onChange={(e) => onUpload(p.id, e.target.files[0])} />
                                    </label>
                                    <button onClick={() => onEdit(p.id)} className="p-2 rounded-lg border border-bloom-border hover:bg-bloom-cream" data-testid={`admin-edit-${p.id}`}>
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => onDelete(p.id)} className="p-2 rounded-lg border border-bloom-border hover:bg-red-50 hover:text-red-600" data-testid={`admin-delete-${p.id}`}>
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
);

const OrdersTab = ({ orders, onReissue, onCopy }) => (
    <>
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-3xl text-bloom-cocoa">Orders</h2>
            <div className="text-sm text-bloom-text2">
                {orders.filter((o) => o.payment_status === "paid").length} paid · {orders.length} total
            </div>
        </div>
        {orders.length === 0 ? (
            <div className="text-bloom-text2">No orders yet.</div>
        ) : (
            <div className="bg-white border border-bloom-border rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-bloom-cream-muted text-left text-xs tracking-[0.15em] uppercase text-bloom-text2">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Product</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-bloom-border">
                        {orders.map((o) => {
                            const paid = o.payment_status === "paid";
                            return (
                                <tr key={o.id} data-testid={`admin-order-row-${o.id}`}>
                                    <td className="p-4 text-bloom-text2 whitespace-nowrap">
                                        {new Date(o.created_at).toLocaleDateString()}<br />
                                        <span className="text-xs text-bloom-muted">{new Date(o.created_at).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="p-4 text-bloom-cocoa">{o.email}</td>
                                    <td className="p-4 text-bloom-text2">{o.product_name}</td>
                                    <td className="p-4 text-bloom-cocoa font-medium">${Number(o.amount).toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${paid ? "bg-bloom-sage/20 text-bloom-sage" : "bg-bloom-cream-muted text-bloom-muted"}`}>
                                            {o.payment_status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="inline-flex gap-2">
                                            {paid && o.download_token && (
                                                <>
                                                    <button onClick={() => onCopy(o.download_token)} className="p-2 rounded-lg border border-bloom-border hover:bg-bloom-cream" title="Copy download link" data-testid={`admin-order-copy-${o.id}`}>
                                                        <Copy size={14} />
                                                    </button>
                                                    <a href={`${API}/download/${o.download_token}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-bloom-border hover:bg-bloom-cream" title="Open download">
                                                        <ExternalLink size={14} />
                                                    </a>
                                                </>
                                            )}
                                            {paid && (
                                                <button onClick={() => onReissue(o.id)} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-bloom-border hover:bg-bloom-cream text-xs" title="Reissue download link" data-testid={`admin-order-reissue-${o.id}`}>
                                                    <RefreshCw size={13} /> Reissue
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
    </>
);

const BlogTab = ({ posts, onNew, onEdit, onDelete }) => (
    <>
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-3xl text-bloom-cocoa">Journal</h2>
            <button onClick={onNew} data-testid="admin-new-blog" className="inline-flex items-center gap-2 bg-bloom-cocoa text-white rounded-full px-5 py-2.5 text-sm hover:bg-bloom-cocoa-hover transition-all">
                <Plus size={16} /> New article
            </button>
        </div>
        {posts.length === 0 ? (
            <div className="text-bloom-text2">No articles yet.</div>
        ) : (
            <div className="grid md:grid-cols-2 gap-4">
                {posts.map((p) => (
                    <div key={p.id} className="bg-white border border-bloom-border rounded-2xl p-5 flex gap-4" data-testid={`admin-blog-row-${p.id}`}>
                        <div className="w-24 h-24 rounded-xl bg-bloom-cream-muted overflow-hidden flex-shrink-0">
                            {p.cover_image && <img src={p.cover_image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`text-[10px] tracking-[0.2em] uppercase ${p.is_published ? "text-bloom-sage" : "text-bloom-muted"}`}>
                                {p.is_published ? "Published" : "Draft"}
                            </div>
                            <div className="font-serif text-lg text-bloom-cocoa mt-1 truncate">{p.title}</div>
                            <div className="text-xs text-bloom-muted">/blog/{p.slug}</div>
                            <p className="text-sm text-bloom-text2 mt-1 line-clamp-2">{p.excerpt}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => onEdit(p.id)} className="p-2 rounded-lg border border-bloom-border hover:bg-bloom-cream" data-testid={`admin-blog-edit-${p.id}`}>
                                <Edit2 size={14} />
                            </button>
                            <button onClick={() => onDelete(p.id)} className="p-2 rounded-lg border border-bloom-border hover:bg-red-50 hover:text-red-600" data-testid={`admin-blog-delete-${p.id}`}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </>
);

const TestimonialsTab = ({ items, onNew, onEdit, onDelete }) => (
    <>
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-3xl text-bloom-cocoa">Testimonials</h2>
            <button onClick={onNew} data-testid="admin-new-testimonial" className="inline-flex items-center gap-2 bg-bloom-cocoa text-white rounded-full px-5 py-2.5 text-sm hover:bg-bloom-cocoa-hover transition-all">
                <Plus size={16} /> New testimonial
            </button>
        </div>
        {items.length === 0 ? (
            <div className="text-bloom-text2">No testimonials yet.</div>
        ) : (
            <div className="grid md:grid-cols-2 gap-4">
                {items.map((t) => (
                    <div key={t.id} className="bg-white border border-bloom-border rounded-2xl p-6" data-testid={`admin-testimonial-row-${t.id}`}>
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <div className={`text-[10px] tracking-[0.2em] uppercase ${t.is_published ? "text-bloom-sage" : "text-bloom-muted"}`}>
                                    {t.is_published ? `Published · order ${t.sort_order}` : "Hidden"}
                                </div>
                                <p className="mt-2 font-serif italic text-base text-bloom-cocoa leading-snug">"{t.quote}"</p>
                                <div className="mt-3 text-sm text-bloom-text2">
                                    <strong className="text-bloom-cocoa">{t.name}</strong>{t.role ? ` · ${t.role}` : ""}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                                <button onClick={() => onEdit(t.id)} className="p-2 rounded-lg border border-bloom-border hover:bg-bloom-cream" data-testid={`admin-testimonial-edit-${t.id}`}>
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => onDelete(t.id)} className="p-2 rounded-lg border border-bloom-border hover:bg-red-50 hover:text-red-600" data-testid={`admin-testimonial-delete-${t.id}`}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </>
);

const MessagesTab = ({ items }) => (
    <div className="space-y-4">
        <h2 className="font-serif text-3xl text-bloom-cocoa">Contact Messages</h2>
        {items.length === 0 && <div className="text-bloom-text2">No messages yet.</div>}
        {items.map((m) => (
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
);

const BookingsTab = ({ items }) => (
    <div className="space-y-4">
        <h2 className="font-serif text-3xl text-bloom-cocoa">Booking Requests</h2>
        {items.length === 0 && <div className="text-bloom-text2">No bookings yet.</div>}
        {items.map((b) => (
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
);

// ===== Modal & Forms =====
const Modal = ({ onClose, onSubmit, title, children }) => (
    <div className="fixed inset-0 z-50 bg-bloom-cocoa/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
        <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={onSubmit}
            className="bg-white rounded-[1.75rem] w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto relative"
            data-testid="admin-modal"
        >
            <button type="button" onClick={onClose} className="absolute top-4 right-4 text-bloom-text2 hover:text-bloom-cocoa">
                <X size={20} />
            </button>
            <h3 className="font-serif text-2xl text-bloom-cocoa mb-5">{title}</h3>
            <div className="space-y-4">{children}</div>
            <div className="flex gap-3 pt-6">
                <button type="submit" className="inline-flex items-center bg-bloom-cocoa text-white rounded-full px-6 py-3 text-sm hover:bg-bloom-cocoa-hover transition-all" data-testid="admin-form-save">
                    Save
                </button>
                <button type="button" onClick={onClose} className="inline-flex items-center border border-bloom-border text-bloom-cocoa rounded-full px-6 py-3 text-sm">
                    Cancel
                </button>
            </div>
        </form>
    </div>
);

const ProductForm = ({ form, setForm }) => (
    <>
        <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={ic} data-testid="admin-form-name" /></Field>
        <Field label="Description"><textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={ic + " resize-none"} data-testid="admin-form-description" /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Price (USD)"><input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={ic} data-testid="admin-form-price" /></Field>
            <Field label="Category"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={ic} data-testid="admin-form-category" /></Field>
        </div>
        <Field label="Image URL (optional)"><input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={ic} placeholder="https://…" data-testid="admin-form-image" /></Field>
        <CheckboxField checked={!!form.is_published} onChange={(v) => setForm({ ...form, is_published: v })} label="Published (visible on shop)" testid="admin-form-published" />
    </>
);

const BlogForm = ({ form, setForm }) => (
    <>
        <Field label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={ic} data-testid="admin-blog-title" /></Field>
        <Field label="Slug (URL)"><input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} className={ic} placeholder="five-gentle-ways" data-testid="admin-blog-slug" /></Field>
        <Field label="Excerpt"><textarea required rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={ic + " resize-none"} data-testid="admin-blog-excerpt" /></Field>
        <Field label="Content (use **bold** for emphasis, blank line for new paragraph)">
            <textarea required rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={ic + " resize-none font-mono text-xs"} data-testid="admin-blog-content" />
        </Field>
        <Field label="Cover image URL"><input value={form.cover_image || ""} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} className={ic} placeholder="https://…" data-testid="admin-blog-cover" /></Field>
        <Field label="Author"><input value={form.author || ""} onChange={(e) => setForm({ ...form, author: e.target.value })} className={ic} data-testid="admin-blog-author" /></Field>
        <CheckboxField checked={!!form.is_published} onChange={(v) => setForm({ ...form, is_published: v })} label="Published" testid="admin-blog-published" />
    </>
);

const TestimonialForm = ({ form, setForm }) => (
    <>
        <Field label="Quote"><textarea required rows={4} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className={ic + " resize-none"} data-testid="admin-testimonial-quote" /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={ic} data-testid="admin-testimonial-name" /></Field>
            <Field label="Role / context"><input value={form.role || ""} onChange={(e) => setForm({ ...form, role: e.target.value })} className={ic} data-testid="admin-testimonial-role" /></Field>
        </div>
        <Field label="Image URL (optional)"><input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={ic} data-testid="admin-testimonial-image" /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Rating (1-5)"><input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className={ic} data-testid="admin-testimonial-rating" /></Field>
            <Field label="Sort order"><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className={ic} data-testid="admin-testimonial-sort" /></Field>
        </div>
        <CheckboxField checked={!!form.is_published} onChange={(v) => setForm({ ...form, is_published: v })} label="Published" testid="admin-testimonial-published" />
    </>
);

const ic = "w-full bg-white border border-bloom-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bloom-sage text-sm";
const Field = ({ label, children }) => (
    <label className="block">
        <span className="block text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-bloom-sage mb-1.5">{label}</span>
        {children}
    </label>
);
const CheckboxField = ({ checked, onChange, label, testid }) => (
    <label className="flex items-center gap-2 text-sm text-bloom-text2">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} data-testid={testid} />
        {label}
    </label>
);

export default AdminDashboard;
