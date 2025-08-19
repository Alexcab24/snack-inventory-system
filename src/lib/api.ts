import { supabase } from './supabase';
import type {
    Snack,
    Person,
    Sale,
    Debt,
    CreateSnackData,
    CreatePersonData,
    CreateSaleData,
    Reports
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
        const profit_margin = (snackData.sale_price - snackData.purchase_price) * snackData.stock;

        const { data, error } = await supabase
            .from('snack')
            .insert({ ...snackData, profit_margin })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, snackData: Partial<CreateSnackData>): Promise<Snack> {
        console.log('API: Updating snack with ID:', id);
        console.log('API: Update data:', snackData);

        // First, get the current snack data to calculate profit_margin correctly
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

        // Calculate profit_margin with the merged data
        const profit_margin = (updatedData.sale_price - updatedData.purchase_price) * updatedData.stock;
        console.log('API: Calculated profit_margin:', profit_margin);

        const { data, error } = await supabase
            .from('snack')
            .update({ ...snackData, profit_margin })
            .eq('id_snack', id)
            .select()
            .single();

        if (error) {
            console.error('API: Error updating snack:', error);
            throw error;
        }

        console.log('API: Update successful, returned data:', data);
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('snack')
            .delete()
            .eq('id_snack', id);

        if (error) throw error;
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

    async create(personData: CreatePersonData): Promise<Person> {
        const { data, error } = await supabase
            .from('person')
            .insert(personData)
            .select()
            .single();

        if (error) throw error;
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
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('person')
            .delete()
            .eq('id_person', id);

        if (error) throw error;
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
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async create(saleData: CreateSaleData): Promise<Sale> {
        console.log('API: Creating sale with data:', saleData);

        // Get snack details to calculate total amount and check stock
        const { data: snack, error: snackError } = await supabase
            .from('snack')
            .select('sale_price, stock')
            .eq('id_snack', saleData.snack_id)
            .single();

        console.log('API: Snack lookup result:', { snack, snackError, snack_id: saleData.snack_id });

        if (!snack) throw new Error('Snack not found');

        // Check if there's enough stock
        if (snack.stock < saleData.quantity) {
            throw new Error(`Stock insuficiente. Solo hay ${snack.stock} unidades disponibles.`);
        }

        const total = snack.sale_price * saleData.quantity;
        const newStock = snack.stock - saleData.quantity;

        // Start a transaction-like operation
        // First, update the stock
        const { error: stockError } = await supabase
            .from('snack')
            .update({ stock: newStock })
            .eq('id_snack', saleData.snack_id);

        if (stockError) {
            console.error('Error updating stock:', stockError);
            throw new Error('Error al actualizar el stock');
        }

        // Then create the sale
        const { data, error } = await supabase
            .from('sale')
            .insert({ ...saleData, total })
            .select('*')
            .single();

        if (error) {
            // If sale creation fails, we should rollback the stock update
            // For now, we'll just log the error
            console.error('Error creating sale after stock update:', error);
            throw error;
        }

        // If sale is not paid, create a debt record
        if (saleData.paid === 0) {
            await debtApi.create({
                id_sale: data.id_sale,
                amount: total,
                paid: 'pending'
            });
        }

        return data;
    },

    async update(id: string, saleData: Partial<CreateSaleData>): Promise<Sale> {
        const { data, error } = await supabase
            .from('sale')
            .update(saleData)
            .eq('id_sale', id)
            .select('*')
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
                    snack:snack_id(*),
                    person:person_id(*)
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
                    snack:snack_id(*),
                    person:person_id(*)
                )
            `)
            .single();

        if (error) throw error;
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
                    snack:snack_id(*),
                    person:person_id(*)
                )
            `)
            .single();

        if (error) throw error;
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
                    snack:snack_id(*),
                    person:person_id(*)
                )
            `)
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('debt')
            .delete()
            .eq('id_debt', id);

        if (error) throw error;
    }
};

// Reports
export const reportsApi = {
    async getReports(): Promise<Reports> {
        // Get total investment (sum of all snack purchase prices * stock)
        const { data: snacks } = await supabase
            .from('snack')
            .select('purchase_price, stock');

        // Get total sales
        const { data: sales } = await supabase
            .from('sale')
            .select('total');

        // Get total debts
        const { data: debts } = await supabase
            .from('debt')
            .select('amount')
            .eq('paid', 'pending');

        const total_investment = snacks?.reduce((sum, snack) => sum + (snack.purchase_price * snack.stock), 0) || 0;
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
