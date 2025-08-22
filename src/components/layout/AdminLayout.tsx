'use client';

import Link from 'next/link';
import { Navigation } from './Navigation';

interface AdminLayoutProps {
    children: React.ReactNode;
    loading?: boolean;
}

export function AdminLayout({ children, loading = false }: AdminLayoutProps) {
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
                <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-sm sm:text-lg">S</span>
                                </div>
                                <Link href={'/'} className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 truncate">
                                    <span className="hidden sm:inline">Snack Management System</span>
                                    <span className="sm:hidden">SMS</span>
                                </Link>
                            </div>
                            <Navigation />
                        </div>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="loading-spinner rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-sm sm:text-lg">S</span>
                            </div>
                            <Link href={'/'} className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 truncate">
                                <span className="hidden sm:inline">Snack Management System</span>
                                <span className="sm:hidden">SMS</span>
                            </Link>
                        </div>
                        <Navigation />
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
