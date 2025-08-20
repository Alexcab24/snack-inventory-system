'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Package,
    Users,
    ShoppingCart,
    RefreshCw
} from 'lucide-react';
import { reportsApi, snackApi, personApi, saleApi, debtApi } from '@/lib/api';
import type { Reports, Snack, Person, Sale, Debt } from '@/types';

export default function ReportsPage() {
    const [reports, setReports] = useState<Reports | null>(null);
    const [snacks, setSnacks] = useState<Snack[]>([]);
    const [people, setPeople] = useState<Person[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [reportsData, snacksData, peopleData, salesData, debtsData] = await Promise.all([
                reportsApi.getReports(),
                snackApi.getAll(),
                personApi.getAll(),
                saleApi.getAll(),
                debtApi.getAll(),
            ]);
            setReports(reportsData);
            setSnacks(snacksData);
            setPeople(peopleData);
            setSales(salesData);
            setDebts(debtsData);
        } catch (error) {
            toast.error('Error al cargar reportes');
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getTopSellingSnacks = () => {
        const snackSales = sales.reduce((acc, sale) => {
            const snackName = sale.snack?.name || 'Desconocido';
            acc[snackName] = (acc[snackName] || 0) + sale.quantity;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(snackSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    };

    const getTopCustomers = () => {
        const customerSales = sales.reduce((acc, sale) => {
            const customerName = sale.person?.name || 'Desconocido';
            acc[customerName] = (acc[customerName] || 0) + sale.total;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(customerSales)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading-spinner rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
        );
    }

    if (!reports) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No hay datos disponibles para reportes.</p>
            </div>
        );
    }

    const topSellingSnacks = getTopSellingSnacks();
    const topCustomers = getTopCustomers();
    const unpaidDebts = debts.filter(debt => debt.paid === 'pending');

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Reportes y Análisis</h1>
                    <p className="text-slate-600">Información completa del negocio y resúmenes financieros</p>
                </div>
                <Button
                    onClick={loadData}
                    variant="secondary"
                    className="shadow-lg w-full sm:w-auto"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar Datos
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 card-grid">
                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <DollarSign className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Inversión Total</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(reports.total_investment)}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(reports.total_sales)}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${reports.total_profit >= 0 ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                {reports.total_profit >= 0 ? (
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                ) : (
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Ganancia Total</p>
                            <p className={`text-2xl font-bold ${reports.total_profit >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {formatCurrency(reports.total_profit)}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Deudas Pendientes</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(reports.total_debts)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Summary Cards */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Snacks totales</span>
                            </div>
                            <span className="font-semibold">{snacks.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Personas totales</span>
                            </div>
                            <span className="font-semibold">{people.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <ShoppingCart className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Ventas totales</span>
                            </div>
                            <span className="font-semibold">{sales.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">Deudas pendientes</span>
                            </div>
                            <span className="font-semibold">{unpaidDebts.length}</span>
                        </div>
                    </div>
                </Card>

                {/* Top Selling Snacks */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Snacks más vendidos</h3>
                    {topSellingSnacks.length > 0 ? (
                        <div className="space-y-3">
                            {topSellingSnacks.map(([snackName, quantity], index) => (
                                <div key={snackName} className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                        <span className="text-gray-900">{snackName}</span>
                                    </div>
                                    <span className="font-semibold">{quantity} vendidos</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No hay datos de ventas disponibles</p>
                    )}
                </Card>

                {/* Top Customers */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Mejores clientes</h3>
                    {topCustomers.length > 0 ? (
                        <div className="space-y-3">
                            {topCustomers.map(([customerName, total], index) => (
                                <div key={customerName} className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                        <span className="text-gray-900">{customerName}</span>
                                    </div>
                                    <span className="font-semibold">{formatCurrency(total)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No hay datos de clientes disponibles</p>
                    )}
                </Card>

                {/* Profit Analysis */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de ganancias</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Margen de ganancia</span>
                            <span className={`font-semibold ${reports.total_profit >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {reports.total_investment > 0
                                    ? ((reports.total_profit / reports.total_investment) * 100).toFixed(1)
                                    : '0'
                                }%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Valor promedio de venta</span>
                            <span className="font-semibold">
                                {sales.length > 0
                                    ? formatCurrency(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length)
                                    : formatCurrency(0)
                                }
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Tasa de deuda</span>
                            <span className="font-semibold">
                                {sales.length > 0
                                    ? ((unpaidDebts.length / sales.length) * 100).toFixed(1)
                                    : '0'
                                }%
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
