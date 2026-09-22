/**
 * Placeholder content (Facade phase): every section renders from this mock data.
 * It will be replaced by real, persisted data once the data model is decided (`/architect data model`).
 */
export type MockItem = {
  id: string
  title: string
  meta: string
  note: string
  /** 0 to 100, shown as a progress bar when present. */
  progress?: number
}

export const mockItems: Record<string, MockItem[]> = {
  fashion: [
    { id: 'f1', title: 'Capsule wardrobe de toamnă', meta: 'Idee', note: '10 piese care se combină între ele.' },
    { id: 'f2', title: 'Paletă de culori personală', meta: 'Inspirație', note: 'Tonuri calde, neutre.' },
    { id: 'f3', title: 'Ținută pentru evenimente', meta: 'De cumpărat', note: 'Sacou bleumarin.' },
  ],
  psychology: [
    { id: 'p1', title: 'Jurnal de recunoștință', meta: 'Obicei zilnic', note: '3 lucruri în fiecare seară.', progress: 60 },
    { id: 'p2', title: 'Mindset de creștere', meta: 'Concept', note: 'Carol Dweck, idei principale.' },
    { id: 'p3', title: 'Meditație', meta: 'Obicei · 10 min', note: 'Dimineața, înainte de telefon.', progress: 20 },
  ],
  culture: [
    { id: 'c1', title: 'Muzeul Național de Artă', meta: 'Expoziție', note: 'Galeria de artă modernă.' },
    { id: 'c2', title: 'Filme clasice de văzut', meta: 'Listă · 8 filme', note: 'Începe cu Casablanca.', progress: 25 },
    { id: 'c3', title: 'Istoria Renașterii', meta: 'Podcast', note: 'Episoadele 1 la 5.' },
  ],
}
