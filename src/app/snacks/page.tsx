'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Plus, Edit, Trash2, X, Package, Package2, ShoppingBag } from 'lucide-react';
import { snackApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { AdminLayout } from '@/components/layout/AdminLayout';
import type { Snack, CreateSnackData } from '@/types';

export default function SnacksPage() {
    const [snacks, setSnacks] = useState<Snack[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSnack, setEditingSnack] = useState<Snack | null>(null);
    const [formData, setFormData] = useState<CreateSnackData>({
        name: '',
        purchase_type: 'box',
        units_per_container: 0,
        container_cost: 0,
        containers_purchased: 0,
        unit_sale_price: 0,
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; snack: Snack | null }>({
        isOpen: false,
        snack: null
    });

    useEffect(() => {
        loadSnacks();
    }, []);

    const loadSnacks = async () => {
        try {
            setLoading(true);
            const data = await snackApi.getAll();
            setSnacks(data);
        } catch (error) {
            toast.error('Error al cargar snacks');
            console.error('Error loading snacks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || formData.units_per_container <= 0 || formData.container_cost <= 0 || formData.containers_purchased <= 0 || formData.unit_sale_price <= 0) {
            toast.error('Por favor completa todos los campos con valores válidos');
            return;
        }

        const unitCost = formData.container_cost / formData.units_per_container;
        if (formData.unit_sale_price <= unitCost) {
            toast.error('El precio de venta por unidad debe ser mayor al costo por unidad');
            return;
        }

        try {
            console.log('Submitting form data:', formData);
            console.log('Editing snack:', editingSnack);

            if (editingSnack) {
                console.log('Updating snack with ID:', editingSnack.id_snack);
                await snackApi.update(editingSnack.id_snack, formData);
                toast.success('Snack actualizado exitosamente');
            } else {
                console.log('Creating new snack');
                await snackApi.create(formData);
                toast.success('Snack creado exitosamente');
            }

            resetForm();
            loadSnacks();
        } catch (error) {
            console.error('Error details:', error);
            toast.error(editingSnack ? 'Error al actualizar snack' : 'Error al crear snack');
            console.error('Error saving snack:', error);
        }
    };

    const handleEdit = (snack: Snack) => {
        setEditingSnack(snack);
        setFormData({
            name: snack.name,
            purchase_type: snack.purchase_type as 'box' | 'bag',
            units_per_container: snack.units_per_container,
            container_cost: snack.container_cost,
            containers_purchased: snack.containers_purchased,
            unit_sale_price: snack.unit_sale_price,
        });
        setShowForm(true);
    };

    const handleDeleteClick = (snack: Snack) => {
        setDeleteModal({ isOpen: true, snack });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.snack) return;

        try {
            await snackApi.delete(deleteModal.snack.id_snack);
            toast.success('Snack eliminado exitosamente');
            loadSnacks();
        } catch (error) {
            toast.error('Error al eliminar snack');
            console.error('Error deleting snack:', error);
        } finally {
            setDeleteModal({ isOpen: false, snack: null });
        }
    };

    const resetForm = () => {
        setFormData({ name: '', purchase_type: 'box', units_per_container: 0, container_cost: 0, containers_purchased: 0, unit_sale_price: 0 });
        setEditingSnack(null);
        setShowForm(false);
    };



    return (
        <AdminLayout loading={loading}>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Gestión de Snacks</h1>
                        <p className="text-slate-600">Registra y gestiona snacks con cálculo automático de margen de ganancia y control de stock</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="shadow-lg w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Snack
                    </Button>
                </div>

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <Card className={`transform transition-all duration-500 ease-in-out ${showForm ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
                        }`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {editingSnack ? 'Editar Snack' : 'Agregar Nuevo Snack'}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={resetForm} className="hover:bg-red-50 hover:text-red-600">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Nombre del Snack"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ingresa el nombre del snack"
                                required
                            />

                            {/* Tipo de Compra */}
                            <Select
                                label="Tipo de Compra"
                                value={formData.purchase_type}
                                onChange={(value) => setFormData({ ...formData, purchase_type: value as 'box' | 'bag' })}
                                options={[
                                    {
                                        value: 'box',
                                        label: 'Caja',
                                        icon: <Package2 className="h-4 w-4" />,
                                        description: 'Compra por caja'
                                    },
                                    {
                                        value: 'bag',
                                        label: 'Funda',
                                        icon: <ShoppingBag className="h-4 w-4" />,
                                        description: 'Compra por funda'
                                    }
                                ]}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label={`Unidades por ${formData.purchase_type === 'box' ? 'Caja' : 'Funda'}`}
                                    type="number"
                                    min="1"
                                    value={formData.units_per_container}
                                    onChange={(e) => setFormData({ ...formData, units_per_container: parseFloat(e.target.value) || 0 })}
                                    placeholder={formData.purchase_type === 'box' ? "12" : "24"}
                                    enableNumericHandling
                                    required
                                />

                                <Input
                                    label={`Costo de ${formData.purchase_type === 'box' ? 'Caja' : 'Funda'} ($)`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.container_cost}
                                    onChange={(e) => setFormData({ ...formData, container_cost: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                    enableNumericHandling
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label={`Cantidad de ${formData.purchase_type === 'box' ? 'Cajas' : 'Fundas'} Compradas`}
                                    type="number"
                                    min="1"
                                    value={formData.containers_purchased}
                                    onChange={(e) => setFormData({ ...formData, containers_purchased: parseFloat(e.target.value) || 0 })}
                                    placeholder="1"
                                    enableNumericHandling
                                    required
                                />

                                <Input
                                    label="Precio de Venta por Unidad ($)"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.unit_sale_price}
                                    onChange={(e) => setFormData({ ...formData, unit_sale_price: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                    enableNumericHandling
                                    required
                                />
                            </div>

                            {/* Stock calculado automáticamente - no editable */}
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-green-700 text-sm font-medium">Stock Disponible (Calculado):</span>
                                    <span className="font-bold text-lg text-green-600">
                                        {formData.units_per_container > 0 && formData.containers_purchased > 0
                                            ? `${formData.units_per_container * formData.containers_purchased} unidades`
                                            : '0 unidades'
                                        }
                                    </span>
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                    {formData.containers_purchased} {formData.purchase_type === 'box' ? 'cajas' : 'fundas'} × {formData.units_per_container} unidades
                                </div>
                            </div>

                            {/* Cálculo en tiempo real del margen de ganancia */}
                            {formData.units_per_container > 0 && formData.container_cost > 0 && formData.unit_sale_price > 0 && formData.containers_purchased > 0 && (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-700 text-sm font-medium">Costo por Unidad:</span>
                                            <span className="font-bold text-blue-600">
                                                {formatCurrency(formData.container_cost / formData.units_per_container)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-700 text-sm font-medium">Ganancia por Unidad:</span>
                                            <span className={`font-bold ${formData.unit_sale_price - (formData.container_cost / formData.units_per_container) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(formData.unit_sale_price - (formData.container_cost / formData.units_per_container))}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-700 text-sm font-medium">Ganancia Total Estimada:</span>
                                            <span className={`font-bold text-lg ${(formData.unit_sale_price - (formData.container_cost / formData.units_per_container)) * (formData.units_per_container * formData.containers_purchased) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency((formData.unit_sale_price - (formData.container_cost / formData.units_per_container)) * (formData.units_per_container * formData.containers_purchased))}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-blue-600 mt-2">
                                        (Precio de venta por unidad - Costo por unidad) × Stock total
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <Button type="button" variant="secondary" onClick={resetForm}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingSnack ? 'Actualizar Snack' : 'Agregar Snack'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 card-grid">
                    {snacks.map((snack) => (
                        <Card key={snack.id_snack} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                        <Package className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                        {snack.name}
                                    </h3>
                                </div>
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(snack)}
                                        className="hover:bg-blue-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteClick(snack)}
                                        className="hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                    <span className="text-slate-600 text-sm font-medium">Tipo de Compra:</span>
                                    <span className="font-bold text-slate-900 flex items-center space-x-1">
                                        {snack.purchase_type === 'box' ? (
                                            <>
                                                <Package2 className="h-4 w-4 text-blue-600" />
                                                <span>Caja</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingBag className="h-4 w-4 text-green-600" />
                                                <span>Funda</span>
                                            </>
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                    <span className="text-slate-600 text-sm font-medium">
                                        Unidades por {snack.purchase_type === 'box' ? 'Caja' : 'Funda'}:
                                    </span>
                                    <span className="font-bold text-slate-900">{snack.units_per_container}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                    <span className="text-slate-600 text-sm font-medium">
                                        {snack.purchase_type === 'box' ? 'Cajas' : 'Fundas'} Compradas:
                                    </span>
                                    <span className="font-bold text-slate-900">{snack.containers_purchased}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                    <span className="text-slate-600 text-sm font-medium">
                                        Costo de {snack.purchase_type === 'box' ? 'Caja' : 'Funda'}:
                                    </span>
                                    <span className="font-bold text-slate-900">{formatCurrency(snack.container_cost)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <span className="text-blue-700 text-sm font-medium">Costo por Unidad:</span>
                                    <span className="font-bold text-blue-600">{formatCurrency(snack.unit_cost)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                    <span className="text-slate-600 text-sm font-medium">Precio de Venta por Unidad:</span>
                                    <span className="font-bold text-slate-900">{formatCurrency(snack.unit_sale_price)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg border border-green-200">
                                    <span className="text-green-700 text-sm font-medium">Stock Disponible:</span>
                                    <span className={`font-bold text-lg ${snack.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {snack.stock} unidades
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <span className="text-blue-700 text-sm font-medium">Ganancia por Unidad:</span>
                                    <span className={`font-bold text-lg ${snack.profit_margin_per_unit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(snack.profit_margin_per_unit)}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {snacks.length === 0 && !loading && (
                    <Card className="text-center py-12">
                        <p className="text-slate-500 text-lg font-medium">No se encontraron snacks. ¡Agrega tu primer snack para comenzar!</p>
                    </Card>
                )}

                {/* Delete Confirmation Modal */}
                <ConfirmModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, snack: null })}
                    onConfirm={handleDeleteConfirm}
                    title="Eliminar Snack"
                    message={`¿Estás seguro de que quieres eliminar "${deleteModal.snack?.name}"? Esta acción no se puede deshacer.`}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    variant="danger"
                />
            </div>
        </AdminLayout>
    );
}
