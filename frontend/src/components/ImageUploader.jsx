import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { api, API } from "../lib/api";
import { Upload, Image as ImageIcon, X } from "lucide-react";

/**
 * Lets admin upload an image; returns the public URL via onChange(url).
 * Shows preview if value is set. Falls back to manual URL entry.
 */
const ImageUploader = ({ value, onChange, label = "Image", testid = "image-uploader" }) => {
    const inputRef = useRef(null);
    const [busy, setBusy] = useState(false);

    const upload = async (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            toast.error("Image must be under 8 MB");
            return;
        }
        setBusy(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const { data } = await api.post("/admin/uploads/image", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            // Use full URL so it works in admin and on public pages
            const fullUrl = `${API}${data.url.replace(/^\/api/, "")}`;
            onChange(fullUrl);
            toast.success("Image uploaded");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Upload failed");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div data-testid={testid}>
            <span className="block text-[11px] font-sans font-semibold tracking-[0.2em] uppercase text-bloom-sage mb-1.5">{label}</span>

            {value ? (
                <div className="relative group">
                    <div className="aspect-[16/9] rounded-xl overflow-hidden border border-bloom-border bg-bloom-cream-muted">
                        <img src={value} alt="preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            data-testid={`${testid}-replace`}
                            className="bg-white/95 text-bloom-cocoa text-xs px-3 py-1.5 rounded-full shadow-sm hover:bg-white"
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            data-testid={`${testid}-remove`}
                            className="bg-white/95 text-bloom-cocoa rounded-full p-1.5 shadow-sm hover:bg-white"
                            title="Remove"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                    data-testid={`${testid}-pick`}
                    className="w-full flex items-center justify-center gap-3 bg-bloom-cream-muted border border-dashed border-bloom-border rounded-xl py-8 text-sm text-bloom-text2 hover:bg-bloom-cream hover:text-bloom-cocoa transition-all"
                >
                    {busy ? (
                        <>
                            <span className="w-4 h-4 rounded-full border-2 border-bloom-sage border-t-transparent animate-spin" />
                            Uploading…
                        </>
                    ) : (
                        <>
                            <Upload size={16} />
                            Upload image (JPG / PNG, ≤ 8 MB)
                        </>
                    )}
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => upload(e.target.files?.[0])}
                data-testid={`${testid}-input`}
            />

            <details className="mt-2">
                <summary className="text-[11px] text-bloom-muted cursor-pointer">…or paste a URL</summary>
                <input
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://…"
                    data-testid={`${testid}-url`}
                    className="mt-2 w-full bg-white border border-bloom-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-bloom-sage"
                />
            </details>
        </div>
    );
};

export default ImageUploader;
