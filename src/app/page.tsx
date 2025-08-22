'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigation } from '@/components/layout/Navigation';
import { PublicSnacksView } from '@/components/public/PublicSnacksView';

import {
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Eye,
  Shield,
  LogIn
} from 'lucide-react';

const features = [
  {
    name: 'Gestión de Snacks',
    description: 'Registra y gestiona snacks con cálculo automático de margen de ganancia y control de stock',
    href: '/snacks',
    icon: Package,
  },
  {
    name: 'Gestión de Personas',
    description: 'Gestiona compañeros de trabajo y clientes en el sistema',
    href: '/people',
    icon: Users,
  },
  {
    name: 'Seguimiento de Ventas',
    description: 'Registra ventas y rastrea el estado de pagos',
    href: '/sales',
    icon: ShoppingCart,
  },
  {
    name: 'Gestión de Deudas',
    description: 'Rastrea y gestiona deudas pendientes',
    href: '/debts',
    icon: CreditCard,
  },
  {
    name: 'Reportes y Análisis',
    description: 'Visualiza reportes completos y resúmenes financieros',
    href: '/reports',
    icon: BarChart3,
  },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  // Debug logging
  console.log('Auth state:', { user, isAuthenticated });

  // Si el usuario está autenticado, mostrar el dashboard administrativo
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm sm:text-lg">S</span>
                </div>
                <Link href={'/'} className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 truncate">
                  <span className="hidden sm:inline">Snack Management System</span>
                  <span className="sm:hidden">SMS</span>
                </Link>
              </div>
              <Navigation />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-16">
            <div className="text-center space-y-6 sm:space-y-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl mb-6 sm:mb-8 transform hover:scale-110 transition-all duration-300">
                <span className="text-white text-2xl sm:text-3xl font-bold">S</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 sm:mb-8 bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
                Panel de Administración
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-4">
                Gestiona eficientemente tu negocio de snacks con cálculos automáticos de ganancias,
                seguimiento de ventas y gestión de deudas en una interfaz moderna e intuitiva.
              </p>

              {/* Admin Welcome Message */}
              <div className="flex items-center justify-center space-x-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200 max-w-md mx-auto">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Acceso Administrativo - {user?.username}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 card-grid">
              {features.map((feature) => (
                <Link key={feature.name} href={feature.href}>
                  <Card className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-blue-200 hover:scale-105 transform hover:-translate-y-2">
                    <div className="flex items-start space-x-4 sm:space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                          <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3 group-hover:text-blue-700 transition-colors duration-300">
                          {feature.name}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Si el usuario NO está autenticado, mostrar la vista pública
  return (
    <>
      <PublicSnacksView />
    </>
  );
}
