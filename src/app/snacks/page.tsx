'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash2, X, Package } from 'lucide-react';
import { snackApi } from '@/lib/api';
import type { Snack, CreateSnackData } from '@/types';

export default function SnacksPage() {
    const [snacks, setSnacks] = useState<Snack[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSnack, setEditingSnack] = useState<Snack | null>(null);
    const [formData, setFormData] = useState<CreateSnackData>({
        name: '',
        purchase_price: 0,
        sale_price: 0,
        stock: 0,
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

        if (!formData.name || formData.purchase_price <= 0 || formData.sale_price <= 0 || formData.stock < 0) {
            toast.error('Por favor completa todos los campos con valores válidos');
            return;
        }

        if (formData.sale_price <= formData.purchase_price) {
            toast.error('Sale price must be higher than purchase price');
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
            purchase_price: snack.purchase_price,
            sale_price: snack.sale_price,
            stock: snack.stock,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este snack?')) return;

        try {
            await snackApi.delete(id);
            toast.success('Snack eliminado exitosamente');
            loadSnacks();
        } catch (error) {
            toast.error('Error al eliminar snack');
            console.error('Error deleting snack:', error);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', purchase_price: 0, sale_price: 0, stock: 0 });
        setEditingSnack(null);
        setShowForm(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Precio de Compra ($)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.purchase_price}
                                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                required
                            />

                            <Input
                                label="Precio de Venta ($)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.sale_price}
                                onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <Input
                            label="Stock Disponible"
                            type="number"
                            min="0"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            required
                        />

                        {/* Cálculo en tiempo real del margen de ganancia */}
                        {formData.purchase_price > 0 && formData.sale_price > 0 && formData.stock > 0 && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-700 text-sm font-medium">Ganancia Total Estimada:</span>
                                    <span className={`font-bold text-lg ${(formData.sale_price - formData.purchase_price) * formData.stock >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency((formData.sale_price - formData.purchase_price) * formData.stock)}
                                    </span>
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                    (Precio de venta - Precio de compra) × Stock
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
                                    onClick={() => handleDelete(snack.id_snack)}
                                    className="hover:bg-red-50 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                <span className="text-slate-600 text-sm font-medium">Precio de Compra:</span>
                                <span className="font-bold text-slate-900">{formatCurrency(snack.purchase_price)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                <span className="text-slate-600 text-sm font-medium">Precio de Venta:</span>
                                <span className="font-bold text-slate-900">{formatCurrency(snack.sale_price)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg border border-green-200">
                                <span className="text-green-700 text-sm font-medium">Stock Disponible:</span>
                                <span className={`font-bold text-lg ${snack.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {snack.stock} unidades
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 text-sm font-medium">Ganancia Total:</span>
                                <span className={`font-bold text-lg ${snack.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(snack.profit_margin)}
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
        </div>
    );
}
