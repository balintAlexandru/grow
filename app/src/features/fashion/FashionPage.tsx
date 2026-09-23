import { useState } from 'react'
import { BookmarkPlus, Check, ExternalLink, ImageOff, MapPin, Shirt } from 'lucide-react'
import type { CSSProperties } from 'react'
import GenerateButton from '../../components/GenerateButton/GenerateButton'
import PageHeader from '../../components/PageHeader/PageHeader'
import type { Section } from '../../config/sections'
import WishlistModal from './WishlistModal'
import guide from '../../content/fashion/style.json'
import { findOccasion, occasions } from './occasions'
import { useWishlist } from './wishlist'
import type { FashionGuide, WardrobeItem } from './types'
import './fashion.css'

const style = guide as FashionGuide

const TABS = [
  { id: 'outfits', label: 'Ținute', emoji: '🪞' },
  { id: 'wardrobe', label: 'Piese', emoji: '🧥' },
  { id: 'rules', label: 'Reguli', emoji: '📐' },
  { id: 'trends', label: 'Trenduri', emoji: '✨' },
  { id: 'shops', label: 'Magazine', emoji: '🛍️' },
] as const

/** Shop photos die when a product sells out: a missing one shows the name, a broken one says so. */
function Photo({ src, alt, className }: { src?: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed)
    return (
      <div className={`${className} photo--missing`}>
        {failed && <ImageOff size={18} />}
        <span>{failed ? 'Poza nu mai e disponibilă' : alt}</span>
      </div>
    )
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
}

/** Without a photo of the whole look, the outfit is shown as its pieces, side by side. */
function Collage({ items }: { items: WardrobeItem[] }) {
  return (
    <div className="outfit__collage">
      {items.slice(0, 4).map((item) => (
        <Photo key={item.id} src={item.image?.url} alt={item.name} className="outfit__collage-cell" />
      ))}
    </div>
  )
}

export default function FashionPage({ section }: { section: Section }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('outfits')
  const [occasion, setOccasion] = useState('')
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [openItem, setOpenItem] = useState<WardrobeItem | null>(null)
  const { entries, add, remove, has } = useWishlist()

  const byId = new Map(style.wardrobe.map((item) => [item.id, item]))
  const shopName = (id: string) => style.shops.find((s) => s.id === id)?.name
  const outfits = occasion ? style.outfits.filter((o) => o.occasion === occasion) : style.outfits
  const addItem = (item: WardrobeItem) => add({ title: item.name, url: item.image?.productUrl ?? item.url, image: item.image?.url, note: item.price })

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
        description="Vezi cum arată combinațiile, nu doar cum se descriu: ținute pe om, piesele din care sunt făcute și de unde le iei din București."
      />

      <div className="learning-areas" role="group" aria-label="Alege o secțiune">
        {TABS.map((t) => (
          <button key={t.id} className="chip" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

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

          <div className="outfit-grid">
            {outfits.map((outfit) => {
              const where = findOccasion(outfit.occasion)
              const items = (outfit.itemIds ?? []).map((id) => byId.get(id)).filter((i): i is WardrobeItem => Boolean(i))
              return (
                <article key={outfit.id} className="outfit">
                  {outfit.photo ? <Photo src={outfit.photo.url} alt={outfit.name} className="outfit__photo" /> : <Collage items={items} />}
                  <div className="outfit__body">
                    <span className="fashion-card__layer">
                      {where?.emoji} {where?.label}
                    </span>
                    <h3>{outfit.name}</h3>
                    {outfit.photo && <p className="outfit__watch">{outfit.photo.watch}</p>}
                    <div className="outfit__pieces">
                      {items.map((item) => (
                        <button key={item.id} className="piece" onClick={() => setOpenItem(item)} title={item.name}>
                          <Photo src={item.image?.url} alt={item.name} className="piece__photo" />
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                    {outfit.avoid && (
                      <p className="fashion-card__avoid">
                        <strong>De evitat:</strong> {outfit.avoid}
                      </p>
                    )}
                    {outfit.photo && (
                      <a className="outfit__credit" href={outfit.photo.sourceUrl} target="_blank" rel="noreferrer">
                        {outfit.photo.credit} <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}

      {tab === 'wardrobe' && (
        <div className="wardrobe-grid">
          {style.wardrobe.map((item) => (
            <article key={item.id} className="wardrobe-item">
              <button className="wardrobe-item__photo-button" onClick={() => setOpenItem(item)}>
                <Photo src={item.image?.url} alt={item.name} className="wardrobe-item__photo" />
              </button>
              <div className="wardrobe-item__body">
                <span className="fashion-card__layer">{item.layer}</span>
                <h3>{item.name}</h3>
                <p className="wardrobe-item__price">{item.price}</p>
                <div className="fashion-card__actions">
                  <button className="button button--ghost" disabled={has(item.name)} onClick={() => addItem(item)}>
                    {has(item.name) ? <Check size={16} /> : <BookmarkPlus size={16} />} {has(item.name) ? 'Salvat' : 'Wishlist'}
                  </button>
                  <button className="fashion-card__link" onClick={() => setOpenItem(item)}>
                    Detalii
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

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

      {openItem && (
        <div className="reader-backdrop" onClick={() => setOpenItem(null)}>
          <div className="reader item-sheet" role="dialog" aria-modal="true" aria-label={openItem.name} onClick={(e) => e.stopPropagation()}>
            <button className="reader__close" aria-label="Închide" onClick={() => setOpenItem(null)}>
              ✕
            </button>
            <Photo src={openItem.image?.url} alt={openItem.name} className="item-sheet__photo" />
            <h1>{openItem.name}</h1>
            <p className="reader__meta">
              {openItem.price} · {openItem.brands.join(' · ')}
            </p>
            <p>{openItem.why}</p>
            <p className="fashion-card__tip">
              <Check size={15} /> <span>{openItem.lookFor}</span>
            </p>
            <p className="fashion-card__look">
              <MapPin size={14} /> {openItem.shopIds.map(shopName).filter(Boolean).join(', ')}
            </p>
            <div className="fashion-card__actions">
              <button className="button" disabled={has(openItem.name)} onClick={() => addItem(openItem)}>
                {has(openItem.name) ? <Check size={16} /> : <BookmarkPlus size={16} />} {has(openItem.name) ? 'Salvat' : 'Salvează în wishlist'}
              </button>
              {(openItem.image?.productUrl ?? openItem.url) && (
                <a className="fashion-card__link" href={openItem.image?.productUrl ?? openItem.url} target="_blank" rel="noreferrer">
                  Vezi în magazin <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {wishlistOpen && <WishlistModal entries={entries} onAdd={add} onRemove={remove} onClose={() => setWishlistOpen(false)} />}
    </div>
  )
}
