'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { logApi, snackApi, personApi, saleApi, debtApi } from '@/lib/api';
import { useQueryParams, getPaginatedData, getTotalPages } from '@/lib/utils';
import { AdminLayout } from '@/components/layout/AdminLayout';
import type { ActivityLog, Snack, Person, Sale, Debt } from '@/types';
import { RefreshCw, History, Package, Users, ShoppingCart, CreditCard, Activity } from 'lucide-react';

export default function MovementsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [relatedData, setRelatedData] = useState<{
        snacks: Record<string, Snack>;
        people: Record<string, Person>;
        sales: Record<string, Sale>;
        debts: Record<string, Debt>;
    }>({ snacks: {}, people: {}, sales: {}, debts: {} });

    // Query params
    const { getParam, setMultipleParams } = useQueryParams();
    const searchTerm = getParam('search', '');
    const currentPage = parseInt(getParam('page', '1'));
    const pageSize = 12;

    const getEntityMeta = (entity: ActivityLog['entity_type']) => {
        switch (entity) {
            case 'snack':
                return { color: 'from-orange-500 to-orange-600', icon: Package };
            case 'person':
                return { color: 'from-emerald-500 to-emerald-600', icon: Users };
            case 'sale':
                return { color: 'from-purple-500 to-purple-600', icon: ShoppingCart };
            case 'debt':
                return { color: 'from-rose-500 to-rose-600', icon: CreditCard };
            default:
                return { color: 'from-slate-500 to-slate-600', icon: Activity };
        }
    };

    const getActionBadge = (action: string) => {
        const lower = action.toLowerCase();
        if (lower.includes('eliminad')) {
            return { color: 'bg-red-100 text-red-700 border-red-200', label: action.replace(/_/g, ' ') };
        }
        if (lower.includes('cread')) {
            return { color: 'bg-green-100 text-green-700 border-green-200', label: action.replace(/_/g, ' ') };
        }
        if (lower.includes('pagad')) {
            return { color: 'bg-green-100 text-green-700 border-green-200', label: action.replace(/_/g, ' ') };
        }
        if (lower.includes('abono') || lower.includes('actualiz')) {
            return { color: 'bg-blue-100 text-blue-700 border-blue-200', label: action.replace(/_/g, ' ') };
        }
        if (lower.includes('stock')) {
            return { color: 'bg-amber-100 text-amber-700 border-amber-200', label: action.replace(/_/g, ' ') };
        }
        return { color: 'bg-slate-100 text-slate-700 border-slate-200', label: action.replace(/_/g, ' ') };
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const [logsData, snacksData, peopleData, salesData, debtsData] = await Promise.all([
                logApi.getAll(),
                snackApi.getAll(),
                personApi.getAll(),
                saleApi.getAll(),
                debtApi.getAll(),
            ]);
            setLogs(logsData);

            // Create lookup maps for related data
            const snacksMap = snacksData.reduce((acc, snack) => {
                acc[snack.id_snack] = snack;
                return acc;
            }, {} as Record<string, Snack>);

            const peopleMap = peopleData.reduce((acc, person) => {
                acc[person.id_person] = person;
                return acc;
            }, {} as Record<string, Person>);

            const salesMap = salesData.reduce((acc, sale) => {
                acc[sale.id_sale] = sale;
                return acc;
            }, {} as Record<string, Sale>);

            const debtsMap = debtsData.reduce((acc, debt) => {
                acc[debt.id_debt] = debt;
                return acc;
            }, {} as Record<string, Debt>);

            setRelatedData({
                snacks: snacksMap,
                people: peopleMap,
                sales: salesMap,
                debts: debtsMap,
            });
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

    const getDetailedDescription = (log: ActivityLog) => {
        const { details } = log;
        if (!details) return log.description || '';

        switch (log.entity_type) {
            case 'snack':
                const snack = relatedData.snacks[log.entity_id || ''];
                if (log.action.includes('creado')) {
                    return `Snack "${snack?.name || 'N/A'}" agregado al inventario`;
                } else if (log.action.includes('actualizado')) {
                    return `Snack "${snack?.name || 'N/A'}" actualizado`;
                } else if (log.action.includes('eliminado')) {
                    return `Snack eliminado del inventario`;
                }
                break;

            case 'person':
                const person = relatedData.people[log.entity_id || ''];
                if (log.action.includes('creada')) {
                    return `Persona "${person?.name || 'N/A'}" registrada en el sistema`;
                } else if (log.action.includes('actualizada')) {
                    return `Datos de "${person?.name || 'N/A'}" actualizados`;
                } else if (log.action.includes('eliminada')) {
                    return `Persona eliminada del sistema`;
                }
                break;

            case 'sale':
                const sale = relatedData.sales[log.entity_id || ''];
                const salePerson = sale?.person_id ? relatedData.people[sale.person_id] : null;
                if (log.action.includes('creada')) {
                    const totalVal = (typeof details?.total === 'number') ? (details.total as number) : (typeof sale?.total === 'number' ? (sale.total as number) : 0);
                    const paidVal = (typeof details?.paid === 'number') ? (details.paid as number) : (typeof sale?.paid === 'number' ? (sale.paid as number) : 0);
                    const paid = paidVal === 1;
                    return `Venta por ${formatCurrency(totalVal)} a ${salePerson?.name || 'Cliente'}` + (paid ? ' (Pagada)' : ' (Pendiente)');
                } else if (log.action.includes('actualizada')) {
                    return `Venta actualizada - ${salePerson?.name || 'Cliente'}`;
                } else if (log.action.includes('eliminada')) {
                    return `Venta eliminada`;
                }
                break;

            case 'debt':
                const debt = relatedData.debts[log.entity_id || ''];
                const debtSale = debt?.id_sale ? relatedData.sales[debt.id_sale] : null;
                const debtPerson = debtSale?.person_id ? relatedData.people[debtSale.person_id] : null;
                if (log.action.includes('creada')) {
                    const amountVal = (typeof details?.amount === 'number') ? (details.amount as number) : (typeof debt?.amount === 'number' ? (debt.amount as number) : 0);
                    return `Deuda de ${formatCurrency(amountVal)} registrada para ${debtPerson?.name || 'Cliente'}`;
                } else if (log.action.includes('pagada')) {
                    return `Deuda de ${debtPerson?.name || 'Cliente'} marcada como pagada`;
                } else if (log.action.includes('abono')) {
                    const amountVal = typeof details?.amount === 'number' ? (details.amount as number) : 0;
                    return `Abono de ${formatCurrency(amountVal)} aplicado a deuda de ${debtPerson?.name || 'Cliente'}`;
                } else if (log.action.includes('eliminada')) {
                    return `Deuda eliminada`;
                }
                break;
        }

        return log.description || '';
    };

    const getAdditionalDetails = (log: ActivityLog) => {
        const { details } = log;
        if (!details) return null;

        switch (log.entity_type) {
            case 'snack':
                const snack = relatedData.snacks[log.entity_id || ''];
                if (snack) {
                    return (
                        <div className="text-xs text-slate-600 mt-1">
                            Stock: {snack.stock} unidades · Precio: {formatCurrency(snack.unit_sale_price)}
                        </div>
                    );
                }
                break;

            case 'sale':
                const sale = relatedData.sales[log.entity_id || ''];
                if (sale && details?.items) {
                    const items = details.items as Array<{ snack_id: string; quantity: number }>;
                    const itemDetails = items.map(item => {
                        const snack = relatedData.snacks[item.snack_id];
                        return `${snack?.name || 'N/A'} (${item.quantity})`;
                    }).join(', ');
                    return (
                        <div className="text-xs text-slate-600 mt-1">
                            Items: {itemDetails}
                        </div>
                    );
                }
                break;

            case 'debt':
                const debt = relatedData.debts[log.entity_id || ''];
                if (debt && log.action.includes('abono')) {
                    const amount = typeof details?.amount === 'number' ? (details.amount as number) : 0;
                    return (
                        <div className="text-xs text-slate-600 mt-1">
                            Abono: {formatCurrency(amount)} · Restante: {formatCurrency(debt.amount - (debt.amount_paid || 0))}
                        </div>
                    );
                }
                break;
        }

        return null;
    };

    const filteredLogs = searchTerm.trim()
        ? logs.filter((log) => {
            const haystack = [
                log.action,
                log.description || '',
                log.entity_type,
                log.entity_id || ''
            ]
                .join(' ')
                .toLowerCase();
            return haystack.includes(searchTerm.toLowerCase());
        })
        : logs;

    const paginated = getPaginatedData(filteredLogs, currentPage, pageSize);
    const totalPages = getTotalPages(filteredLogs.length, pageSize);

    return (
        <AdminLayout loading={loading}>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center">
                            <History className="h-7 w-7 mr-2 text-slate-700" />
                            Historial de Movimientos
                        </h1>
                        <p className="text-slate-600">Registro de todas las acciones del sistema</p>
                    </div>
                    <Button onClick={loadLogs} variant="secondary" className="shadow-lg w-full sm:w-auto" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Cargando...' : 'Actualizar'}
                    </Button>
                </div>

                <div className="flex justify-between items-center">
                    <SearchBar
                        value={searchTerm}
                        onChange={(v) => setMultipleParams({ search: v, page: '1' })}
                        placeholder="Buscar por acción, descripción, entidad..."
                        className="w-full sm:w-96"
                    />
                </div>

                <div className="space-y-3">
                    {paginated.map((log) => {
                        const meta = getEntityMeta(log.entity_type);
                        const Badge = getActionBadge(log.action);
                        const Icon = meta.icon;
                        return (
                            <Card key={log.id_log} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`text-[11px] px-2 py-1 rounded-full border ${Badge.color} font-semibold tracking-wide uppercase`}>{Badge.label}</span>
                                                <span className="text-xs text-slate-500 capitalize">{log.entity_type}</span>
                                            </div>
                                            <div className="mt-1 text-sm font-semibold text-slate-900">
                                                {getDetailedDescription(log)}
                                            </div>
                                            {getAdditionalDetails(log)}
                                            <div className="text-xs text-slate-500 mt-1">
                                                {log.entity_id ? `ID: ${log.entity_id}` : 'ID: —'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 ml-4 whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString('es-ES')}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {paginated.length === 0 && (
                    <Card className="text-center py-12">
                        <p className="text-slate-500 text-lg">No hay movimientos registrados.</p>
                    </Card>
                )}

                {totalPages > 1 && (
                    <div className="mt-8">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setMultipleParams({ page: String(p) })} />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}


