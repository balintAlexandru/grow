import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import PageHeader from '../components/PageHeader/PageHeader'
import { sections } from '../config/sections'
import './HomePage.css'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bună dimineața'
  if (hour < 18) return 'Bună ziua'
  return 'Bună seara'
}

export default function HomePage() {
  return (
    <>
      <PageHeader
        eyebrow={greeting()}
        title="Spațiul tău de creștere"
        description="Alege o secțiune din meniu și continuă de unde ai rămas. Totul, într-un singur loc."
      />

      <section className="card-grid">
        {sections.map(({ id, label, path, icon: Icon, accent, tagline }) => (
          <Link key={id} to={path} className="section-tile" style={{ '--accent': accent } as CSSProperties}>
            <span className="icon-badge section-tile__icon">
              <Icon size={22} />
            </span>
            <div>
              <h2>{label}</h2>
              <p>{tagline}</p>
            </div>
            <span className="section-tile__footer">
              Deschide
              <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </section>
    </>
  )
}
