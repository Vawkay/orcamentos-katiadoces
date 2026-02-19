import { Link, useLocation } from 'react-router-dom'
import { ClipboardList, BookOpen, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  title?: string
  backHref?: string
  actions?: React.ReactNode
  hideNav?: boolean
}

const NAV_ITEMS = [
  { href: '/', label: 'Orçamentos', icon: ClipboardList },
  { href: '/catalogo', label: 'Catálogo', icon: BookOpen },
  { href: '/configuracoes', label: 'Ajustes', icon: Settings },
]

export function AppShell({ children, title, backHref, actions, hideNav }: AppShellProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      {(title || backHref || actions) && (
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 px-4 h-14">
            {backHref && (
              <Link
                to={backHref}
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 -ml-1 transition-colors"
                aria-label="Voltar"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            )}
            {!backHref && (
              <div className="flex items-center gap-2">
                <span className="text-xl">🍬</span>
              </div>
            )}
            <h1 className="flex-1 font-semibold text-gray-900 text-lg truncate">
              {title || 'Katia Doces'}
            </h1>
            {actions && (
              <div className="flex items-center gap-1">
                {actions}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 shadow-lg max-w-lg mx-auto">
          <div className="flex items-center" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(href)

              return (
                <Link
                  key={href}
                  to={href}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors',
                    isActive
                      ? 'text-pink-600'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
