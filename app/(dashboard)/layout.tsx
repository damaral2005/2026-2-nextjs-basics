import { Sidebar } from '@/components/sidebar/Sidebar'
import { requireSession } from '@/lib/session'
import { Suspense, type ReactNode } from 'react'

async function AuthenticatedDashboard({ children }: { children: ReactNode }) {
  const { user } = await requireSession();

  return (
    <div className="flex h-screen flex-col bg-slate-100 text-slate-900 md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        <header className="mb-6 border-b border-slate-200 pb-4">
          <p className="text-sm text-slate-600">Sesión iniciada como</p>
          <p className="break-words text-lg font-semibold">{user.fullName}</p>
        </header>
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm">Verificando sesión…</p>}>
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}
