import { Plus } from 'lucide-react'
import type { CSSProperties } from 'react'
import ItemCard from '../components/ItemCard/ItemCard'
import PageHeader from '../components/PageHeader/PageHeader'
import type { Section } from '../config/sections'
import { mockItems } from '../data/mockItems'

/** Generic page for any section (Facade phase: renders placeholder data). */
export default function SectionPage({ section }: { section: Section }) {
  const { id, label, icon: Icon, accent, tagline, description } = section
  const items = mockItems[id] ?? []

  return (
    <div style={{ '--accent': accent } as CSSProperties}>
      <PageHeader
        icon={
          <span className="icon-badge" style={{ width: 52, height: 52 }}>
            <Icon size={26} />
          </span>
        }
        eyebrow={tagline}
        title={label}
        description={description}
        action={
          <button className="button" disabled title="În curând">
            <Plus size={18} />
            Adaugă
          </button>
        }
      />

      {items.length > 0 ? (
        <section className="card-grid">
          {items.map((item) => (
            <ItemCard key={item.id} {...item} />
          ))}
        </section>
      ) : (
        <p style={{ color: 'var(--color-text-muted)' }}>Nimic aici încă.</p>
      )}
    </div>
  )
}
