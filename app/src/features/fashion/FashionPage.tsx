import { useState } from 'react'
import { BookmarkPlus, Check, ExternalLink, MapPin, Shirt } from 'lucide-react'
import type { CSSProperties } from 'react'
import GenerateButton from '../../components/GenerateButton/GenerateButton'
import PageHeader from '../../components/PageHeader/PageHeader'
import type { Section } from '../../config/sections'
import WishlistModal from './WishlistModal'
import guide from '../../content/fashion/style.json'
import { findOccasion, occasions } from './occasions'
import { useWishlist } from './wishlist'
import type { FashionGuide } from './types'
import './fashion.css'

const style = guide as FashionGuide

const TABS = [
  { id: 'rules', label: 'Bazele', emoji: '📐' },
  { id: 'wardrobe', label: 'Garderoba de bază', emoji: '🧥' },
  { id: 'outfits', label: 'Ținute', emoji: '🪞' },
  { id: 'trends', label: 'Trenduri', emoji: '✨' },
  { id: 'shops', label: 'Magazine', emoji: '🛍️' },
] as const

export default function FashionPage({ section }: { section: Section }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('rules')
  const [occasion, setOccasion] = useState('')
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const { entries, add, remove, has } = useWishlist()

  const shopName = (id: string) => style.shops.find((s) => s.id === id)?.name
  const outfits = occasion ? style.outfits.filter((o) => o.occasion === occasion) : style.outfits

  return (
    <div style={{ '--accent': section.accent } as CSSProperties}>
      <PageHeader
        icon={
          <span className="icon-badge" style={{ width: 52, height: 52 }}>
            <Shirt size={26} />
          </span>
        }
        action={
          <div className="fashion-actions">
            <button className="button button--ghost" onClick={() => setWishlistOpen(true)}>
              <BookmarkPlus size={18} /> Wishlist {entries.length > 0 && `(${entries.length})`}
            </button>
            <GenerateButton task="fashion" label="Generează stil nou" duration="15–25 de minute" />
          </div>
        }
        eyebrow={section.tagline}
        title={section.label}
        description="Stil urban minimalist, construit pas cu pas: regulile care contează, garderoba de bază, ținute gata făcute pentru fiecare ocazie și de unde le cumperi din București."
      />

      <div className="learning-areas" role="group" aria-label="Alege o secțiune">
        {TABS.map((t) => (
          <button key={t.id} className="chip" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <p className="learning-hint">
        Actualizat pe {new Date(style.generatedAt).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })} · prețurile
        sunt orientative
      </p>

      {tab === 'rules' && (
        <div className="card-grid">
          {style.rules.map((rule) => (
            <article key={rule.id} className="fashion-card">
              <h3>{rule.title}</h3>
              <p>{rule.body}</p>
              <p className="fashion-card__tip">
                <Check size={15} /> {rule.tip}
              </p>
            </article>
          ))}
        </div>
      )}

      {tab === 'wardrobe' && (
        <div className="card-grid">
          {style.wardrobe.map((item) => (
            <article key={item.id} className="fashion-card">
              <span className="fashion-card__layer">{item.layer}</span>
              <h3>{item.name}</h3>
              <p>{item.why}</p>
              <p className="fashion-card__look">
                <strong>La ce te uiți:</strong> {item.lookFor}
              </p>
              <ul className="fashion-card__meta">
                <li>{item.price}</li>
                <li>{item.brands.join(' · ')}</li>
                <li>
                  <MapPin size={14} /> {item.shopIds.map(shopName).filter(Boolean).join(', ')}
                </li>
              </ul>
              <div className="fashion-card__actions">
                <button
                  className="button button--ghost"
                  disabled={has(item.name)}
                  onClick={() => add({ title: item.name, url: item.url, note: `${item.price} · ${item.brands.join(', ')}` })}
                >
                  {has(item.name) ? <Check size={16} /> : <BookmarkPlus size={16} />} {has(item.name) ? 'În wishlist' : 'Wishlist'}
                </button>
                {item.url && (
                  <a className="fashion-card__link" href={item.url} target="_blank" rel="noreferrer">
                    Vezi modele <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === 'outfits' && (
        <>
          <div className="learning-areas" role="group" aria-label="Filtrează după ocazie">
            <button className="chip" aria-pressed={occasion === ''} onClick={() => setOccasion('')}>
              Toate <span>{style.outfits.length}</span>
            </button>
            {occasions.map((o) => (
              <button key={o.id} className="chip" aria-pressed={occasion === o.id} onClick={() => setOccasion(o.id)}>
                {o.emoji} {o.label} <span>{style.outfits.filter((x) => x.occasion === o.id).length}</span>
              </button>
            ))}
          </div>
          <div className="card-grid">
            {outfits.map((outfit) => {
              const where = findOccasion(outfit.occasion)
              return (
                <article key={outfit.id} className="fashion-card">
                  {where && (
                    <span className="fashion-card__layer">
                      {where.emoji} {where.label}
                    </span>
                  )}
                  <h3>{outfit.name}</h3>
                  <ol className="fashion-card__pieces">
                    {outfit.pieces.map((piece) => (
                      <li key={piece}>{piece}</li>
                    ))}
                  </ol>
                  <p>{outfit.why}</p>
                  {outfit.avoid && (
                    <p className="fashion-card__avoid">
                      <strong>De evitat:</strong> {outfit.avoid}
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        </>
      )}

      {tab === 'trends' && (
        <div className="card-grid">
          {style.trends.map((trend) => (
            <article key={trend.id} className="fashion-card">
              <h3>{trend.title}</h3>
              <p>{trend.body}</p>
              <p className="fashion-card__tip">
                <Check size={15} /> {trend.howToWear}
              </p>
              <a className="fashion-card__link" href={trend.source.url} target="_blank" rel="noreferrer">
                {trend.source.title} <ExternalLink size={13} />
              </a>
            </article>
          ))}
        </div>
      )}

      {tab === 'shops' && (
        <div className="card-grid">
          {style.shops.map((shop) => (
            <article key={shop.id} className="fashion-card">
              <span className="fashion-card__layer">{shop.kind}</span>
              <h3>{shop.name}</h3>
              {shop.address && (
                <p className="fashion-card__look">
                  <MapPin size={14} /> {shop.address}
                </p>
              )}
              <p>{shop.what}</p>
              <a className="fashion-card__link" href={shop.url} target="_blank" rel="noreferrer">
                Deschide <ExternalLink size={13} />
              </a>
            </article>
          ))}
        </div>
      )}

      {wishlistOpen && <WishlistModal entries={entries} onAdd={add} onRemove={remove} onClose={() => setWishlistOpen(false)} />}
    </div>
  )
}
