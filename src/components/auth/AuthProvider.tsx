'use client';

import { createContext, useContext, ReactNode } from 'react';
import { User } from '@/lib/auth';
import { useAuth as useAuthHook } from '@/hooks/useAuth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isAlexcab24: boolean;
    login: (username: string, password: string) => Promise<User>;
    logout: () => void;
    loading: boolean;
    mounted: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { user, isAuthenticated, isAdmin, isAlexcab24, login, logout, loading, mounted } = useAuthHook();

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isAdmin,
        isAlexcab24,
        login,
        logout,
        loading,
        mounted
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
