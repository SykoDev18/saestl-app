import { Sidebar, Header } from '@/components/layout'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile from our users table (using email)
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email ?? '')
    .single()

  // If no profile exists, create basic user data from auth
  const userData = profile ? {
    full_name: (profile as { full_name?: string }).full_name || user.email?.split('@')[0] || 'Usuario',
    email: user.email || '',
    role: (profile as { role?: string }).role || 'viewer',
    avatar_url: (profile as { avatar_url?: string }).avatar_url || null,
  } : {
    full_name: user.email?.split('@')[0] || 'Usuario',
    email: user.email || '',
    role: 'viewer',
    avatar_url: null,
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header user={userData} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
