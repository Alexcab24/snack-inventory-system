'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { Plus, X, Package, User, DollarSign, RefreshCw, CheckCircle, Clock, Trash2, ShoppingCart, Filter, AlertCircle } from 'lucide-react';
import { saleApi, snackApi, personApi } from '@/lib/api';
import { formatCurrency, useQueryParams, getPaginatedData, getTotalPages } from '@/lib/utils';
import { AdminLayout } from '@/components/layout/AdminLayout';
import type { Sale, Snack, Person, CreateSaleData, CreateSaleItemData } from '@/types';

interface CartItem extends CreateSaleItemData {
    snack: Snack;
    subtotal: number; // uses combo_price if combo, else unit price
    uiQuantity: number; // combos if sale_type=combo, units otherwise
}

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [snacks, setSnacks] = useState<Snack[]>([]);
    const [people, setPeople] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Query params
    const { getParam, setMultipleParams } = useQueryParams();
    const searchTerm = getParam('search', '');
    const paymentFilter = getParam('payment', 'all'); // 'all', 'paid', 'unpaid'
    const currentPage = parseInt(getParam('page', '1'));
    const pageSize = 10;

    // Filtered and paginated data
    let filteredSales = sales;

    // Apply payment filter
    if (paymentFilter !== 'all') {
        filteredSales = filteredSales.filter(sale => {
            if (paymentFilter === 'paid') {
                return sale.paid === 1;
            } else if (paymentFilter === 'unpaid') {
                return sale.paid === 0;
            }
            return true;
        });
    }

    // Apply search filter
    if (searchTerm.trim()) {
        filteredSales = filteredSales.filter(sale => {
            const personName = sale.person?.name || '';
            const saleDate = sale.sale_date ? (() => {
                const [year, month, day] = sale.sale_date.split('-').map(Number);
                return `${day}/${month}/${year}`;
            })() : '';
            const createdDate = sale.created_at ? new Date(sale.created_at).toLocaleDateString('es-ES') : '';
            const searchLower = searchTerm.toLowerCase();

            const matches = personName.toLowerCase().includes(searchLower) ||
                saleDate.includes(searchLower) ||
                createdDate.includes(searchLower);

            if (searchTerm && (personName || saleDate || createdDate)) {
                console.log('Sales search debug:', {
                    searchTerm,
                    personName,
                    saleDate,
                    createdDate,
                    matches
                });
            }

            return matches;
        });
    }
    const paginatedSales = getPaginatedData(filteredSales, currentPage, pageSize);
    const totalPages = getTotalPages(filteredSales.length, pageSize);

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedPersonId, setSelectedPersonId] = useState<string>('');
    const [paid, setPaid] = useState<number>(1); // 1 = true, 0 = false
    const [saleDate, setSaleDate] = useState<string>(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    // Form state for adding items
    const [selectedSnackId, setSelectedSnackId] = useState<string>('');
    const [itemQuantity, setItemQuantity] = useState<number>(1);

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

            console.log('Loaded sales:', salesData);
            if (salesData.length > 0) {
                console.log('Sample sale structure:', salesData[0]);
            }

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

    const addToCart = () => {
        if (!selectedSnackId || itemQuantity <= 0) {
            toast.error('Por favor selecciona un snack y una cantidad válida');
            return;
        }

        const snack = snacks.find(s => s.id_snack === selectedSnackId);
        if (!snack) {
            toast.error('Snack no encontrado');
            return;
        }

        const isCombo = snack.sale_type === 'combo' && snack.combo_units && snack.combo_price;
        const requiredUnits = isCombo ? itemQuantity * (snack.combo_units as number) : itemQuantity;

        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(item => item.snack_id === selectedSnackId);

        if (existingItemIndex >= 0) {
            // Update existing item
            const updatedCart = [...cart];
            const currentItem = updatedCart[existingItemIndex];

            // Convert to units properly
            const newUnits = currentItem.quantity + requiredUnits;
            if (newUnits > snack.stock) {
                toast.error(`Stock insuficiente. Solo hay ${snack.stock} unidades disponibles de ${snack.name}`);
                return;
            }

            const newUiQuantity = currentItem.uiQuantity + itemQuantity; // add combos or units accordingly
            const newSubtotal = isCombo ? (snack.combo_price as number) * newUiQuantity : snack.unit_sale_price * newUiQuantity;

            updatedCart[existingItemIndex] = {
                ...currentItem,
                quantity: newUnits, // always in units for API
                uiQuantity: newUiQuantity,
                subtotal: newSubtotal
            };
            setCart(updatedCart);
        } else {
            // Add new item
            if (requiredUnits > snack.stock) {
                toast.error(`Stock insuficiente. Solo hay ${snack.stock} unidades disponibles de ${snack.name}`);
                return;
            }

            setCart([...cart, {
                snack_id: selectedSnackId,
                quantity: requiredUnits, // units for API
                snack,
                uiQuantity: itemQuantity,
                subtotal: isCombo ? (snack.combo_price as number) * itemQuantity : snack.unit_sale_price * itemQuantity
            }]);
        }

        // Reset form
        setSelectedSnackId('');
        setItemQuantity(1);
    };

    const removeFromCart = (snackId: string) => {
        setCart(cart.filter(item => item.snack_id !== snackId));
    };

    const updateCartItemQuantity = (snackId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(snackId);
            return;
        }

        const item = cart.find(item => item.snack_id === snackId);
        if (!item) return;

        const isCombo = item.snack.sale_type === 'combo' && item.snack.combo_units && item.snack.combo_price;
        const requiredUnits = isCombo ? newQuantity * (item.snack.combo_units as number) : newQuantity;
        if (requiredUnits > item.snack.stock) {
            toast.error(`Stock insuficiente. Solo hay ${item.snack.stock} unidades disponibles de ${item.snack.name}`);
            return;
        }

        setCart(cart.map(item =>
            item.snack_id === snackId
                ? {
                    ...item,
                    quantity: requiredUnits, // units for API
                    uiQuantity: newQuantity,
                    subtotal: isCombo ? (item.snack.combo_price as number) * newQuantity : item.snack.unit_sale_price * newQuantity
                }
                : item
        ));
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.subtotal, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedPersonId) {
            toast.error('Por favor selecciona una persona');
            return;
        }

        if (cart.length === 0) {
            toast.error('Por favor agrega al menos un item al carrito');
            return;
        }

        // Ensure the date is in the correct format for the database
        // Parse the date to ensure it's treated as local date, not UTC
        const [year, month, day] = saleDate.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);
        const formattedDate = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;

        console.log('Original saleDate:', saleDate);
        console.log('Parsed date components:', { year, month, day });
        console.log('Local date object:', localDate);
        console.log('Formatted date for database:', formattedDate);

        const saleData: CreateSaleData = {
            person_id: selectedPersonId,
            items: cart.map(item => ({
                snack_id: item.snack_id,
                quantity: item.quantity
            })),
            paid,
            sale_date: formattedDate
        };

        setConfirmModal({ isOpen: true, saleData });
    };

    const handleConfirmSale = async () => {
        if (!confirmModal.saleData) return;

        try {
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
        setCart([]);
        setSelectedPersonId('');
        setPaid(1);
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        setSaleDate(`${year}-${month}-${day}`);
        setSelectedSnackId('');
        setItemQuantity(1);
        setShowForm(false);
    };

    const getPersonName = (personId: string) => {
        return people.find(p => p.id_person === personId)?.name || 'Unknown Person';
    };

    const handleSearchChange = (value: string) => {
        setMultipleParams({ search: value, page: '1' });
    };

    const handlePaymentFilterChange = (value: string) => {
        setMultipleParams({ payment: value, page: '1' });
    };

    const handlePageChange = (page: number) => {
        setMultipleParams({ page: page.toString() });
    };

    return (
        <AdminLayout loading={loading}>
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div className="space-y-2">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Gestión de Ventas</h1>
                        <p className="text-sm sm:text-base text-slate-600">Registra ventas con múltiples snacks y rastrea el estado de pagos</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <Button onClick={() => setShowForm(true)} className="shadow-lg w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Venta
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

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                    <Card className={`transform transition-all duration-500 ease-in-out ${showForm ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}>
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Nueva Venta</h2>
                            <Button variant="ghost" size="sm" onClick={resetForm} className="hover:bg-red-50 hover:text-red-600">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="sales-form-scroll space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                            {/* Person Selection and Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label={`Seleccionar Persona (${people.length} disponibles)`}
                                    value={selectedPersonId}
                                    onChange={(value) => setSelectedPersonId(value as string)}
                                    options={people.map(person => ({
                                        value: person.id_person,
                                        label: person.name,
                                        icon: <User className="h-4 w-4" />
                                    }))}
                                    placeholder="Seleccionar persona"
                                    required
                                />

                                <DatePicker
                                    label="Fecha de Venta"
                                    value={saleDate}
                                    onChange={setSaleDate}
                                    required
                                />
                            </div>

                            {/* Add Items to Cart */}
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    Agregar Items al Carrito
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                    <div className="sm:col-span-1 md:col-span-1">
                                        <Select
                                            label="Snack"
                                            value={selectedSnackId}
                                            onChange={(value) => setSelectedSnackId(value as string)}
                                            options={snacks.filter(s => s.stock > 0).map(snack => ({
                                                value: snack.id_snack,
                                                label: snack.name,
                                                description: snack.sale_type === 'combo' && snack.combo_units && snack.combo_price
                                                    ? `${formatCurrency(snack.combo_price)} (combo x${snack.combo_units}) - Stock: ${snack.stock}`
                                                    : `${formatCurrency(snack.unit_sale_price)} - Stock: ${snack.stock}`,
                                                icon: <Package className="h-4 w-4" />
                                            }))}
                                            placeholder="Seleccionar snack"
                                        />
                                    </div>

                                    <div className="sm:col-span-1 md:col-span-1">
                                        <Input
                                            label="Cantidad"
                                            type="number"
                                            min="1"
                                            value={itemQuantity}
                                            onChange={(e) => setItemQuantity(parseFloat(e.target.value) || 1)}
                                            enableNumericHandling
                                        />
                                    </div>

                                    <div className="flex items-end sm:col-span-2 md:col-span-1">
                                        <Button
                                            type="button"
                                            onClick={addToCart}
                                            disabled={!selectedSnackId || itemQuantity <= 0}
                                            className="w-full"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Shopping Cart */}
                            {cart.length > 0 && (
                                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                        Carrito de Compra ({cart.length} items)
                                    </h3>

                                    <div className="cart-scroll-area space-y-2 sm:space-y-3">
                                        {cart.map((item) => (
                                            <div key={item.snack_id} className="cart-item-mobile justify-between bg-white p-3 rounded-lg shadow-sm">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm sm:text-base truncate">{item.snack.name}</div>
                                                    <div className="text-xs sm:text-sm text-gray-600">
                                                        {item.snack.sale_type === 'combo' && item.snack.combo_units && item.snack.combo_price
                                                            ? `${formatCurrency(item.snack.combo_price)} x ${item.uiQuantity} (combo x${item.snack.combo_units})`
                                                            : `${formatCurrency(item.snack.unit_sale_price)} x ${item.uiQuantity}`}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2 sm:space-x-3">
                                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                                        <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">Cant:</span>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max={item.snack.sale_type === 'combo' && item.snack.combo_units ? Math.floor(item.snack.stock / item.snack.combo_units) : item.snack.stock}
                                                            value={item.uiQuantity}
                                                            onChange={(e) => updateCartItemQuantity(item.snack_id, parseFloat(e.target.value) || 1)}
                                                            className="w-16 sm:w-20 text-xs sm:text-sm"
                                                            enableNumericHandling
                                                        />
                                                    </div>

                                                    <div className="text-right min-w-0">
                                                        <div className="font-semibold text-sm sm:text-base">{formatCurrency(item.subtotal)}</div>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFromCart(item.snack_id)}
                                                        className="text-red-600 hover:bg-red-50 p-1 sm:p-2"
                                                    >
                                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="border-t pt-2 sm:pt-3">
                                            <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                                                <span>Total:</span>
                                                <span>{formatCurrency(getCartTotal())}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Status */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Estado de Pago</label>
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaid(1)}
                                        className={`flex-1 flex items-center justify-center space-x-2 sm:space-x-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl border-2 transition-all duration-300 ${paid === 1
                                            ? 'border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-100'
                                            : 'border-gray-200 bg-white text-gray-500 hover:border-green-300 hover:bg-green-25 hover:shadow-md'
                                            }`}
                                    >
                                        <CheckCircle className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${paid === 1 ? 'text-green-600' : 'text-gray-400'}`} />
                                        <div className="text-center">
                                            <div className="font-semibold text-sm sm:text-base">Pagado</div>
                                            <div className="text-xs opacity-75">Pago inmediato</div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaid(0)}
                                        className={`flex-1 flex items-center justify-center space-x-2 sm:space-x-3 py-3 sm:py-4 px-4 sm:px-6 rounded-xl border-2 transition-all duration-300 ${paid === 0
                                            ? 'border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-100'
                                            : 'border-gray-200 bg-white text-gray-500 hover:border-red-300 hover:bg-red-25 hover:shadow-md'
                                            }`}
                                    >
                                        <Clock className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${paid === 0 ? 'text-red-600' : 'text-gray-400'}`} />
                                        <div className="text-center">
                                            <div className="font-semibold text-sm sm:text-base">Pendiente</div>
                                            <div className="text-xs opacity-75">Deuda futura</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                                <Button type="button" variant="secondary" onClick={resetForm} className="w-full sm:w-auto">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={cart.length === 0 || !selectedPersonId} className="w-full sm:w-auto">
                                    Registrar Venta ({formatCurrency(getCartTotal())})
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Sales List */}
                <div className="space-y-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                                Ventas Recientes ({filteredSales.length} resultados)
                            </h2>
                            <SearchBar
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Buscar por persona, fecha de venta o registro..."
                                className="w-full sm:w-80"
                            />
                        </div>

                        {/* Payment Filter */}
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                                <Filter className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-700">Filtrar por Estado de Pago</span>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                <Button
                                    variant={paymentFilter === 'all' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => handlePaymentFilterChange('all')}
                                    className={`text-xs sm:text-sm transition-all duration-200 ${paymentFilter === 'all'
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                                        : 'hover:bg-blue-50 hover:border-blue-300'
                                        }`}
                                >
                                    <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Todas</span>
                                    <span className="sm:hidden">Todas</span>
                                    <span className="ml-1">({sales.length})</span>
                                </Button>
                                <Button
                                    variant={paymentFilter === 'paid' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => handlePaymentFilterChange('paid')}
                                    className={`text-xs sm:text-sm transition-all duration-200 ${paymentFilter === 'paid'
                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                                        : 'hover:bg-green-50 hover:border-green-300 text-green-700'
                                        }`}
                                >
                                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Pagadas</span>
                                    <span className="sm:hidden">Pagadas</span>
                                    <span className="ml-1">({sales.filter(s => s.paid === 1).length})</span>
                                </Button>
                                <Button
                                    variant={paymentFilter === 'unpaid' ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => handlePaymentFilterChange('unpaid')}
                                    className={`text-xs sm:text-sm transition-all duration-200 ${paymentFilter === 'unpaid'
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                                        : 'hover:bg-red-50 hover:border-red-300 text-red-700'
                                        }`}
                                >
                                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">No Pagadas</span>
                                    <span className="sm:hidden">No Pagadas</span>
                                    <span className="ml-1">({sales.filter(s => s.paid === 0).length})</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {paginatedSales.map((sale) => (
                        <Card key={sale.id_sale} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                            <div className="flex flex-col sm:flex-row justify-between items-start space-y-3 sm:space-y-0">
                                <div className="flex items-start space-x-3 sm:space-x-4 w-full sm:w-auto">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                            <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 text-white group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span className="font-bold text-slate-900 text-sm sm:text-base truncate">{getPersonName(sale.person_id)}</span>
                                        </div>

                                        {/* Show items */}
                                        <div className="space-y-1">
                                            {sale.items?.map((item) => (
                                                <div key={item.id_sale_item} className="flex items-center space-x-2 text-xs sm:text-sm">
                                                    <Package className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                                    <span className="text-slate-600 truncate">
                                                        {item.snack?.name} x{item.quantity} = {formatCurrency(item.subtotal)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right w-full sm:w-auto">
                                    <div className="text-base sm:text-lg font-semibold text-gray-900">
                                        {formatCurrency(sale.total)}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-500">
                                        {sale.items?.length || 0} items
                                    </div>
                                    <div className={`text-xs sm:text-sm font-medium ${sale.paid === 1 ? 'text-green-600' : 'text-red-600'}`}>
                                        {sale.paid === 1 ? 'Pagado' : 'No pagado'}
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 mt-2 flex flex-col sm:flex-row sm:space-x-2">
                                <span>Venta: {(() => {
                                    const [year, month, day] = sale.sale_date.split('-').map(Number);
                                    return `${day}/${month}/${year}`;
                                })()}</span>
                                <span className="hidden sm:inline">|</span>
                                <span>Registro: {new Date(sale.created_at).toLocaleString('es-ES')}</span>
                            </div>
                        </Card>
                    ))}

                    {paginatedSales.length === 0 && !loading && (
                        <Card className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                {searchTerm ? 'No se encontraron ventas que coincidan con tu búsqueda.' : 'No se encontraron ventas. ¡Registra tu primera venta para comenzar!'}
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
                </div>

                {/* Sale Confirmation Modal */}
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ isOpen: false, saleData: null })}
                    onConfirm={handleConfirmSale}
                    title="Confirmar Venta"
                    message={`¿Estás seguro de que quieres registrar esta venta por ${formatCurrency(getCartTotal())}?`}
                    confirmText="Confirmar Venta"
                    cancelText="Cancelar"
                    variant="info"
                />
            </div>
        </AdminLayout>
    );
}
