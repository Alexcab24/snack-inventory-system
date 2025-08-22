import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SalesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
