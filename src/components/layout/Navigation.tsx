'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
    Package,
    Users,
    ShoppingCart,
    CreditCard,
    Menu,
    X,
    BarChart3,
    History
} from 'lucide-react';

const navigation = [
    { name: 'Snacks', href: '/snacks', icon: Package },
    { name: 'Personas', href: '/people', icon: Users },
    { name: 'Ventas', href: '/sales', icon: ShoppingCart },
    { name: 'Deudas', href: '/debts', icon: CreditCard },
    { name: 'Reportes', href: '/reports', icon: BarChart3 },
    { name: 'Movimientos', href: '/movements', icon: History },
];

export function Navigation() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
                setIsMobileMenuOpen(false);
            }
        };

        // Close mobile menu on escape key
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        // Prevent body scroll when menu is open
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    return (
        <div className="relative mobile-menu-container">
            {/* Mobile menu button */}
            <div className="lg:hidden">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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

            {/* Mobile Navigation Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-16 bg-black bg-opacity-50 z-40 lg:hidden">
                    <div className="bg-white shadow-2xl border-b border-gray-200 transform transition-all duration-300 ease-out mobile-menu-enter">
                        {/* Menu Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                aria-label="Cerrar menú"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={clsx(
                                            'mobile-menu-item flex items-center px-6 py-4 text-base font-medium transition-all duration-200 relative group',
                                            isActive
                                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-r-4 border-blue-600'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                        )}
                                    >
                                        <item.icon className={clsx(
                                            'mr-4 h-6 w-6 transition-colors',
                                            isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'
                                        )} />
                                        <span className="flex-1">{item.name}</span>
                                        {isActive && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Menu Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 font-medium">Snack Management System</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
