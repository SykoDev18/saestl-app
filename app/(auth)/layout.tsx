// Force dynamic rendering to prevent build-time prerendering
// which would fail without Supabase env vars
export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100">
      {children}
    </div>
  )
}
