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

export interface PersonWithDebt extends Person {
    total_debt: number;
}

export interface SaleItem {
    id_sale_item: string;
    sale_id: string;
    snack_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    created_at: string;
    // Relations
    snack?: Snack;
}

export interface Sale {
    id_sale: string;
    person_id: string;
    sale_date: string;
    created_at: string;
    total: number;
    paid: number; // 0 = false, 1 = true
    // Relations
    person?: Person;
    items?: SaleItem[];
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

export interface ActivityLog {
    id_log: string;
    entity_type: 'snack' | 'person' | 'sale' | 'debt' | 'system';
    entity_id: string | null;
    action: string;
    description: string | null;
    details: Record<string, unknown> | null;
    created_at: string;
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

export interface CreateSaleItemData {
    snack_id: string;
    quantity: number;
}

export interface CreateSaleData {
    person_id: string;
    items: CreateSaleItemData[];
    paid: number; // 0 = false, 1 = true
    sale_date: string;
}
