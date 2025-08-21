'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { Plus, Edit, Trash2, X, User, RefreshCw } from 'lucide-react';
import { personApi } from '@/lib/api';
import { useQueryParams, getPaginatedData, getTotalPages, filterBySearch } from '@/lib/utils';
import type { Person, PersonWithDebt, CreatePersonData } from '@/types';

export default function PeoplePage() {
    const [people, setPeople] = useState<PersonWithDebt[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [formData, setFormData] = useState<CreatePersonData>({
        name: '',
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; person: Person | null }>({
        isOpen: false,
        person: null
    });

    // Query params
    const { getParam, setMultipleParams } = useQueryParams();
    const searchTerm = getParam('search', '');
    const currentPage = parseInt(getParam('page', '1'));
    const pageSize = 10;

    // Filtered and paginated data
    const filteredPeople = filterBySearch(people, searchTerm, ['name']);
    const paginatedPeople = getPaginatedData(filteredPeople, currentPage, pageSize);
    const totalPages = getTotalPages(filteredPeople.length, pageSize);

    useEffect(() => {
        loadPeople();
    }, []);

    // Refresh data when page becomes visible again
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadPeople();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const loadPeople = async () => {
        try {
            setLoading(true);
            const data = await personApi.getAllWithDebts();
            setPeople(data);
        } catch (error) {
            toast.error('Error al cargar personas');
            console.error('Error loading people:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Por favor ingresa un nombre');
            return;
        }

        try {
            if (editingPerson) {
                await personApi.update(editingPerson.id_person, formData);
                toast.success('Persona actualizada exitosamente');
            } else {
                await personApi.create(formData);
                toast.success('Persona creada exitosamente');
            }

            resetForm();
            loadPeople();
        } catch (error) {
            toast.error(editingPerson ? 'Error al actualizar persona' : 'Error al crear persona');
            console.error('Error saving person:', error);
        }
    };

    const handleEdit = (person: Person) => {
        setEditingPerson(person);
        setFormData({
            name: person.name,
        });
        setShowForm(true);
    };

    const handleDeleteClick = (person: Person) => {
        setDeleteModal({ isOpen: true, person });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.person) return;

        try {
            console.log('Checking if person can be deleted...');

            // First check if the person can be deleted
            const { canDelete, reason } = await personApi.canDelete(deleteModal.person.id_person);

            if (!canDelete) {
                toast.error(reason || 'No se puede eliminar esta persona');
                setDeleteModal({ isOpen: false, person: null });
                return;
            }

            console.log('Attempting to delete person with ID:', deleteModal.person.id_person);
            await personApi.delete(deleteModal.person.id_person);
            toast.success('Persona eliminada exitosamente');
            loadPeople();
        } catch (error) {
            console.error('Error deleting person:', error);

            // Show more specific error messages
            if (error && typeof error === 'object' && 'message' in error) {
                const errorMessage = (error as { message: string }).message;
                if (errorMessage.includes('foreign key') || errorMessage.includes('23503')) {
                    toast.error('No se puede eliminar esta persona porque tiene ventas asociadas');
                } else {
                    toast.error(`Error al eliminar persona: ${errorMessage}`);
                }
            } else {
                toast.error('Error al eliminar persona');
            }
        } finally {
            setDeleteModal({ isOpen: false, person: null });
        }
    };

    const resetForm = () => {
        setFormData({ name: '' });
        setEditingPerson(null);
        setShowForm(false);
    };

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
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Gestión de Personas</h1>
                    <p className="text-slate-600">Gestiona compañeros de trabajo y clientes en el sistema</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={loadPeople} variant="secondary" className="shadow-lg w-full sm:w-auto" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Cargando...' : 'Actualizar'}
                    </Button>
                    <Button onClick={() => setShowForm(true)} className="shadow-lg w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Persona
                    </Button>
                </div>
            </div>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <Card className={`transform transition-all duration-500 ease-in-out ${showForm ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
                    }`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {editingPerson ? 'Editar Persona' : 'Agregar Nueva Persona'}
                        </h2>
                        <Button variant="ghost" size="sm" onClick={resetForm} className="hover:bg-red-50 hover:text-red-600">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nombre"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ingresa el nombre de la persona"
                            required
                        />



                        <div className="flex justify-end space-x-3">
                            <Button type="button" variant="secondary" onClick={resetForm}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {editingPerson ? 'Actualizar Persona' : 'Agregar Persona'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>

            {/* Search and Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <h2 className="text-2xl font-bold text-slate-900">
                    Personas ({filteredPeople.length} resultados)
                </h2>
                <SearchBar
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Buscar por nombre..."
                    className="w-full sm:w-80"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 card-grid">
                {paginatedPeople.map((person) => (
                    <Card key={person.id_person} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                        <User className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                        {person.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium">
                                        Agregado: {new Date(person.created_at).toLocaleDateString('es-ES')}
                                    </p>
                                    {person.total_debt > 0 && (
                                        <p className="text-sm font-semibold text-red-600 mt-1">
                                            Deuda: ${person.total_debt.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(person)}
                                    className="hover:bg-blue-50"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(person)}
                                    className="hover:bg-red-50 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {paginatedPeople.length === 0 && !loading && (
                <Card className="text-center py-12">
                    <p className="text-slate-500 text-lg font-medium">
                        {searchTerm ? 'No se encontraron personas que coincidan con tu búsqueda.' : 'No se encontraron personas. ¡Agrega tu primera persona para comenzar!'}
                    </p>
                </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, person: null })}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Persona"
                message={`¿Estás seguro de que quieres eliminar a "${deleteModal.person?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
}
