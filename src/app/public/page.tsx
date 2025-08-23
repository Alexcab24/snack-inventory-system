'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Package, Search, LogIn } from 'lucide-react';
import { snackApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import type { Snack } from '@/types';

export default function PublicSnacksPage() {
    const [snacks, setSnacks] = useState<Snack[]>([]);
    const [filteredSnacks, setFilteredSnacks] = useState<Snack[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadSnacks();
    }, []);

    useEffect(() => {
        // Filter snacks based on search term
        const filtered = snacks.filter(snack =>
            snack.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSnacks(filtered);
    }, [snacks, searchTerm]);

    const loadSnacks = async () => {
        try {
            setLoading(true);
            const data = await snackApi.getAll();
            // Only show snacks with stock > 0
            const availableSnacks = data.filter(snack => snack.stock > 0);
            setSnacks(availableSnacks);
        } catch (error) {
            toast.error('Error al cargar snacks');
            console.error('Error loading snacks:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
                <div className="loading-spinner rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            {/* Header */}
            <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-sm sm:text-lg">S</span>
                            </div>
                            <div className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">
                                <span className="hidden sm:inline">Snack Management System</span>
                                <span className="sm:hidden">SMS</span>
                            </div>
                        </div>
                        <Link href="/login">
                            <Button className="shadow-lg">
                                <LogIn className="h-4 w-4 mr-2" />
                                Acceso Administrativo
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Hero Section */}
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl mb-6">
                            <Package className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                            Snacks Disponibles
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Explora nuestra selección de snacks frescos y deliciosos.
                            Todos nuestros productos están disponibles para la venta.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar snacks..."
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Snacks Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSnacks.map((snack) => (
                            <Card key={snack.id_snack} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                            <Package className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                            {snack.name}
                                        </h3>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Stock Status */}
                                    <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg border border-green-200">
                                        <span className="text-green-700 text-sm font-medium">Stock Disponible:</span>
                                        <span className="font-bold text-lg text-green-600">
                                            {snack.stock} unidades
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <span className="text-blue-700 text-sm font-medium">Precio por Unidad:</span>
                                        <span className="font-bold text-lg text-blue-600">
                                            {formatCurrency(snack.unit_sale_price)}
                                        </span>
                                    </div>

                                    {/* Purchase Type */}
                                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                        <span className="text-slate-600 text-sm font-medium">Tipo:</span>
                                        <span className="font-bold text-slate-900">
                                            {snack.purchase_type === 'box' ? 'Caja' : 'Funda'}
                                        </span>
                                    </div>
                                </div>

                                {/* Call to Action */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="text-center">
                                        <span className="text-sm text-slate-500">
                                            Disponible para compra
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredSnacks.length === 0 && !loading && (
                        <Card className="text-center py-12">
                            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {searchTerm ? 'No se encontraron snacks' : 'No hay snacks disponibles'}
                            </h3>
                            <p className="text-slate-600">
                                {searchTerm
                                    ? 'Intenta con otro término de búsqueda'
                                    : 'Pronto tendremos nuevos snacks disponibles'
                                }
                            </p>
                        </Card>
                    )}

                    {/* Footer Info */}
                    <div className="text-center space-y-4">
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                ¿Necesitas acceso administrativo?
                            </h3>
                            <p className="text-slate-600 mb-4">
                                Para gestionar inventario, ventas y reportes, contacta al administrador del sistema.
                            </p>
                            <Link href="/login">
                                <Button className="shadow-lg">
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Acceso Administrativo
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
