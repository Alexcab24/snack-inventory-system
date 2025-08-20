import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center space-y-6">
                <h1 className="text-6xl font-bold text-gray-900">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700">Página no encontrada</h2>
                <p className="text-gray-600 max-w-md">
                    Lo sentimos, la página que buscas no existe o ha sido movida.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}
