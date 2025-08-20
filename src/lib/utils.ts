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
