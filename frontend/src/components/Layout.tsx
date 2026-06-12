import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/dashboard" className="text-xl font-bold text-green-600 flex-shrink-0">
              LocalBet
            </Link>
            {breadcrumb && breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-2 min-w-0">
                <span className="text-gray-300">/</span>
                {item.href ? (
                  <Link to={item.href} className="text-sm text-gray-500 hover:text-gray-700 truncate max-w-[160px]">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-sm text-gray-700 font-medium truncate max-w-[160px]">{item.label}</span>
                )}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to="/account" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              {user?.name}
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
