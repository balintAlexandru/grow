import { NavLink } from 'react-router-dom'
import { House, Sparkles, X } from 'lucide-react'
import type { CSSProperties } from 'react'
import { sections } from '../../config/sections'
import './Sidebar.css'

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div className={`sidebar-backdrop${open ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside className={`sidebar${open ? ' is-open' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__logo">
            <Sparkles size={18} />
          </span>
          <div>
            <strong>Grow</strong>
            <small>Dezvoltare personală</small>
          </div>
          <button className="sidebar__close" aria-label="Închide meniul" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Secțiuni">
          <NavLink to="/" end className="sidebar__link" style={{ '--accent': 'var(--color-primary)' } as CSSProperties}>
            <span className="icon-badge sidebar__icon">
              <House size={18} />
            </span>
            Acasă
          </NavLink>

          <p className="sidebar__label">Secțiuni</p>

          {sections.map(({ id, label, path, icon: Icon, accent }) => (
            <NavLink key={id} to={path} className="sidebar__link" style={{ '--accent': accent } as CSSProperties}>
              <span className="icon-badge sidebar__icon">
                <Icon size={18} />
              </span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">Mai multe secțiuni în curând</div>
      </aside>
    </>
  )
}
