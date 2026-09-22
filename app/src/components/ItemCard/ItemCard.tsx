import type { MockItem } from '../../data/mockItems'
import './ItemCard.css'

export default function ItemCard({ title, meta, note, progress }: MockItem) {
  return (
    <article className="item-card">
      <p className="item-card__meta">{meta}</p>
      <h3>{title}</h3>
      <p className="item-card__note">{note}</p>
      {progress !== undefined && (
        <div className="item-card__progress" aria-label={`Progres ${progress}%`}>
          <div className="item-card__bar">
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>{progress}%</small>
        </div>
      )}
    </article>
  )
}
