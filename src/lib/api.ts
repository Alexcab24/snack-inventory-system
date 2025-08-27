import { supabase } from './supabase';
import type {
    Snack,
    Person,
    PersonWithDebt,
    Sale,
    Debt,
    CreateSnackData,
    CreatePersonData,
    CreateSaleData,
    Reports,
    ActivityLog
} from '@/types';

// Snack CRUD operations
export const snackApi = {
    async getAll(): Promise<Snack[]> {
        const { data, error } = await supabase
            .from('snack')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async create(snackData: CreateSnackData): Promise<Snack> {
        // Calculate unit cost, profit margin, and stock
        const unit_cost = snackData.container_cost / snackData.units_per_container;
        // If sale is by combo, derive unit_sale_price from combo
        const effectiveUnitSalePrice = snackData.sale_type === 'combo'
            ? ((snackData.combo_price || 0) / (snackData.combo_units || 1))
            : snackData.unit_sale_price;
        const profit_margin_per_unit = effectiveUnitSalePrice - unit_cost;
        const stock = snackData.containers_purchased * snackData.units_per_container;

        const { data, error } = await supabase
            .from('snack')
            .insert({
                ...snackData,
                unit_sale_price: effectiveUnitSalePrice,
                unit_cost,
                profit_margin_per_unit,
                stock
            })
            .select()
            .single();

        if (error) throw error;

        // Log creation
        try {
            await logApi.createLog({
                entity_type: 'snack',
                entity_id: data.id_snack,
                action: 'snack_creado',
                description: `Snack creado: ${data.name}`,
                details: { snack: data }
            });
        } catch (e) {
            console.error('Activity log failed (snack create):', e);
        }

        return data;
    },

    async update(id: string, snackData: Partial<CreateSnackData>): Promise<Snack> {
        console.log('API: Updating snack with ID:', id);
        console.log('API: Update data:', snackData);

        // First, get the current snack data to calculate values correctly
        const { data: currentSnack, error: fetchError } = await supabase
            .from('snack')
            .select('*')
            .eq('id_snack', id)
            .single();

        if (fetchError) {
            console.error('API: Error fetching current snack:', fetchError);
            throw fetchError;
        }

        console.log('API: Current snack data:', currentSnack);

        // Merge current data with new data
        const updatedData = {
            ...currentSnack,
            ...snackData
        };

        console.log('API: Merged data:', updatedData);

        // Calculate unit cost, profit margin, and stock with the merged data
        const unit_cost = updatedData.container_cost / updatedData.units_per_container;
        const effectiveUnitSalePrice = updatedData.sale_type === 'combo'
            ? ((updatedData.combo_price || 0) / (updatedData.combo_units || 1))
            : updatedData.unit_sale_price;
        const profit_margin_per_unit = effectiveUnitSalePrice - unit_cost;
        const stock = updatedData.containers_purchased * updatedData.units_per_container;

        console.log('API: Calculated unit_cost:', unit_cost);
        console.log('API: Calculated profit_margin_per_unit:', profit_margin_per_unit);
        console.log('API: Calculated stock:', stock);

        const { data, error } = await supabase
            .from('snack')
            .update({
                ...snackData,
                unit_sale_price: effectiveUnitSalePrice,
                unit_cost,
                profit_margin_per_unit,
                stock
            })
            .eq('id_snack', id)
            .select()
            .single();

        if (error) {
            console.error('API: Error updating snack:', error);
            throw error;
        }

        console.log('API: Update successful, returned data:', data);

        // Log update with before/after diff for provided fields
        try {
            const changedFields: Record<string, { before: unknown; after: unknown }> = {};
            const currentSnackRecord = currentSnack as Record<string, unknown>;
            const updatedDataRecord = updatedData as Record<string, unknown>;
            Object.keys(snackData).forEach((k) => {
                const key = k as keyof typeof updatedData;
                changedFields[key as string] = { before: currentSnackRecord[key as string], after: updatedDataRecord[key as string] };
            });
            await logApi.createLog({
                entity_type: 'snack',
                entity_id: data.id_snack,
                action: 'snack_actualizado',
                description: `Snack actualizado: ${data.name}`,
                details: {
                    changedFields,
                    recalculated: {
                        unit_cost,
                        profit_margin_per_unit,
                        stock
                    }
                }
            });
        } catch (e) {
            console.error('Activity log failed (snack update):', e);
        }
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('snack')
            .delete()
            .eq('id_snack', id);

        if (error) throw error;

        // Log deletion
        try {
            await logApi.createLog({
                entity_type: 'snack',
                entity_id: id,
                action: 'snack_eliminado',
                description: `Snack eliminado`,
                details: { id_snack: id }
            });
        } catch (e) {
            console.error('Activity log failed (snack delete):', e);
        }
    }
};

// Person CRUD operations
export const personApi = {
    async getAll(): Promise<Person[]> {
        const { data, error } = await supabase
            .from('person')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getAllWithDebts(): Promise<PersonWithDebt[]> {
        const { data, error } = await supabase
            .from('person')
            .select(`
                *,
                sales:sale(
                    id_sale,
                    total,
                    paid,
                    debts:debt(
                        id_debt,
                        amount,
                        amount_paid,
                        paid
                    )
                )
            `)
            .order('name', { ascending: true });

        if (error) throw error;

        // Calculate total debt for each person based on actual debt records
        const peopleWithDebts = data?.map(person => {
            let totalDebt = 0;

            // Calculate debt from actual debt records
            person.sales?.forEach((sale: { id_sale: string; total: number; paid: number; debts?: Array<{ id_debt: string; amount: number; amount_paid: number; paid: string }> }) => {
                sale.debts?.forEach((debt: { id_debt: string; amount: number; amount_paid: number; paid: string }) => {
                    if (debt.paid === 'pending') {
                        // Calculate remaining debt amount
                        const amountPaid = debt.amount_paid || 0;
                        const remainingDebt = Math.max(0, debt.amount - amountPaid);
                        totalDebt += remainingDebt;
                    }
                });
            });

            return {
                ...person,
                total_debt: totalDebt
            };
        }) || [];

        return peopleWithDebts;
    },

    async create(personData: CreatePersonData): Promise<Person> {
        const { data, error } = await supabase
            .from('person')
            .insert(personData)
            .select()
            .single();

        if (error) throw error;

        try {
            await logApi.createLog({
                entity_type: 'person',
                entity_id: data.id_person,
                action: 'persona_creada',
                description: `Persona creada: ${data.name}`,
                details: { person: data }
            });
        } catch (e) {
            console.error('Activity log failed (person create):', e);
        }
        return data;
    },

    async update(id: string, personData: Partial<CreatePersonData>): Promise<Person> {
        const { data, error } = await supabase
            .from('person')
            .update(personData)
            .eq('id_person', id)
            .select()
            .single();

        if (error) throw error;
        try {
            await logApi.createLog({
                entity_type: 'person',
                entity_id: data.id_person,
                action: 'persona_actualizada',
                description: `Persona actualizada: ${data.name}`,
                details: { updates: personData }
            });
        } catch (e) {
            console.error('Activity log failed (person update):', e);
        }
        return data;
    },

    async canDelete(id: string): Promise<{ canDelete: boolean; reason?: string }> {
        try {
            // Check if person has any sales
            const { data: sales, error: salesError } = await supabase
                .from('sale')
                .select('id_sale')
                .eq('person_id', id)
                .limit(1);

            if (salesError) {
                console.error('API: Error checking sales:', salesError);
                return { canDelete: false, reason: 'Error al verificar ventas asociadas' };
            }

            if (sales && sales.length > 0) {
                return { canDelete: false, reason: 'Esta persona tiene ventas asociadas' };
            }

            // Check if person has any debts (via sales)
            const { data: debts, error: debtsError } = await supabase
                .from('debt')
                .select(`
                    id_debt,
                    sale:id_sale(
                        person_id
                    )
                `)
                .eq('sale.person_id', id)
                .limit(1);

            if (debtsError) {
                console.error('API: Error checking debts:', debtsError);
                return { canDelete: false, reason: 'Error al verificar deudas asociadas' };
            }

            if (debts && debts.length > 0) {
                return { canDelete: false, reason: 'Esta persona tiene deudas asociadas' };
            }

            return { canDelete: true };
        } catch (error) {
            console.error('API: Error in canDelete check:', error);
            return { canDelete: false, reason: 'Error al verificar si se puede eliminar' };
        }
    },

    async delete(id: string): Promise<void> {
        console.log('API: Attempting to delete person with ID:', id);

        const { error } = await supabase
            .from('person')
            .delete()
            .eq('id_person', id);

        if (error) {
            console.error('API: Error deleting person:', error);

            // Check if it's a foreign key constraint error
            if (error.code === '23503') {
                throw new Error('No se puede eliminar esta persona porque tiene ventas o deudas asociadas');
            }

            throw error;
        }

        console.log('API: Person deleted successfully');
        try {
            await logApi.createLog({
                entity_type: 'person',
                entity_id: id,
                action: 'persona_eliminada',
                description: `Persona eliminada`,
                details: { id_person: id }
            });
        } catch (e) {
            console.error('Activity log failed (person delete):', e);
        }
    }
};

// Sale CRUD operations
export const saleApi = {
    // Helper method to get snack by ID
    async getSnackById(id: string): Promise<Snack> {
        const { data, error } = await supabase
            .from('snack')
            .select('*')
            .eq('id_snack', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Helper method to get person by ID
    async getPersonById(id: string): Promise<Person> {
        const { data, error } = await supabase
            .from('person')
            .select('*')
            .eq('id_person', id)
            .single();

        if (error) throw error;
        return data;
    },
    async getAll(): Promise<Sale[]> {
        const { data, error } = await supabase
            .from('sale')
            .select(`
                *,
                person:person_id(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Get items separately to avoid cache issues
        const salesWithItems = await Promise.all(
            (data || []).map(async (sale) => {
                const { data: items } = await supabase
                    .from('sale_item')
                    .select(`
                        *,
                        snack:snack_id(*)
                    `)
                    .eq('sale_id', sale.id_sale);

                return {
                    ...sale,
                    items: items || []
                };
            })
        );

        return salesWithItems;
    },

    async create(saleData: CreateSaleData): Promise<Sale> {
        console.log('API: Creating sale with data:', saleData);

        if (!saleData.items || saleData.items.length === 0) {
            throw new Error('La venta debe tener al menos un item');
        }

        // Validate all items and calculate total
        let total = 0;
        const stockUpdates: { id: string; newStock: number }[] = [];
        const saleItemsDetails: { snack_id: string; quantity: number }[] = [];

        for (const item of saleData.items) {
            // Get snack details to calculate total amount and check stock
            const { data: snack, error: snackError } = await supabase
                .from('snack')
                .select('name, unit_sale_price, stock')
                .eq('id_snack', item.snack_id)
                .single();

            if (snackError || !snack) {
                throw new Error(`Snack no encontrado: ${item.snack_id}`);
            }

            // Check if there's enough stock
            if (snack.stock < item.quantity) {
                throw new Error(`Stock insuficiente para ${snack.name}. Solo hay ${snack.stock} unidades disponibles.`);
            }

            const subtotal = snack.unit_sale_price * item.quantity;
            total += subtotal;
            stockUpdates.push({
                id: item.snack_id,
                newStock: snack.stock - item.quantity
            });
            saleItemsDetails.push({ snack_id: item.snack_id, quantity: item.quantity });
        }

        // Start transaction-like operation
        // First, update all stock levels
        for (const update of stockUpdates) {
            const { error: stockError } = await supabase
                .from('snack')
                .update({ stock: update.newStock })
                .eq('id_snack', update.id);

            if (stockError) {
                console.error('Error updating stock:', stockError);
                throw new Error('Error al actualizar el stock');
            }
        }

        // Then create the sale
        const { data: sale, error: saleError } = await supabase
            .from('sale')
            .insert({
                person_id: saleData.person_id,
                sale_date: saleData.sale_date,
                total,
                paid: saleData.paid
            })
            .select('*')
            .single();

        if (saleError) {
            console.error('Error creating sale:', saleError);
            throw saleError;
        }

        // Create sale items
        for (const item of saleData.items) {
            const { data: snack } = await supabase
                .from('snack')
                .select('unit_sale_price')
                .eq('id_snack', item.snack_id)
                .single();

            const { error: itemError } = await supabase
                .from('sale_item')
                .insert({
                    sale_id: sale.id_sale,
                    snack_id: item.snack_id,
                    quantity: item.quantity,
                    unit_price: snack?.unit_sale_price || 0,
                    subtotal: (snack?.unit_sale_price || 0) * item.quantity
                });

            if (itemError) {
                console.error('Error creating sale item:', itemError);
                throw new Error('Error al crear items de la venta');
            }
        }

        // If sale is not paid, create a debt record
        if (saleData.paid === 0) {
            await debtApi.create({
                id_sale: sale.id_sale,
                amount: total,
                paid: 'pending'
            });
        }

        // Log sale
        try {
            await logApi.createLog({
                entity_type: 'sale',
                entity_id: sale.id_sale,
                action: 'venta_creada',
                description: `Venta creada (total ${total}, ${saleData.paid === 1 ? 'pagada' : 'pendiente'})`,
                details: {
                    person_id: saleData.person_id,
                    sale_date: saleData.sale_date,
                    total,
                    paid: saleData.paid,
                    items: saleItemsDetails
                }
            });
        } catch (e) {
            console.error('Activity log failed (sale create):', e);
        }

        // Return the created sale (without items for now to avoid cache issues)
        return sale;
    },

    async update(id: string, saleData: Partial<CreateSaleData>): Promise<Sale> {
        const { data, error } = await supabase
            .from('sale')
            .update(saleData)
            .eq('id_sale', id)
            .select('*')
            .single();

        if (error) throw error;
        try {
            await logApi.createLog({
                entity_type: 'sale',
                entity_id: data.id_sale,
                action: 'venta_actualizada',
                description: `Venta ${id} actualizada`,
                details: { updates: saleData }
            });
        } catch (e) {
            console.error('Activity log failed (sale update):', e);
        }
        return data;
    },

    async getById(id: string): Promise<Sale> {
        const { data, error } = await supabase
            .from('sale')
            .select(`
                *,
                person:person_id(*),
                items:sale_item(
                    *,
                    snack:snack_id(*)
                )
            `)
            .eq('id_sale', id)
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('sale')
            .delete()
            .eq('id_sale', id);

        if (error) throw error;
        try {
            await logApi.createLog({
                entity_type: 'sale',
                entity_id: id,
                action: 'venta_eliminada',
                description: `Venta eliminada`,
                details: { id_sale: id }
            });
        } catch (e) {
            console.error('Activity log failed (sale delete):', e);
        }
    }
};

// Debt CRUD operations
export const debtApi = {
    async getAll(): Promise<Debt[]> {
        const { data, error } = await supabase
            .from('debt')
            .select(`
                *,
                sale:id_sale(
                    *,
                    person:person_id(*),
                    items:sale_item(
                        *,
                        snack:snack_id(*)
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async create(debtData: { id_sale: string; amount: number; paid: string }): Promise<Debt> {
        const { data, error } = await supabase
            .from('debt')
            .insert(debtData)
            .select(`
                *,
                sale:id_sale(
                    *,
                    person:person_id(*),
                    items:sale_item(
                        *,
                        snack:snack_id(*)
                    )
                )
            `)
            .single();

        if (error) throw error;
        try {
            await logApi.createLog({
                entity_type: 'debt',
                entity_id: data.id_debt,
                action: 'deuda_creada',
                description: `Deuda creada por ${data.amount}`,
                details: { id_sale: debtData.id_sale, amount: debtData.amount, status: debtData.paid }
            });
        } catch (e) {
            console.error('Activity log failed (debt create):', e);
        }
        return data;
    },

    async markAsPaid(id: string): Promise<Debt> {
        const { data, error } = await supabase
            .from('debt')
            .update({ paid: 'paid' })
            .eq('id_debt', id)
            .select(`
                *,
                sale:id_sale(
                    *,
                    person:person_id(*),
                    items:sale_item(
                        *,
                        snack:snack_id(*)
                    )
                )
            `)
            .single();

        if (error) throw error;
        try {
            await logApi.createLog({
                entity_type: 'debt',
                entity_id: data.id_debt,
                action: 'deuda_pagada',
                description: `Deuda marcada como pagada`,
                details: { id_debt: id }
            });
        } catch (e) {
            console.error('Activity log failed (debt mark paid):', e);
        }
        return data;
    },

    async addPayment(id: string, paymentAmount: number): Promise<Debt> {
        // Get current debt to calculate new amount_paid
        const { data: currentDebt, error: fetchError } = await supabase
            .from('debt')
            .select('amount_paid, amount')
            .eq('id_debt', id)
            .single();

        if (fetchError) throw fetchError;

        const newAmountPaid = (currentDebt.amount_paid || 0) + paymentAmount;
        const isFullyPaid = newAmountPaid >= currentDebt.amount;

        const { data, error } = await supabase
            .from('debt')
            .update({
                amount_paid: newAmountPaid,
                paid: isFullyPaid ? 'paid' : 'pending'
            })
            .eq('id_debt', id)
            .select(`
                *,
                sale:id_sale(
                    *,
                    person:person_id(*),
                    items:sale_item(
                        *,
                        snack:snack_id(*)
                    )
                )
            `)
            .single();

        if (error) throw error;
        try {
            await logApi.createLog({
                entity_type: 'debt',
                entity_id: data.id_debt,
                action: 'abono_agregado',
                description: `Abono agregado por ${paymentAmount}`,
                details: { id_debt: id, amount: paymentAmount }
            });
        } catch (e) {
            console.error('Activity log failed (debt add payment):', e);
        }
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('debt')
            .delete()
            .eq('id_debt', id);

        if (error) throw error;
        try {
            await logApi.createLog({
                entity_type: 'debt',
                entity_id: id,
                action: 'deuda_eliminada',
                description: `Deuda eliminada`,
                details: { id_debt: id }
            });
        } catch (e) {
            console.error('Activity log failed (debt delete):', e);
        }
    },

    async markAllDebtsAsPaidForPerson(personId: string): Promise<void> {
        // Get all pending debts for the person
        const { data: debts, error: fetchError } = await supabase
            .from('debt')
            .select(`
                id_debt,
                amount,
                amount_paid,
                sale:id_sale(
                    person_id
                )
            `)
            .eq('sale.person_id', personId)
            .eq('paid', 'pending');

        if (fetchError) throw fetchError;

        if (!debts || debts.length === 0) {
            throw new Error('No hay deudas pendientes para esta persona');
        }

        // Mark all debts as paid by setting amount_paid equal to amount
        for (const debt of debts) {
            const { error: updateError } = await supabase
                .from('debt')
                .update({
                    paid: 'paid',
                    amount_paid: debt.amount
                })
                .eq('id_debt', debt.id_debt);

            if (updateError) throw updateError;
        }

        // Log the action
        try {
            await logApi.createLog({
                entity_type: 'person',
                entity_id: personId,
                action: 'todas_deudas_pagadas',
                description: `Todas las deudas marcadas como pagadas`,
                details: {
                    person_id: personId,
                    debts_count: debts.length,
                    total_amount: debts.reduce((sum, debt) => sum + (debt.amount - (debt.amount_paid || 0)), 0)
                }
            });
        } catch (e) {
            console.error('Activity log failed (mark all debts paid):', e);
        }
    }
};

// Reports
export const reportsApi = {
    async getReports(): Promise<Reports> {
        // Get total investment (sum of all snack unit costs * stock)
        const { data: snacks } = await supabase
            .from('snack')
            .select('unit_cost, stock');

        // Get total sales
        const { data: sales } = await supabase
            .from('sale')
            .select('total');

        // Get total debts
        const { data: debts } = await supabase
            .from('debt')
            .select('amount')
            .eq('paid', 'pending');

        const total_investment = snacks?.reduce((sum, snack) => sum + (snack.unit_cost * snack.stock), 0) || 0;
        const total_sales = sales?.reduce((sum, sale) => sum + sale.total, 0) || 0;
        const total_debts = debts?.reduce((sum, debt) => sum + debt.amount, 0) || 0;
        const total_profit = total_sales - total_investment;

        return {
            total_investment,
            total_sales,
            total_profit,
            total_debts
        };
    }
};

// Activity Log API
export const logApi = {
    async createLog(entry: Omit<ActivityLog, 'id_log' | 'created_at'>): Promise<ActivityLog> {
        const { data, error } = await supabase
            .from('activity_log')
            .insert(entry)
            .select('*')
            .single();
        if (error) throw error;
        return data as ActivityLog;
    },

    async getAll(): Promise<ActivityLog[]> {
        const { data, error } = await supabase
            .from('activity_log')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []) as ActivityLog[];
    }
};
