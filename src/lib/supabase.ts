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
            snack: {
                Row: {
                    id_snack: string;
                    name: string;
                    purchase_price: number;
                    sale_price: number;
                    profit_margin: number;
                    stock: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id_snack?: string;
                    name: string;
                    purchase_price: number;
                    sale_price: number;
                    profit_margin?: number;
                    stock: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id_snack?: string;
                    name?: string;
                    purchase_price?: number;
                    sale_price?: number;
                    profit_margin?: number;
                    stock?: number;
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
