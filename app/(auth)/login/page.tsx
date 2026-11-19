import { LoginForm } from '@/components/auth/LoginForm';
import { safeDashboardPath } from '@/lib/auth-routes';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: "Iniciar sesión" };

async function LoginFormWithRedirect({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
    const { from, registered } = await searchParams;
    return <LoginForm from={safeDashboardPath(from)} registered={registered === "1"} />;
}
export default function LoginPage({ searchParams }: PageProps<"/login">) {
    return (
        <Suspense fallback={<div className="h-64 animate-pulse rounded bg-gray-700" />}>
            <LoginFormWithRedirect searchParams={searchParams} />
        </Suspense>
    );
}
