import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import {
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  BarChart3
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
  return (
    <div className="space-y-16">
      <div className="text-center space-y-6 sm:space-y-8">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl mb-6 sm:mb-8 transform hover:scale-110 transition-all duration-300">
          <span className="text-white text-2xl sm:text-3xl font-bold">S</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 sm:mb-8 bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
          Bienvenido al Sistema de Gestión de Snacks
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-4">
          Gestiona eficientemente tu negocio de snacks con cálculos automáticos de ganancias,
          seguimiento de ventas y gestión de deudas en una interfaz moderna e intuitiva.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 card-grid">
        {features.map((feature, index) => (
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
  );
}
