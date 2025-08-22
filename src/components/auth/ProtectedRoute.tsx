'use client';

import { useAuth } from './AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, loading, mounted } = useAuth();
    const router = useRouter();

    // Mostrar loading mientras se verifica la autenticación
    if (loading || !mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Si no está autenticado, mostrar mensaje de acceso denegado
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
                <Card className="max-w-md w-full p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-2xl font-bold text-slate-900">Acceso Denegado</h1>
                        <p className="text-slate-600 leading-relaxed">
                            No tienes permisos para acceder a esta sección.
                            Esta área es exclusiva para administradores del sistema.
                        </p>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-lg">
                        <Lock className="h-4 w-4" />
                        <span>Área Administrativa Protegida</span>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => router.push('/')}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver al Inicio
                        </Button>

                        <Button
                            onClick={() => router.push('/login')}
                            variant="secondary"
                            className="w-full"
                        >
                            Iniciar Sesión como Administrador
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Si está autenticado, mostrar el contenido protegido
    return <>{children}</>;
}
