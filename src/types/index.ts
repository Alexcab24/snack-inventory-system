export interface Snack {
    id_snack: string;
    name: string;
    // Purchase information
    purchase_type: 'box' | 'bag'; // 'box' = caja, 'bag' = funda
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
    purchase_type: 'box' | 'bag';
    units_per_container: number;
    container_cost: number;
    containers_purchased: number; // Cantidad de cajas/fundas compradas
    unit_sale_price: number;
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
