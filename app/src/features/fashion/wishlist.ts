import { useCallback, useState } from 'react'
import type { WishlistEntry } from './types'

/** The wishlist lives in this browser only, until feature 10 decides real persistence. */
const KEY = 'grow.fashion.wishlist'

function read(): WishlistEntry[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function useWishlist() {
  const [entries, setEntries] = useState<WishlistEntry[]>(read)

  const save = useCallback((next: WishlistEntry[]) => {
    setEntries(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      // Out of storage (usually a huge pasted image): it stays until the page is closed.
    }
  }, [])

  const add = useCallback(
    (entry: Omit<WishlistEntry, 'id' | 'addedAt'>) => {
      const current = read()
      save([{ ...entry, id: crypto.randomUUID(), addedAt: new Date().toISOString() }, ...current])
    },
    [save],
  )

  const remove = useCallback(
    (id: string) => {
      save(read().filter((e) => e.id !== id))
    },
    [save],
  )

  /** Same piece saved twice does nothing useful, so the card can show it is already in. */
  const has = useCallback((title: string) => entries.some((e) => e.title === title), [entries])

  return { entries, add, remove, has }
}
