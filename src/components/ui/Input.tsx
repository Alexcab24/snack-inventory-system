import { InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    enableNumericHandling?: boolean; // Enable automatic numeric input handling
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, enableNumericHandling, onChange, value, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
        const [displayValue, setDisplayValue] = useState(value);

        // Update display value when prop value changes
        useEffect(() => {
            setDisplayValue(value);
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;

            // Handle numeric inputs with better UX
            if (enableNumericHandling && props.type === 'number') {
                // Allow empty string for clearing
                if (inputValue === '') {
                    setDisplayValue('');
                    if (onChange) {
                        // Create a synthetic event with empty value
                        const syntheticEvent = {
                            ...e,
                            target: {
                                ...e.target,
                                value: ''
                            }
                        };
                        onChange(syntheticEvent);
                    }
                    return;
                }

                // Parse numeric value
                const numericValue = parseFloat(inputValue);
                if (!isNaN(numericValue)) {
                    // Apply minimum constraint if specified
                    const min = props.min ? parseFloat(props.min.toString()) : 0;
                    const finalValue = Math.max(numericValue, min);

                    setDisplayValue(finalValue.toString());
                    if (onChange) {
                        const syntheticEvent = {
                            ...e,
                            target: {
                                ...e.target,
                                value: finalValue.toString()
                            }
                        };
                        onChange(syntheticEvent);
                    }
                }
            } else {
                // Regular input handling
                setDisplayValue(inputValue);
                if (onChange) {
                    onChange(e);
                }
            }
        };

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    className={clsx(
                        'flex h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 shadow-sm hover:shadow-md text-slate-900',
                        error && 'border-red-500 focus-visible:ring-red-500',
                        className
                    )}
                    ref={ref}
                    value={displayValue}
                    onChange={handleChange}
                    {...props}
                />
                {error && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
