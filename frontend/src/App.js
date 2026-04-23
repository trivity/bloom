import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import Shop from "./pages/Shop";
import ShopDetail from "./pages/ShopDetail";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

import "@/App.css";

const ScrollToTop = () => {
    const { pathname } = useLocation();
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);
    return null;
};

const PublicLayout = ({ children }) => (
    <div className="min-h-screen flex flex-col bg-bloom-cream">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
    </div>
);

const RequireAdmin = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="p-20 text-center text-bloom-text2">Loading…</div>;
    if (!user) return <Navigate to="/admin/login" replace />;
    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ScrollToTop />
                <Toaster position="top-center" richColors />
                <Routes>
                    <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                    <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                    <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
                    <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                    <Route path="/booking" element={<PublicLayout><Booking /></PublicLayout>} />
                    <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
                    <Route path="/shop/:id" element={<PublicLayout><ShopDetail /></PublicLayout>} />
                    <Route path="/checkout/success" element={<PublicLayout><CheckoutSuccess /></PublicLayout>} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route
                        path="/admin"
                        element={
                            <RequireAdmin>
                                <AdminDashboard />
                            </RequireAdmin>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
