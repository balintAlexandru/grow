/** What a 29 year old man building this app actually needs; kept in sync with the skill and the check script. */
export const psychologyTopics = [
  { id: 'emotii', label: 'Emoții și stres', emoji: '🌊' },
  { id: 'anxietate', label: 'Anxietate și timiditate', emoji: '😰' },
  { id: 'stima', label: 'Stimă de sine', emoji: '🪞' },
  { id: 'relatii', label: 'Relații și comunicare', emoji: '🤝' },
  { id: 'obiceiuri', label: 'Obiceiuri și voință', emoji: '🔁' },
  { id: 'sens', label: 'Sens și direcție', emoji: '🧭' },
  { id: 'somn', label: 'Somn și energie', emoji: '🌙' },
]

export const findTopic = (id: string) => psychologyTopics.find((t) => t.id === id)
