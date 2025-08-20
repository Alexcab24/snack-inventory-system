'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
    value: string | number;
    label: string;
    icon?: React.ReactNode;
    description?: string;
}

interface SelectProps {
    label?: string;
    value: string | number;
    onChange: (value: string | number) => void;
    options: SelectOption[];
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
    variant?: 'default' | 'outlined' | 'filled';
    size?: 'sm' | 'md' | 'lg';
}

export function Select({
    label,
    value,
    onChange,
    options,
    placeholder = 'Seleccionar una opción',
    required = false,
    disabled = false,
    error,
    className = '',
    variant = 'default',
    size = 'md'
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const selectedOption = options.find(option => option.value === value);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getVariantClasses = () => {
        switch (variant) {
            case 'outlined':
                return 'border-2 border-gray-200 bg-white hover:border-blue-300 focus:border-blue-500';
            case 'filled':
                return 'border-0 bg-gray-50 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500';
            default:
                return 'border border-gray-300 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200';
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-2 text-sm';
            case 'lg':
                return 'px-4 py-3 text-lg';
            default:
                return 'px-4 py-2.5 text-base';
        }
    };

    const handleSelect = (option: SelectOption) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div ref={selectRef} className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
                        w-full text-left transition-all duration-200 rounded-lg
                        ${getVariantClasses()}
                        ${getSizeClasses()}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                        ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                    `}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                            {selectedOption ? (
                                <>
                                    {selectedOption.icon && (
                                        <span className="flex-shrink-0 text-gray-500">
                                            {selectedOption.icon}
                                        </span>
                                    )}
                                    <span className="truncate text-gray-900">
                                        {selectedOption.label}
                                    </span>
                                    {selectedOption.description && (
                                        <span className="text-sm text-gray-500 truncate">
                                            ({selectedOption.description})
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="text-gray-500">{placeholder}</span>
                            )}
                        </div>
                        <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                        {/* Search input */}
                        <div className="p-2 border-b border-gray-100">
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                            />
                        </div>

                        {/* Options list */}
                        <div className="max-h-48 overflow-y-auto">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`
                                            w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150
                                            ${option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                                                {option.icon && (
                                                    <span className="flex-shrink-0 text-gray-500">
                                                        {option.icon}
                                                    </span>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium truncate">
                                                        {option.label}
                                                    </div>
                                                    {option.description && (
                                                        <div className="text-sm text-gray-500 truncate">
                                                            {option.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {option.value === value && (
                                                <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                    No se encontraron opciones
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
