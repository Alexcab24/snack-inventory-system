'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Plus, X, Package, User, DollarSign, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { saleApi, snackApi, personApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { Sale, Snack, Person, CreateSaleData } from '@/types';

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [snacks, setSnacks] = useState<Snack[]>([]);
    const [people, setPeople] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<CreateSaleData>({
        snack_id: '',
        person_id: '',
        quantity: 1,
        paid: 1, // 1 = true, 0 = false
    });

    // Estados separados para los selectores (strings)
    const [selectedSnackId, setSelectedSnackId] = useState<string>('');
    const [selectedPersonId, setSelectedPersonId] = useState<string>('');
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; saleData: CreateSaleData | null }>({
        isOpen: false,
        saleData: null
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [salesData, snacksData, peopleData] = await Promise.all([
                saleApi.getAll(),
                snackApi.getAll(),
                personApi.getAll(),
            ]);

            console.log('Loaded data:', {
                sales: salesData.length,
                snacks: snacksData.length,
                people: peopleData.length
            });

            console.log(salesData);
            console.log(snacksData);
            console.log(peopleData);
            setSales(salesData);
            setSnacks(snacksData);
            setPeople(peopleData);
        } catch (error) {
            toast.error('Error al cargar datos');
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Validating form data:', {
            snack_id: formData.snack_id,
            person_id: formData.person_id,
            quantity: formData.quantity,
            selectedSnackId,
            selectedPersonId
        });

        if (!selectedSnackId || !selectedPersonId || formData.quantity <= 0) {
            toast.error('Por favor completa todos los campos con valores válidos');
            return;
        }

        // Validar stock disponible
        const selectedSnack = snacks.find(s => s.id_snack === selectedSnackId);
        if (selectedSnack && formData.quantity > selectedSnack.stock) {
            toast.error(`Stock insuficiente. Solo hay ${selectedSnack.stock} unidades disponibles de ${selectedSnack.name}`);
            return;
        }

        // Asegurar que los valores estén actualizados
        const saleData = {
            ...formData,
            snack_id: selectedSnackId,
            person_id: selectedPersonId
        };

        console.log('Preparing sale data:', saleData);

        // Mostrar modal de confirmación
        setConfirmModal({ isOpen: true, saleData });
    };

    const handleConfirmSale = async () => {
        if (!confirmModal.saleData) return;

        try {
            console.log('Creating sale with data:', confirmModal.saleData);
            await saleApi.create(confirmModal.saleData);
            toast.success('Venta registrada exitosamente');
            resetForm();
            loadData();
        } catch (error) {
            toast.error('Error al registrar venta');
            console.error('Error creating sale:', error);
        } finally {
            setConfirmModal({ isOpen: false, saleData: null });
        }
    };

    const resetForm = () => {
        setFormData({
            snack_id: '',
            person_id: '',
            quantity: 1,
            paid: 1, // 1 = true, 0 = false
        });
        setSelectedSnackId('');
        setSelectedPersonId('');
        setShowForm(false);
    };



    const getSnackName = (snackId: string) => {
        return snacks.find(s => s.id_snack === snackId)?.name || 'Unknown Snack';
    };

    const getPersonName = (personId: string) => {
        return people.find(p => p.id_person === personId)?.name || 'Unknown Person';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading-spinner rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
        );
    }

    console.log('Current state:', {
        formData,
        snacksCount: snacks.length,
        peopleCount: people.length,
        salesCount: sales.length,
        snacks: snacks.map(s => ({ id: s.id_snack, name: s.name })),
        people: people.map(p => ({ id: p.id_person, name: p.name }))
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Gestión de Ventas</h1>
                    <p className="text-slate-600">Registra ventas y rastrea el estado de pagos</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => setShowForm(true)} className="shadow-lg w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Registrar Venta
                    </Button>
                    <Button
                        onClick={loadData}
                        variant="secondary"
                        className="shadow-lg w-full sm:w-auto"
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Cargando...' : 'Actualizar'}
                    </Button>
                </div>
            </div>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <Card className={`transform transition-all duration-500 ease-in-out ${showForm ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
                    }`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Registrar Nueva Venta</h2>
                        <Button variant="ghost" size="sm" onClick={resetForm} className="hover:bg-red-50 hover:text-red-600">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label={`Seleccionar Snack (${snacks.length} disponibles)`}
                                value={selectedSnackId}
                                onChange={(value) => {
                                    setSelectedSnackId(value as string);
                                    setFormData({ ...formData, snack_id: value as string });
                                }}
                                options={loading ? [{ value: '', label: 'Cargando snacks...' }] : snacks.length > 0 ? snacks.map(snack => ({
                                    value: snack.id_snack,
                                    label: snack.name,
                                    description: `${formatCurrency(snack.unit_sale_price)} - Stock: ${snack.stock} unidades`,
                                    icon: <Package className="h-4 w-4" />
                                })) : [{ value: '', label: 'No hay snacks disponibles' }]}
                                placeholder="Seleccionar snack"
                                required
                                disabled={loading || snacks.length === 0}
                            />

                            <Select
                                label={`Seleccionar Persona (${people.length} disponibles)`}
                                value={selectedPersonId}
                                onChange={(value) => {
                                    setSelectedPersonId(value as string);
                                    setFormData({ ...formData, person_id: value as string });
                                }}
                                options={loading ? [{ value: '', label: 'Cargando personas...' }] : people.length > 0 ? people.map(person => ({
                                    value: person.id_person,
                                    label: person.name,
                                    icon: <User className="h-4 w-4" />
                                })) : [{ value: '', label: 'No hay personas disponibles' }]}
                                placeholder="Seleccionar persona"
                                required
                                disabled={loading || people.length === 0}
                            />
                        </div>

                        <Input
                            label="Cantidad"
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 1 })}
                            enableNumericHandling
                            required
                        />

                        {/* Payment Status Toggle */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">Estado de Pago</label>
                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paid: 1 })}
                                    className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-xl border-2 transition-all duration-300 ${formData.paid === 1
                                        ? 'border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-100'
                                        : 'border-gray-200 bg-white text-gray-500 hover:border-green-300 hover:bg-green-25 hover:shadow-md'
                                        }`}
                                >
                                    <CheckCircle className={`w-5 h-5 transition-all duration-300 ${formData.paid === 1 ? 'text-green-600' : 'text-gray-400'
                                        }`} />
                                    <div className="text-center">
                                        <div className="font-semibold">Pagado</div>
                                        <div className="text-xs opacity-75">Pago inmediato</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paid: 0 })}
                                    className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-xl border-2 transition-all duration-300 ${formData.paid === 0
                                        ? 'border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-100'
                                        : 'border-gray-200 bg-white text-gray-500 hover:border-red-300 hover:bg-red-25 hover:shadow-md'
                                        }`}
                                >
                                    <Clock className={`w-5 h-5 transition-all duration-300 ${formData.paid === 0 ? 'text-red-600' : 'text-gray-400'
                                        }`} />
                                    <div className="text-center">
                                        <div className="font-semibold">Pendiente</div>
                                        <div className="text-xs opacity-75">Deuda futura</div>
                                    </div>
                                </button>
                            </div>

                            {/* Payment Status Info */}
                            <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${formData.paid === 1
                                ? 'border-green-200 bg-green-25 shadow-sm'
                                : 'border-red-200 bg-red-25 shadow-sm'
                                }`}>
                                <div className="flex items-start space-x-3">
                                    {formData.paid === 1 ? (
                                        <>
                                            <div className="flex-shrink-0 mt-0.5">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-green-800">
                                                    Pago Inmediato
                                                </div>
                                                <div className="text-sm text-green-700 mt-1">
                                                    La venta se marcará como pagada y se registrará en el historial de ventas completadas.
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-shrink-0 mt-0.5">
                                                <Clock className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-red-800">
                                                    Deuda Pendiente
                                                </div>
                                                <div className="text-sm text-red-700 mt-1">
                                                    Se creará una deuda que aparecerá en la sección de deudas para seguimiento posterior.
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {(snacks.length === 0 || people.length === 0) && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Datos Faltantes
                                        </h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            {snacks.length === 0 && (
                                                <p>• No hay snacks disponibles. <a href="/snacks" className="text-blue-600 hover:text-blue-800 underline">Agrega algunos snacks primero</a>.</p>
                                            )}
                                            {people.length === 0 && (
                                                <p>• No hay personas disponibles. <a href="/people" className="text-blue-600 hover:text-blue-800 underline">Agrega algunas personas primero</a>.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <Button type="button" variant="secondary" onClick={resetForm}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={snacks.length === 0 || people.length === 0}>
                                Registrar Venta
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Ventas Recientes</h2>

                {sales.map((sale) => (
                    <Card key={sale.id_sale} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                        <DollarSign className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Package className="h-4 w-4 text-gray-400" />
                                        <span className="font-bold text-slate-900">{getSnackName(sale.snack_id)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-slate-600 font-medium">{getPersonName(sale.person_id)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(sale.total)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Cantidad: {sale.quantity}
                                </div>
                                <div className={`text-sm font-medium ${sale.paid === 1 ? 'text-green-600' : 'text-red-600'}`}>
                                    {sale.paid === 1 ? 'Pagado' : 'No pagado'}
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 mt-2">
                            {new Date(sale.created_at).toLocaleString('es-ES')}
                        </div>
                    </Card>
                ))}

                {sales.length === 0 && !loading && (
                    <Card className="text-center py-12">
                        <p className="text-gray-500 text-lg">No se encontraron ventas. ¡Registra tu primera venta para comenzar!</p>
                    </Card>
                )}
            </div>

            {/* Sale Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, saleData: null })}
                onConfirm={handleConfirmSale}
                title="Confirmar Venta"
                message={`¿Estás seguro de que quieres registrar esta venta?`}
                confirmText="Confirmar Venta"
                cancelText="Cancelar"
                variant="info"
            />
        </div>
    );
}
