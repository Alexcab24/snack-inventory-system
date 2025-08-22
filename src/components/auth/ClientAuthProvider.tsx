'use client';

import { AuthProvider } from './AuthProvider';

interface ClientAuthProviderProps {
    children: React.ReactNode;
}

export function ClientAuthProvider({ children }: ClientAuthProviderProps) {
    return <AuthProvider>{children}</AuthProvider>;
}
