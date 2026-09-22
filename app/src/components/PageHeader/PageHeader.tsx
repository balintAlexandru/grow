import type { ReactNode } from 'react'
import './PageHeader.css'

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
}

export default function PageHeader({ eyebrow, title, description, icon, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      {icon}
      <div className="page-header__text">
        {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p className="page-header__description">{description}</p>
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </header>
  )
}
