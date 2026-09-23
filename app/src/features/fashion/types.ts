/**
 * Shape of `src/content/fashion/style.json`, written by the `/fashion-refresh` skill
 * and validated by `npm run fashion:check`.
 */

export type Occasion = 'birou' | 'oras' | 'restaurant' | 'weekend' | 'intalnire'

/** A principle of dressing well: short, concrete, applicable today. */
export type Rule = { id: string; title: string; body: string; tip: string }

/** One piece of the base wardrobe. */
export type WardrobeItem = {
  id: string
  name: string
  /** Layer it belongs to, for grouping: `bază`, `strat 2`, `strat 3`, `pantaloni`, `încălțăminte`, `accesorii`. */
  layer: string
  why: string
  /** What to check when buying: cut, fabric, details. */
  lookFor: string
  /** In lei, as a range: "250–450 lei". */
  price: string
  brands: string[]
  /** Ids from `shops`. */
  shopIds: string[]
  /** A page where it can be seen or bought. */
  url?: string
  /** A photo of the piece, from a shop that allows it to be shown elsewhere. */
  image?: { url: string; productUrl: string }
}

export type Outfit = {
  id: string
  occasion: Occasion
  name: string
  /** Head to toe, in the order you put them on. */
  pieces: string[]
  why: string
  /** What would break it. */
  avoid?: string
  /** Ids from `wardrobe`: the pieces shown as thumbnails under the outfit. */
  itemIds?: string[]
  /** A photo of the whole look on a person, with what to notice in it. */
  photo?: { url: string; sourceUrl: string; credit: string; watch: string }
}

export type Trend = {
  id: string
  title: string
  body: string
  /** How it fits this wardrobe, minimalist and urban. */
  howToWear: string
  source: { title: string; url: string }
}

export type Shop = {
  id: string
  name: string
  kind: 'magazin' | 'online'
  /** Street and number for a physical shop. */
  address?: string
  url: string
  what: string
}

export type FashionGuide = {
  /** YYYY-MM-DD of the last `/fashion-refresh` run. */
  generatedAt: string
  rules: Rule[]
  wardrobe: WardrobeItem[]
  outfits: Outfit[]
  trends: Trend[]
  shops: Shop[]
}

/** Saved by the owner in the browser (the wishlist modal). */
export type WishlistEntry = {
  id: string
  title: string
  note?: string
  url?: string
  /** Link to a picture, copied from a shop page. */
  image?: string
  addedAt: string
}
