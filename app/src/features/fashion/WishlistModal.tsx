import { useEffect, useState } from 'react'
import { ExternalLink, Plus, Trash2, X } from 'lucide-react'
import type { WishlistEntry } from './types'

type WishlistModalProps = {
  entries: WishlistEntry[]
  onAdd: (entry: { title: string; note?: string; url?: string; image?: string }) => void
  onRemove: (id: string) => void
  onClose: () => void
}

/** Pieces the owner wants to buy or try: a title, an optional shop link, a picture link and a note. */
export default function WishlistModal({ entries, onAdd, onRemove, onClose }: WishlistModalProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), url: url.trim() || undefined, image: image.trim() || undefined, note: note.trim() || undefined })
    setTitle('')
    setUrl('')
    setImage('')
    setNote('')
  }

  return (
    <div className="reader-backdrop" onClick={onClose}>
      <div className="reader wishlist" role="dialog" aria-modal="true" aria-label="Wishlist" onClick={(e) => e.stopPropagation()}>
        <button className="reader__close" aria-label="Închide wishlist-ul" onClick={onClose}>
          <X size={20} />
        </button>

        <h1>Wishlist</h1>
        <p className="reader__hook">Piese pe care vrei să le cumperi sau doar să le ai în minte. Le ții aici, cu link și poză.</p>

        <form className="wishlist__form" onSubmit={submit}>
          <label>
            Ce piesă?
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Geacă chore olive, Carhartt" required />
          </label>
          <label>
            Link spre produs (opțional)
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." type="url" />
          </label>
          <label>
            Link spre poză (opțional)
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://.../poza.jpg" type="url" />
          </label>
          <label>
            Notă (opțional)
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mărimea M, de probat la Footshop" />
          </label>
          <button className="button" type="submit">
            <Plus size={18} /> Adaugă
          </button>
        </form>

        {entries.length === 0 ? (
          <p className="learning-hint">Nimic salvat încă. Adaugă de aici sau cu butonul „Wishlist” de pe piesele recomandate.</p>
        ) : (
          <ul className="wishlist__list">
            {entries.map((entry) => (
              <li key={entry.id}>
                {entry.image && <img src={entry.image} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} />}
                <div>
                  <strong>{entry.title}</strong>
                  {entry.note && <p>{entry.note}</p>}
                  {entry.url && (
                    <a href={entry.url} target="_blank" rel="noreferrer">
                      Vezi produsul <ExternalLink size={13} />
                    </a>
                  )}
                </div>
                <button className="wishlist__remove" aria-label={`Șterge ${entry.title}`} onClick={() => onRemove(entry.id)}>
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
