import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, User, ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Layout({ children, breadcrumb }: { children: React.ReactNode; breadcrumb?: BreadcrumbItem[] }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-nav sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link to="/dashboard" className="flex items-center gap-1.5 flex-shrink-0">
              <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                L
              </span>
              <span className="font-bold text-gray-900 text-sm hidden sm:block">LocalBet</span>
            </Link>

            {breadcrumb?.map((item, i) => (
              <span key={i} className="flex items-center gap-1 min-w-0">
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                {item.href ? (
                  <Link to={item.href} className="text-sm text-gray-500 hover:text-gray-700 truncate max-w-[140px]">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-sm text-gray-800 font-medium truncate max-w-[140px]">{item.label}</span>
                )}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Link
              to="/account"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm text-gray-700 hidden sm:block group-hover:text-gray-900 max-w-[120px] truncate">
                {user?.name}
              </span>
              <User className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
