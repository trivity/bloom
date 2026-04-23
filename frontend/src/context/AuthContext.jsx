import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("bloom_token");
        if (!token) {
            setLoading(false);
            return;
        }
        api
            .get("/auth/me")
            .then((r) => setUser(r.data))
            .catch(() => localStorage.removeItem("bloom_token"))
            .finally(() => setLoading(false));
    }, []);

    const login = async (username, password) => {
        const { data } = await api.post("/auth/login", { username, password });
        localStorage.setItem("bloom_token", data.token);
        setUser({ username: data.username });
        return data;
    };

    const logout = () => {
        localStorage.removeItem("bloom_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
