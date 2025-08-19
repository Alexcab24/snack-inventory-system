'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { clsx } from 'clsx';
import {
    Package,
    Users,
    ShoppingCart,
    CreditCard,
    Menu,
    X,
    // BarChart3,
} from 'lucide-react';

const navigation = [
    { name: 'Snacks', href: '/snacks', icon: Package },
    { name: 'Personas', href: '/people', icon: Users },
    { name: 'Ventas', href: '/sales', icon: ShoppingCart },
    { name: 'Deudas', href: '/debts', icon: CreditCard },
    // { name: 'Reportes', href: '/reports', icon: BarChart3 },
];

export function Navigation() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="relative">
            {/* Mobile menu button */}
            <div className="lg:hidden">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    {isMobileMenuOpen ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                'flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative group btn-hover',
                                isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50 hover:shadow-md'
                            )}
                        >
                            <item.icon className={clsx(
                                'mr-2 h-4 w-4 transition-colors',
                                isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-700'
                            )} />
                            {item.name}
                            {isActive && (
                                <div className="absolute inset-0 bg-blue-600 rounded-xl pulse-active opacity-20"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Mobile Navigation Menu */}
            <div className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 lg:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-2 scale-95 pointer-events-none'
                }`}>
                <div className="py-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={clsx(
                                    'flex items-center px-4 py-3 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                )}
                            >
                                <item.icon className={clsx(
                                    'mr-3 h-5 w-5',
                                    isActive ? 'text-blue-600' : 'text-gray-500'
                                )} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
