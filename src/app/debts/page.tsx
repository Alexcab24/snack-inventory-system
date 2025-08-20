'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { CreditCard, User, Package, CheckCircle } from 'lucide-react';
import { debtApi } from '@/lib/api';
import { formatCurrency, useQueryParams, getPaginatedData, getTotalPages } from '@/lib/utils';
import type { Debt } from '@/types';

export default function DebtsPage() {
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [processingPayment, setProcessingPayment] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; debt: Debt | null; action: 'markPaid' | 'addPayment' | null }>({
        isOpen: false,
        debt: null,
        action: null
    });

    // Query params
    const { getParam, setMultipleParams } = useQueryParams();
    const searchTerm = getParam('search', '');
    const currentPage = parseInt(getParam('page', '1'));
    const pageSize = 10;

    // Filtered and paginated data
    const filteredDebts = searchTerm.trim() ? debts.filter(debt => {
        const personName = debt.sale?.person?.name || '';
        const createdDate = debt.created_at ? new Date(debt.created_at).toLocaleString('es-ES') : '';
        const searchLower = searchTerm.toLowerCase();

        const matches = personName.toLowerCase().includes(searchLower) ||
            createdDate.includes(searchLower);

        if (searchTerm && (personName || createdDate)) {
            console.log('Search debug:', {
                searchTerm,
                personName,
                createdDate,
                matches
            });
        }

        return matches;
    }) : debts;
    const paginatedDebts = getPaginatedData(filteredDebts, currentPage, pageSize);
    const totalPages = getTotalPages(filteredDebts.length, pageSize);

    useEffect(() => {
        loadDebts();
    }, []);

    const loadDebts = async () => {
        try {
            setLoading(true);
            const data = await debtApi.getAll();
            console.log('Loaded debts:', data);
            if (data.length > 0) {
                console.log('Sample debt structure:', data[0]);
            }
            setDebts(data);
        } catch (error) {
            toast.error('Error al cargar deudas');
            console.error('Error loading debts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsPaidClick = (debt: Debt) => {
        setConfirmModal({ isOpen: true, debt, action: 'markPaid' });
    };

    const handleMarkAsPaidConfirm = async () => {
        if (!confirmModal.debt) return;

        try {
            await debtApi.markAsPaid(confirmModal.debt.id_debt);
            toast.success('Deuda marcada como pagada exitosamente');
            loadDebts();
        } catch (error) {
            toast.error('Error al marcar deuda como pagada');
            console.error('Error marking debt as paid:', error);
        } finally {
            setConfirmModal({ isOpen: false, debt: null, action: null });
        }
    };

    const handleAddPayment = async (id: string) => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            toast.error('Por favor ingresa un monto válido');
            return;
        }

        const amount = parseFloat(paymentAmount);
        const debt = debts.find(d => d.id_debt === id);

        // Calculate remaining amount safely
        const remainingAmount = debt ? getRemainingAmount(debt) : 0;

        if (debt && amount > remainingAmount) {
            toast.error(`El monto excede la deuda restante de ${formatCurrency(remainingAmount)}`);
            return;
        }

        try {
            setProcessingPayment(id);
            await debtApi.addPayment(id, amount);
            toast.success(`Abono de ${formatCurrency(amount)} registrado exitosamente`);
            setPaymentAmount('');
            setShowPaymentForm(null);
            loadDebts();
        } catch (error) {
            toast.error('Error al registrar el abono');
            console.error('Error adding payment:', error);
        } finally {
            setProcessingPayment(null);
        }
    };



    const getSnackNames = (debt: Debt) => {
        console.log('Getting snack names for debt:', debt);
        if (!debt.sale?.items || debt.sale.items.length === 0) {
            return ['Unknown Snack'];
        }

        const snackNames = debt.sale.items.map(item =>
            item.snack?.name || 'Unknown Snack'
        );
        console.log('Snack names:', snackNames);
        return snackNames;
    };

    const getPersonName = (debt: Debt) => {
        console.log('Getting person name for debt:', debt);
        const personName = debt.sale?.person?.name || 'Unknown Person';
        console.log('Person name:', personName);
        return personName;
    };

    const getRemainingAmount = (debt: Debt) => {
        // Handle cases where the new columns might not exist yet
        if (debt.remaining_amount !== undefined && !isNaN(debt.remaining_amount)) {
            return debt.remaining_amount;
        }

        const amountPaid = debt.amount_paid || 0;
        return Math.max(0, debt.amount - amountPaid);
    };

    const unpaidDebts = debts.filter(debt => debt.paid === 'pending');
    const paidDebts = debts.filter(debt => debt.paid === 'paid');

    const handleSearchChange = (value: string) => {
        setMultipleParams({ search: value, page: '1' });
    };

    const handlePageChange = (page: number) => {
        setMultipleParams({ page: page.toString() });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading-spinner rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Gestión de Deudas</h1>
                    <p className="text-slate-600">Rastrea y gestiona deudas pendientes</p>
                </div>
                <div className="text-center sm:text-right">
                    <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(unpaidDebts.reduce((sum, debt) => sum + debt.amount, 0))}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">Total Pendiente</div>
                </div>
            </div>

            {/* Outstanding Debts */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Deudas Pendientes ({filteredDebts.filter(d => d.paid === 'pending').length} resultados)
                    </h2>
                    <SearchBar
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Buscar por persona o fecha..."
                        className="w-full sm:w-80"
                    />
                </div>

                {filteredDebts.filter(d => d.paid === 'pending').length > 0 ? (
                    paginatedDebts.filter(d => d.paid === 'pending').map((debt) => (
                        <Card key={debt.id_debt} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative border-l-4 border-l-red-500">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                            <CreditCard className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <Package className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">{getSnackNames(debt).join(', ')}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600">{getPersonName(debt)}</span>
                                        </div>
                                        {debt.sale && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                Fecha: {new Date(debt.sale.created_at).toLocaleDateString('es-ES')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="space-y-2">
                                        <div className="text-lg font-semibold text-red-600">
                                            {formatCurrency(debt.amount)}
                                        </div>
                                        {debt.amount_paid > 0 && (
                                            <div className="text-sm text-gray-600">
                                                <div>Pagado: {formatCurrency(debt.amount_paid)}</div>
                                                <div>Restante: {formatCurrency(getRemainingAmount(debt))}</div>
                                            </div>
                                        )}
                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                onClick={() => setShowPaymentForm(showPaymentForm === debt.id_debt ? null : debt.id_debt)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                Abonar
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleMarkAsPaidClick(debt)}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Pagar Todo
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className={`mt-4 overflow-hidden transition-all duration-300 ease-in-out ${showPaymentForm === debt.id_debt
                                ? 'max-h-96 opacity-100'
                                : 'max-h-0 opacity-0'
                                }`}>
                                <div className="p-4 bg-gray-50 rounded-lg border transform transition-all duration-300 ease-in-out ${
                                    showPaymentForm === debt.id_debt 
                                        ? 'translate-y-0 scale-100' 
                                        : 'translate-y-4 scale-95'
                                }">
                                    <div className="space-y-3">
                                        <div className="text-sm font-medium text-gray-700">
                                            Registrar Abono
                                        </div>
                                        <div className="flex space-x-2">
                                            <div className="flex-1">
                                                <div className="flex space-x-2">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max={getRemainingAmount(debt)}
                                                        value={paymentAmount}
                                                        onChange={(e) => {
                                                            const inputValue = e.target.value;
                                                            if (inputValue === '') {
                                                                setPaymentAmount('');
                                                                return;
                                                            }
                                                            const value = parseFloat(inputValue);
                                                            if (!isNaN(value)) {
                                                                const maxAmount = getRemainingAmount(debt);
                                                                const finalValue = Math.min(value, maxAmount);
                                                                setPaymentAmount(finalValue.toString());
                                                            }
                                                        }}
                                                        placeholder={`Máximo: ${formatCurrency(getRemainingAmount(debt))}`}
                                                        className="flex-1"
                                                        enableNumericHandling
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setPaymentAmount(getRemainingAmount(debt).toString())}
                                                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 text-xs"
                                                    >
                                                        Máx
                                                    </Button>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Monto restante: {formatCurrency(getRemainingAmount(debt))}
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => handleAddPayment(debt.id_debt)}
                                                disabled={processingPayment === debt.id_debt}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {processingPayment === debt.id_debt ? 'Procesando...' : 'Confirmar'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setShowPaymentForm(null);
                                                    setPaymentAmount('');
                                                }}
                                                className="bg-gray-500 hover:bg-gray-600"
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? 'No se encontraron deudas pendientes que coincidan con tu búsqueda.' : 'No hay deudas pendientes!'}
                        </p>
                    </Card>
                )}

                {/* Pagination for unpaid debts */}
                {totalPages > 1 && (
                    <div className="mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* Paid Debts */}
            {paidDebts.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-900">Paid Debts</h2>

                    {paidDebts.map((debt) => (
                        <Card key={debt.id_debt} className="relative border-l-4 border-l-green-500 opacity-75">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <Package className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium">{getSnackNames(debt).join(', ')}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-600">{getPersonName(debt)}</span>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Pagado: {new Date(debt.created_at).toLocaleDateString('es-ES')}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-semibold text-green-600">
                                        {formatCurrency(debt.amount)}
                                    </div>
                                    {debt.amount_paid > 0 && debt.amount_paid < debt.amount && (
                                        <div className="text-sm text-gray-600">
                                            <div>Pagado: {formatCurrency(debt.amount_paid)}</div>
                                            <div>Restante: {formatCurrency(getRemainingAmount(debt))}</div>
                                        </div>
                                    )}
                                    <div className="text-sm text-green-600 font-medium">
                                        Pagado
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {debts.length === 0 && !loading && (
                <Card className="text-center py-12">
                    <p className="text-gray-500 text-lg">No se encontraron deudas.</p>
                </Card>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, debt: null, action: null })}
                onConfirm={handleMarkAsPaidConfirm}
                title="Confirmar Pago Completo"
                message={`¿Estás seguro de que quieres marcar esta deuda como completamente pagada?`}
                confirmText="Confirmar Pago"
                cancelText="Cancelar"
                variant="info"
            />
        </div>
    );
}
