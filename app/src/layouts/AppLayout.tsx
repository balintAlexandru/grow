import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar/Sidebar'
import './AppLayout.css'

export default function AppLayout() {
  const { pathname } = useLocation()
  // The mobile drawer stays open only on the page where it was opened, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const menuOpen = openOn === pathname
  const setMenuOpen = (open: boolean) => setOpenOn(open ? pathname : null)

  return (
    <div className="layout">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="layout__main">
        <header className="topbar">
          <button className="topbar__menu" aria-label="Deschide meniul" onClick={() => setMenuOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="topbar__title">Grow</span>
        </header>

        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
