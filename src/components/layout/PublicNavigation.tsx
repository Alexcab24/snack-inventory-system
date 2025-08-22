'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LogIn } from 'lucide-react';

export function PublicNavigation() {
    return (
        <div className="flex items-center space-x-4">
            <Link href="/login">
                <Button className="shadow-lg">
                    <LogIn className="h-4 w-4 mr-2" />
                    Acceso Administrativo
                </Button>
            </Link>
        </div>
    );
}
