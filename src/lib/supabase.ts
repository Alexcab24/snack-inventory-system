import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for better TypeScript support
export type Database = {
    public: {
        Tables: {
            activity_log: {
                Row: {
                    id_log: string;
                    entity_type: string;
                    entity_id: string | null;
                    action: string;
                    description: string | null;
                    details: Record<string, unknown> | null;
                    created_at: string;
                };
                Insert: {
                    id_log?: string;
                    entity_type: string;
                    entity_id?: string | null;
                    action: string;
                    description?: string | null;
                    details?: Record<string, unknown> | null;
                    created_at?: string;
                };
                Update: {
                    id_log?: string;
                    entity_type?: string;
                    entity_id?: string | null;
                    action?: string;
                    description?: string | null;
                    details?: Record<string, unknown> | null;
                    created_at?: string;
                };
            };
            snack: {
                Row: {
                    id_snack: string;
                    name: string;
                    // Purchase information
                    purchase_type: string; // 'box' or 'bag'
                    units_per_container: number; // units per box or bag
                    container_cost: number; // cost of box or bag
                    containers_purchased: number; // cantidad de cajas/fundas compradas
                    // Unit pricing
                    unit_cost: number; // Calculated: container_cost / units_per_container
                    unit_sale_price: number;
                    profit_margin_per_unit: number; // Calculated: unit_sale_price - unit_cost
                    // Stock tracking
                    stock: number; // Total units available (calculated: containers_purchased * units_per_container)
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id_snack?: string;
                    name: string;
                    purchase_type: string; // 'box' or 'bag'
                    units_per_container: number;
                    container_cost: number;
                    containers_purchased: number;
                    unit_cost?: number; // Auto-calculated
                    unit_sale_price: number;
                    profit_margin_per_unit?: number; // Auto-calculated
                    stock?: number; // Auto-calculated
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id_snack?: string;
                    name?: string;
                    purchase_type?: string; // 'box' or 'bag'
                    units_per_container?: number;
                    container_cost?: number;
                    containers_purchased?: number;
                    unit_cost?: number; // Auto-calculated
                    unit_sale_price?: number;
                    profit_margin_per_unit?: number; // Auto-calculated
                    stock?: number; // Auto-calculated
                    created_at?: string;
                    updated_at?: string;
                };
            };
            person: {
                Row: {
                    id_person: string;
                    name: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id_person?: string;
                    name: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id_person?: string;
                    name?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            sale: {
                Row: {
                    id_sale: string;
                    snack_id: string;
                    person_id: string;
                    created_at: string;
                    quantity: number;
                    total: number;
                    paid: number; // 0 = false, 1 = true
                };
                Insert: {
                    id_sale?: string;
                    snack_id: string;
                    person_id: string;
                    created_at?: string;
                    quantity: number;
                    total?: number;
                    paid: number; // 0 = false, 1 = true
                };
                Update: {
                    id_sale?: string;
                    snack_id?: string;
                    person_id?: string;
                    created_at?: string;
                    quantity?: number;
                    total?: number;
                    paid?: number; // 0 = false, 1 = true
                };
            };
            debt: {
                Row: {
                    id_debt: string;
                    id_sale: string;
                    amount: number;
                    amount_paid: number;
                    remaining_amount: number;
                    paid: string; // enum: 'pending', 'paid', etc.
                    created_at: string;
                };
                Insert: {
                    id_debt?: string;
                    id_sale: string;
                    amount: number;
                    amount_paid?: number;
                    paid: string; // enum: 'pending', 'paid', etc.
                    created_at?: string;
                };
                Update: {
                    id_debt?: string;
                    id_sale?: string;
                    amount?: number;
                    amount_paid?: number;
                    paid?: string; // enum: 'pending', 'paid', etc.
                    created_at?: string;
                };
            };
        };
    };
};
