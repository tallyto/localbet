import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { LogOut, User, ChevronRight, Bell, Award, Trophy, Target } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Layout({ children, breadcrumb }: { children: React.ReactNode; breadcrumb?: BreadcrumbItem[] }) {
  const { user, logout } = useAuth()
  const { notifications, unreadCount, readIds, markAllAsRead, markAsRead } = useNotifications()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function openNotification(href: string, id: string) {
    markAsRead(id)
    setShowNotifications(false)
    navigate(href)
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
            <div className="relative">
              <button
                onClick={() => setShowNotifications(open => !open)}
                className="relative p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Notificações</p>
                      <p className="text-xs text-gray-400">{unreadCount} não lida{unreadCount !== 1 ? 's' : ''}</p>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
                        <Bell className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Nada novo por enquanto</p>
                      <p className="text-xs text-gray-400 mt-1">As novidades aparecem quando os rankings forem atualizados.</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                      {notifications.map(item => {
                        const unread = !readIds.includes(item.id)
                        const Icon = item.title.includes('Nível') ? Award : item.title.includes('liderando') || item.title.includes('pódio') ? Trophy : Target
                        const toneClass = item.tone === 'success'
                          ? 'bg-brand-50 text-brand-700'
                          : item.tone === 'warning'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-blue-50 text-blue-700'

                        return (
                          <button
                            key={item.id}
                            onClick={() => openNotification(item.href, item.id)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex gap-3">
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${toneClass}`}>
                                <Icon className="w-4 h-4" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-gray-900 truncate">{item.title}</span>
                                  {unread && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
                                </span>
                                <span className="text-xs text-gray-500 block mt-0.5 leading-relaxed">{item.description}</span>
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

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
