'use client';

import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    isLoading = false
}: ConfirmModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: 'text-red-600',
                    button: 'bg-red-600 hover:bg-red-700 text-white',
                    border: 'border-red-200'
                };
            case 'warning':
                return {
                    icon: 'text-yellow-600',
                    button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
                    border: 'border-yellow-200'
                };
            case 'info':
                return {
                    icon: 'text-blue-600',
                    button: 'bg-blue-600 hover:bg-blue-700 text-white',
                    border: 'border-blue-200'
                };
            default:
                return {
                    icon: 'text-red-600',
                    button: 'bg-red-600 hover:bg-red-700 text-white',
                    border: 'border-red-200'
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'
            }`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <Card className={`relative w-full max-w-md mx-4 transform transition-all duration-200 ${isOpen ? 'scale-100' : 'scale-95'
                }`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className={`h-6 w-6 ${styles.icon}`} />
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={isLoading}
                        className="hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <p className="text-gray-600 mb-6">{message}</p>

                <div className="flex justify-end space-x-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={styles.button}
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Procesando...</span>
                            </div>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
