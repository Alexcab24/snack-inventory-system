'use client';

import { useState, useEffect } from 'react';
import { auth, User } from '@/lib/auth';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check for existing session on mount
        const currentUser = auth.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
        console.log('Initial auth check:', currentUser);
    }, []);

    // Debug effect to log auth state changes
    useEffect(() => {
        console.log('Auth state changed:', { user, isAuthenticated: !!user });
    }, [user]);

    const login = async (username: string, password: string): Promise<User> => {
        const user = await auth.login(username, password);
        setUser(user);
        console.log('Login successful, user set:', user);
        return user;
    };

    const logout = () => {
        auth.logout();
        setUser(null);
    };

    return {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isAlexcab24: user?.username === 'alexcab24',
        login,
        logout,
        loading,
        mounted
    };
}
