import { useState, useEffect } from 'react';

// Utility functions for the snack system

/**
 * Handles numeric input changes, allowing users to clear the field and enter new values
 * @param value - The current input value
 * @param setValue - Function to update the value
 * @param min - Minimum allowed value (default: 0)
 * @returns Function to handle input change
 */
export function handleNumericInput(
    value: number,
    setValue: (value: number) => void,
    min: number = 0
) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Allow empty string for clearing the input
        if (inputValue === '') {
            setValue(0);
            return;
        }

        // Parse the numeric value
        const numericValue = parseFloat(inputValue);

        // Check if it's a valid number
        if (!isNaN(numericValue)) {
            // Apply minimum constraint
            const finalValue = Math.max(numericValue, min);
            setValue(finalValue);
        }
    };
}

/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
    amount: number,
    currency: string = 'USD',
    locale: string = 'en-US'
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(amount);
}

/**
 * Formats a date to Spanish locale
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Query params utilities
export function useQueryParams() {
    const [searchParams, setSearchParams] = useState<URLSearchParams>(new URLSearchParams());
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setSearchParams(new URLSearchParams(window.location.search));
    }, []);

    const getParam = (key: string, defaultValue: string = '') => {
        if (!isClient) return defaultValue;
        return searchParams.get(key) || defaultValue;
    };

    const setParam = (key: string, value: string) => {
        if (!isClient) return;
        const newSearchParams = new URLSearchParams(searchParams);
        if (value) {
            newSearchParams.set(key, value);
        } else {
            newSearchParams.delete(key);
        }
        setSearchParams(newSearchParams);
        window.history.pushState({}, '', `${window.location.pathname}?${newSearchParams.toString()}`);
    };

    const setMultipleParams = (params: Record<string, string>) => {
        if (!isClient) return;
        const newSearchParams = new URLSearchParams(searchParams);
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                newSearchParams.set(key, value);
            } else {
                newSearchParams.delete(key);
            }
        });
        setSearchParams(newSearchParams);
        window.history.pushState({}, '', `${window.location.pathname}?${newSearchParams.toString()}`);
    };

    return { getParam, setParam, setMultipleParams };
}

// Pagination utilities
export function getPaginatedData<T>(data: T[], page: number, pageSize: number) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
}

export function getTotalPages(totalItems: number, pageSize: number) {
    return Math.ceil(totalItems / pageSize);
}

// Search utilities
export function filterBySearch<T>(
    data: T[],
    searchTerm: string,
    searchFields: (keyof T)[],
    dateFields?: { field: keyof T; format: 'date' | 'datetime' }[]
) {
    if (!searchTerm.trim()) return data;

    const lowerSearchTerm = searchTerm.toLowerCase();

    return data.filter(item => {
        // Check regular text fields
        const textMatch = searchFields.some(field => {
            const value = item[field];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(lowerSearchTerm);
        });

        if (textMatch) return true;

        // Check date fields if provided
        if (dateFields) {
            const dateMatch = dateFields.some(({ field, format }) => {
                const value = item[field];
                if (!value) return false;

                try {
                    const date = new Date(value as string);
                    if (isNaN(date.getTime())) return false;

                    if (format === 'date') {
                        return date.toLocaleDateString('es-ES').includes(lowerSearchTerm);
                    } else {
                        return date.toLocaleString('es-ES').includes(lowerSearchTerm);
                    }
                } catch {
                    return false;
                }
            });

            if (dateMatch) return true;
        }

        return false;
    });
}
