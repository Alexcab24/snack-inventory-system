import { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string | number; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, id, ...props }, ref) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                        {label}
                    </label>
                )}
                <select
                    id={selectId}
                    className={clsx(
                        'flex h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-blue-400 focus:border-blue-500 shadow-sm hover:shadow-md text-slate-900',
                        error && 'border-red-500 focus-visible:ring-red-500',
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    <option value="">Seleccionar una opción</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export { Select };
