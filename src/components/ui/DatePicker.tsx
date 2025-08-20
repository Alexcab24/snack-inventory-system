'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from './Button';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    label?: string;
    required?: boolean;
    className?: string;
}

export function DatePicker({ value, onChange, label, required, className = '' }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Parse current date from value or use today
    const parseDate = (dateString: string | null) => {
        if (!dateString) {
            const today = new Date();
            return {
                year: today.getFullYear(),
                month: today.getMonth(),
                day: today.getDate()
            };
        }
        const [year, month, day] = dateString.split('-').map(Number);
        return { year, month: month - 1, day };
    };

    const [currentDate, setCurrentDate] = useState(parseDate(value));
    const [selectedDate, setSelectedDate] = useState(parseDate(value));
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const parsed = parseDate(value);
        setSelectedDate(parsed);
        setCurrentDate(parsed);
    }, [value]);

    const formatDate = (dateObj: { year: number; month: number; day: number }) => {
        const month = String(dateObj.month + 1).padStart(2, '0');
        const day = String(dateObj.day).padStart(2, '0');
        return `${day}/${month}/${dateObj.year}`;
    };

    const getDaysInMonth = (dateObj: { year: number; month: number; day: number }) => {
        const year = dateObj.year;
        const month = dateObj.month;

        // Get first day of month and last day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ year, month, day: i });
        }

        return days;
    };

    const isToday = (dateObj: { year: number; month: number; day: number }) => {
        const today = new Date();
        return dateObj.year === today.getFullYear() &&
            dateObj.month === today.getMonth() &&
            dateObj.day === today.getDate();
    };

    const isSelected = (dateObj: { year: number; month: number; day: number }) => {
        return dateObj.year === selectedDate.year &&
            dateObj.month === selectedDate.month &&
            dateObj.day === selectedDate.day;
    };

    const isCurrentMonth = (dateObj: { year: number; month: number; day: number }) => {
        return dateObj.month === currentDate.month &&
            dateObj.year === currentDate.year;
    };

    const handleDateSelect = (dateObj: { year: number; month: number; day: number }) => {
        setSelectedDate(dateObj);
        const month = String(dateObj.month + 1).padStart(2, '0');
        const day = String(dateObj.day).padStart(2, '0');
        const dateString = `${dateObj.year}-${month}-${day}`;
        onChange(dateString);
        setIsOpen(false);
    };

    const goToPreviousMonth = () => {
        const newMonth = currentDate.month - 1;
        const newYear = newMonth < 0 ? currentDate.year - 1 : currentDate.year;
        const adjustedMonth = newMonth < 0 ? 11 : newMonth;
        setCurrentDate({ year: newYear, month: adjustedMonth, day: 1 });
    };

    const goToNextMonth = () => {
        const newMonth = currentDate.month + 1;
        const newYear = newMonth > 11 ? currentDate.year + 1 : currentDate.year;
        const adjustedMonth = newMonth > 11 ? 0 : newMonth;
        setCurrentDate({ year: newYear, month: adjustedMonth, day: 1 });
    };

    const goToToday = () => {
        const today = new Date();
        const todayObj = { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
        setCurrentDate(todayObj);
        setSelectedDate(todayObj);
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${today.getFullYear()}-${month}-${day}`;
        onChange(dateString);
        setIsOpen(false);
    };

    const clearDate = () => {
        const today = new Date();
        setSelectedDate({ year: today.getFullYear(), month: today.getMonth(), day: today.getDate() });
        onChange('');
        setIsOpen(false);
    };

    const days = getDaysInMonth(currentDate);
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-3 py-2 text-left border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : 'hover:border-gray-400'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className={value ? 'text-gray-900' : 'text-gray-500'}>
                                {value ? formatDate(selectedDate) : 'Seleccionar fecha'}
                            </span>
                        </div>
                        {value && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearDate();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </button>

                {isOpen && (
                    <div
                        ref={dropdownRef}
                        className="absolute z-50 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={goToPreviousMonth}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4 text-gray-600" />
                            </button>

                            <h3 className="text-sm font-semibold text-gray-900">
                                {monthNames[currentDate.month]} {currentDate.year}
                            </h3>

                            <button
                                type="button"
                                onClick={goToNextMonth}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                            </button>
                        </div>

                        {/* Days of week */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                                <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((date, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => date && handleDateSelect(date)}
                                    disabled={!date}
                                    className={`
                                        h-8 text-sm rounded transition-colors
                                        ${!date ? 'invisible' : ''}
                                        ${date && isToday(date) ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                                        ${date && isSelected(date) ? 'bg-blue-600 text-white font-semibold' : ''}
                                        ${date && !isToday(date) && !isSelected(date) && isCurrentMonth(date)
                                            ? 'text-gray-900 hover:bg-gray-100' : ''}
                                        ${date && !isCurrentMonth(date) ? 'text-gray-400' : ''}
                                    `}
                                >
                                    {date ? date.day : ''}
                                </button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={goToToday}
                                className="text-xs"
                            >
                                Hoy
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="text-xs"
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
