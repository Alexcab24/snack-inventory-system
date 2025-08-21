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
import { reportsApi, snackApi, personApi, saleApi, debtApi, logApi } from '@/lib/api';
import type { Reports, Snack, Person, Sale, Debt, ActivityLog } from '@/types';

export default function ReportsPage() {
    const [reports, setReports] = useState<Reports | null>(null);
    const [snacks, setSnacks] = useState<Snack[]>([]);
    const [people, setPeople] = useState<Person[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loading, setLoading] = useState(true);
    const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);

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
            // Fetch logs separately so missing table or errors don't break reports
            try {
                const logs = await logApi.getAll();
                setRecentLogs(logs.slice(0, 10));
            } catch (logsError) {
                console.warn('Activity logs not available:', logsError);
                setRecentLogs([]);
            }
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
        console.log('Sales data for top selling snacks:', sales);

        const snackSales = sales.reduce((acc, sale) => {
            console.log('Processing sale:', sale);
            console.log('Sale items:', sale.items);

            // Process each item in the sale
            sale.items?.forEach(item => {
                console.log('Processing item:', item);
                const snackName = item.snack?.name || 'Desconocido';
                acc[snackName] = (acc[snackName] || 0) + item.quantity;
            });
            return acc;
        }, {} as Record<string, number>);

        console.log('Final snack sales:', snackSales);

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
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Cargando...' : 'Actualizar Datos'}
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Investment Card */}
                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <DollarSign className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-indigo-600">Inversión Total</p>
                            <p className="text-2xl font-bold text-indigo-900">
                                {formatCurrency(reports.total_investment)}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Sales Card */}
                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <TrendingUp className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-emerald-600">Ventas Totales</p>
                            <p className="text-2xl font-bold text-emerald-900">
                                {formatCurrency(reports.total_sales)}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Profit Card */}
                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ${reports.total_profit >= 0
                                ? 'bg-gradient-to-br from-green-500 to-green-600'
                                : 'bg-gradient-to-br from-red-500 to-red-600'
                                }`}>
                                {reports.total_profit >= 0 ? (
                                    <TrendingUp className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300" />
                                ) : (
                                    <TrendingDown className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300" />
                                )}
                            </div>
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${reports.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Ganancia Total
                            </p>
                            <p className={`text-2xl font-bold ${reports.total_profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {formatCurrency(reports.total_profit)}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Debts Card */}
                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                            <div className="h-14 w-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <CreditCard className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-rose-600">Deudas Pendientes</p>
                            <p className="text-2xl font-bold text-rose-900">
                                {formatCurrency(reports.total_debts)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Summary Cards */}
                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumen</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-blue-500" />
                                <span className="text-slate-700">Snacks totales</span>
                            </div>
                            <span className="font-semibold text-blue-600">{snacks.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-emerald-500" />
                                <span className="text-slate-700">Personas totales</span>
                            </div>
                            <span className="font-semibold text-emerald-600">{people.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <ShoppingCart className="h-4 w-4 text-purple-500" />
                                <span className="text-slate-700">Ventas totales</span>
                            </div>
                            <span className="font-semibold text-purple-600">{sales.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <CreditCard className="h-4 w-4 text-rose-500" />
                                <span className="text-slate-700">Deudas pendientes</span>
                            </div>
                            <span className="font-semibold text-rose-600">{unpaidDebts.length}</span>
                        </div>
                    </div>
                </Card>

                {/* Top Selling Snacks */}
                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Snacks más vendidos</h3>
                    {topSellingSnacks.length > 0 ? (
                        <div className="space-y-3">
                            {topSellingSnacks.map(([snackName, quantity], index) => (
                                <div key={snackName} className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-orange-500">#{index + 1}</span>
                                        <span className="text-slate-800">{snackName}</span>
                                    </div>
                                    <span className="font-semibold text-orange-600">{quantity} vendidos</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500">No hay datos de ventas disponibles</p>
                    )}
                </Card>

                {/* Top Customers */}
                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Mejores clientes</h3>
                    {topCustomers.length > 0 ? (
                        <div className="space-y-3">
                            {topCustomers.map(([customerName, total], index) => (
                                <div key={customerName} className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-purple-500">#{index + 1}</span>
                                        <span className="text-slate-800">{customerName}</span>
                                    </div>
                                    <span className="font-semibold text-purple-600">{formatCurrency(total)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500">No hay datos de clientes disponibles</p>
                    )}
                </Card>

                {/* Profit Analysis */}
                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Análisis de ganancias</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-700">Margen de ganancia</span>
                            <span className={`font-semibold ${reports.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {reports.total_investment > 0
                                    ? ((reports.total_profit / reports.total_investment) * 100).toFixed(1)
                                    : '0'
                                }%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-700">Valor promedio de venta</span>
                            <span className="font-semibold text-emerald-600">
                                {sales.length > 0
                                    ? formatCurrency(sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length)
                                    : formatCurrency(0)
                                }
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-700">Tasa de deuda</span>
                            <span className="font-semibold text-rose-600">
                                {sales.length > 0
                                    ? ((unpaidDebts.length / sales.length) * 100).toFixed(1)
                                    : '0'
                                }%
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Actividad reciente</h3>
                    {recentLogs.length > 0 ? (
                        <div className="space-y-3">
                            {recentLogs.map((log) => (
                                <div key={log.id_log} className="flex justify-between items-start">
                                    <div>
                                        <div className="text-sm font-semibold text-slate-800">
                                            {log.action.replace(/_/g, ' ')}
                                        </div>
                                        <div className="text-xs text-slate-600">
                                            {log.description || `${log.entity_type} ${log.entity_id || ''}`}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {new Date(log.created_at).toLocaleString('es-ES')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500">No hay actividad reciente.</p>
                    )}
                </Card>
            </div>
        </div>
    );
}
