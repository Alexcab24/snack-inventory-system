import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MovementsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
