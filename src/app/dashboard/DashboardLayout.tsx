'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ThemeToggle'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/forms', label: 'Forms', icon: FileText },
  { href: '/dashboard/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({
  children,
  userEmail,
}: {
  children: React.ReactNode
  userEmail: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#05070a] border-r border-gray-100 dark:border-white/5">
      {/* Brand Section */}
      <div className="px-8 py-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-blue-600 rounded-[1.2rem] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            F
          </div>
          <span className="font-syne font-black text-xl tracking-tighter">FormTrack</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                  : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'group-hover:text-blue-600'}`} />
              {item.label}
              {isActive && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 space-y-4">
        {/* Pro Banner */}
        <div className="p-6 bg-blue-600/5 dark:bg-blue-600/10 rounded-[2.5rem] border border-blue-600/10 relative overflow-hidden group">
           <Sparkles className="absolute -top-4 -right-4 w-20 h-20 text-blue-600/10 group-hover:scale-125 transition-transform" />
           <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Pro Plan</p>
           <p className="text-xs font-bold mb-4 leading-relaxed">Unlock advanced UTM insights & custom domains.</p>
           <Link href="/dashboard/billing" className="block w-full py-2.5 bg-blue-600 text-white text-center text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
             Upgrade Now
           </Link>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
           <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-3">
               <div className="w-9 h-9 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center border border-white/5 shadow-sm">
                 <span className="text-xs font-black">{userEmail.charAt(0).toUpperCase()}</span>
               </div>
               <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate max-w-[100px]">{userEmail.split('@')[0]}</p>
               </div>
             </div>
             <ThemeToggle />
           </div>

           <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-white dark:bg-[#05070a] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col flex-shrink-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 h-full shadow-2xl animate-in slide-in-from-left duration-500">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-gray-50 dark:bg-[#05070a]">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center justify-between px-6 bg-white dark:bg-[#05070a] border-b border-gray-100 dark:border-white/5 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
            <Menu className="w-6 h-6 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">F</div>
             <span className="font-syne font-black tracking-tighter">FormTrack</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Global Decor */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-grid opacity-[0.2] dark:opacity-[0.1]" />
        </div>

        <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide px-4 md:px-0">
          {children}
        </main>
      </div>
    </div>
  )
}
