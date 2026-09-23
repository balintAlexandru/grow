---
name: psychology-refresh
description: Actualizează articolele și exercițiile din secțiunea Psychology a aplicației Grow, pentru un bărbat de 29 de ani: emoții și stres, anxietate și timiditate, stimă de sine, relații, obiceiuri, sens, somn. Scrie în app/src/content/psychology/guide.json. Rulează /psychology-refresh sau /psychology-refresh <temă>.
argument-hint: "[id-temă]"
---

# /psychology-refresh

Aduci lucruri noi și verificate în secțiunea Psychology. **Adaugi, nu ștergi**: fișierul e o bibliotecă ce crește. Jurnalul nu e treaba ta: el se salvează separat, prin `/api/journal`, și nu se atinge niciodată.

**Cititorul** (profil, spec 0005): bărbat de 29 de ani, din București, frontend developer care trece spre AI. Blocajul lui principal e **timiditatea**. Vrea lucruri practice, explicate prin dovezi, fără vocabular de terapeut și fără motivație goală.

## 1. Ce actualizezi

- Fără argument: **2 articole noi** și **1 exercițiu nou**, pe temele cele mai slab acoperite din `app/src/features/psychology/topics.ts`.
- Cu argument (`/psychology-refresh somn`): 2 articole pe tema aceea.
- Păstrează maximum 24 de articole și 12 exerciții. Când depășești, scoate-le pe cele mai vechi de pe aceeași temă, nu pe cele mai bune.
- Nu repeta un titlu care există deja în fișier.

## 2. Ce intră și ce nu

| Intră | Nu intră |
|---|---|
| Tehnici cu dovezi: CBT, activare comportamentală, expunere graduală, autocompasiune, reglare emoțională, igiena somnului, ACT (valori). | Diagnostice, sfaturi medicale, medicație, „cum să-ți dai seama dacă ai X”. |
| Studii, meta-analize, ghiduri clinice (NICE, NHS), clinici universitare, cercetători recunoscuți. | Bloguri anonime, conținut motivațional, psihologie pop fără sursă, „toxic masculinity” ca slogan. |
| Nuanță: cât de solidă e dovada, pe cine s-a măsurat, ce nu spune studiul. | Promisiuni („scapi de anxietate în 7 zile”). |

**Siguranță:** la teme grele (depresie, atacuri de panică, gânduri de suicid) spui clar când e cazul să meargă la un specialist și nu înlocuiești terapia. Fără dramatizare și fără alarmism.

## 3. Cercetează (economic, dar corect)

- 1–2 căutări `WebSearch` pe articol; `WebFetch` doar ca să confirmi o cifră sau un detaliu de metodă.
- Fiecare afirmație factuală are o sursă găsită acum, cu `url` copiat exact. **Nu inventa URL-uri**: `psychology:check` verifică dacă pagina există.
- Cifrele au context: câți participanți, cât a durat, ce s-a măsurat.

## 4. Cum scrii

Română cu diacritice, adresare cu „tu”, propoziții scurte, fără jargon. **200–300 de cuvinte** pe articol.

| Câmp | Ce conține |
|---|---|
| `articles[].topicId` | Tema din `topics.ts`. |
| `articles[].title` | Concret, sub 70 de caractere, fără clickbait. |
| `articles[].hook` | 1–2 propoziții care deschid subiectul. |
| `articles[].coreIdea` | O propoziție: tot articolul pe scurt. |
| `articles[].sections` | 3 × `{heading, body}`: ce arată dovezile, ce înseamnă pentru el, și o secțiune de nuanță („ce nu spune studiul”, „când nu funcționează”). |
| `articles[].takeaways` | Exact 3 idei. |
| `articles[].tryToday` | O acțiune mică de azi, de preferat legată de jurnal sau de un exercițiu din secțiune. |
| `articles[].sources` | 1–3 × `{title, url}`. |
| `exercises[]` | `name`, `forWhat` (pentru ce stare), `why` (mecanismul, cu dovada), `steps[]` (`text`, plus `seconds` între 5 și 900 la pașii cronometrați), `minutes` (1–30), `source`. |

`id` și `readingMinutes` le calculează scriptul.

## 5. Verifică și termină

1. Rulează `npm --prefix app run psychology:check -- --fix`.
2. Corectează fiecare eroare și avertisment de lungime, apoi rulează din nou. Un URL mort înseamnă că l-ai construit singur: caută pagina reală.
3. Rulează `npm --prefix app run build`.
4. Raportează pe scurt: ce ai adăugat, pe ce teme, și ce ai scos.

Nu face commit și nu face push decât dacă ți se cere explicit (de exemplu, de rutina programată).
