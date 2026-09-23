import type { LucideIcon } from 'lucide-react'
import { Brain, CalendarDays, GraduationCap, Landmark, Shirt } from 'lucide-react'

/**
 * The single source of truth for the sidebar menu and the section routes.
 * To add a new section: append one entry here and (optionally) mock items in `src/data/mockItems.ts`.
 */
export type Section = {
  id: string
  label: string
  path: string
  icon: LucideIcon
  /** Accent color used for the icon badge and highlights of this section. */
  accent: string
  tagline: string
  description: string
}

export const sections: Section[] = [
  {
    id: 'events',
    label: 'Evenimente',
    path: '/evenimente',
    icon: CalendarDays,
    accent: '#f97362',
    tagline: 'Ce se întâmplă luna asta',
    description: 'Bouldering, șah, board games, teatru, muzică clasică, artă și dezvoltare personală în orașul tău.',
  },
  {
    id: 'learning',
    label: 'Learning',
    path: '/learning',
    icon: GraduationCap,
    accent: '#6d5dfc',
    tagline: 'Ce înveți acum',
    description: 'Cursuri, cărți și abilități noi, cu progresul tău pe fiecare.',
  },
  {
    id: 'fashion',
    label: 'Fashion',
    path: '/fashion',
    icon: Shirt,
    accent: '#e85d9f',
    tagline: 'Cum te îmbraci bine',
    description: 'Regulile de bază, garderoba minimă, ținute pentru fiecare ocazie și de unde le cumperi.',
  },
  {
    id: 'psychology',
    label: 'Psychology',
    path: '/psychology',
    icon: Brain,
    accent: '#14b8a6',
    tagline: 'Mintea și obiceiurile tale',
    description: 'Concepte, reflecții și obiceiuri pentru o minte mai liniștită.',
  },
  {
    id: 'culture',
    label: 'Culture',
    path: '/culture',
    icon: Landmark,
    accent: '#f59e0b',
    tagline: 'Artă, istorie și idei',
    description: 'Filme, expoziții, muzică și locuri care îți lărgesc orizontul.',
  },
]
