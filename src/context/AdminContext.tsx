import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
    isAdmin: boolean;
    adminToken: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_TOKEN_KEY = 'admin_token';

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const [adminToken, setAdminToken] = useState<string | null>(() => {
        return localStorage.getItem(ADMIN_TOKEN_KEY);
    });

    const login = (token: string) => {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
        setAdminToken(token);
    };

    const logout = () => {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        setAdminToken(null);
    };

    // Auto-logout when token expires
    useEffect(() => {
        if (adminToken) {
            try {
                const payload = JSON.parse(atob(adminToken.split('.')[1]));
                const expiryTime = payload.exp * 1000; // Convert to milliseconds
                
                if (Date.now() >= expiryTime) {
                    logout();
                } else {
                    // Set timeout to logout when token expires
                    const timeout = setTimeout(logout, expiryTime - Date.now());
                    return () => clearTimeout(timeout);
                }
            } catch (error) {
                console.error('Error parsing admin token:', error);
                logout();
            }
        }
    }, [adminToken]);

    return (
        <AdminContext.Provider
            value={{
                isAdmin: !!adminToken,
                adminToken,
                login,
                logout,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
