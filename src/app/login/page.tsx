'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { auth } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        // If user is already logged in, redirect to main page
        if (auth.isAuthenticated()) {
            router.push('/');
        }
    }, [router]);

    const handleLoginSuccess = () => {
        // Redirect to admin dashboard after successful login
        router.push('/');
    };

    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
}
