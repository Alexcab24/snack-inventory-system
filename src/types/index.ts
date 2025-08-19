export interface Snack {
    id_snack: string;
    name: string;
    purchase_price: number;
    sale_price: number;
    profit_margin: number;
    stock: number;
    created_at: string;
    updated_at: string;
}

export interface Person {
    id_person: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Sale {
    id_sale: string;
    snack_id: string;
    person_id: string;
    created_at: string;
    quantity: number;
    total: number;
    paid: number; // 0 = false, 1 = true
    // Relations
    snack?: Snack;
    person?: Person;
}

export interface Debt {
    id_debt: string;
    id_sale: string;
    amount: number;
    amount_paid: number;
    remaining_amount: number;
    paid: string; // enum: 'pending', 'paid', etc.
    created_at: string;
    // Relations
    sale?: Sale;
}

export interface Reports {
    total_investment: number;
    total_sales: number;
    total_profit: number;
    total_debts: number;
}

export interface CreateSnackData {
    name: string;
    purchase_price: number;
    sale_price: number;
    stock: number;
}

export interface CreatePersonData {
    name: string;
}

export interface CreateSaleData {
    snack_id: string;
    person_id: string;
    quantity: number;
    paid: number; // 0 = false, 1 = true
}
