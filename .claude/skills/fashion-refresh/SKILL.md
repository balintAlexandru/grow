---
name: fashion-refresh
description: Actualizează secțiunea Fashion din aplicația Grow pentru un bărbat de 29 de ani, 1,76 m, cu stil urban minimalist: trenduri de sezon verificate, ținute noi pentru birou, ieșit, restaurant, weekend și întâlniri, piese de garderobă și magazine din București. Scrie în app/src/content/fashion/style.json. Rulează /fashion-refresh sau /fashion-refresh trenduri|tinute|garderoba|magazine.
argument-hint: "[trenduri | tinute | garderoba | magazine]"
---

# /fashion-refresh

Ții la zi ghidul de stil din secțiunea Fashion. **Adaugi și înlocuiești, nu ștergi tot**: fișierul e o bibliotecă ce crește.

**Purtătorul:** bărbat de 29 de ani, 1,76 m, din București, frontend developer. Pornește de la zero în modă. Stil **urban minimalist**: Carhartt WIP, adidas Originals, Dr. Martens, tricouri simple fără print. Birou casual (IT, fără cod vestimentar). Buget obișnuit: **200–600 lei pe piesă**. Vrea explicații scurte, concrete, cu „de ce”, nu jargon de modă.

## 1. Ce actualizezi

| Argument | Ce faci |
|---|---|
| (fără argument) | Rulare completă: 2–3 `trends` noi de sezon, 2 `outfits` noi, 1–2 `wardrobe` noi, verifici magazinele. |
| `trenduri` | Doar `trends`. |
| `tinute` | Doar `outfits`. |
| `garderoba` | Doar `wardrobe`. |
| `magazine` | Doar `shops`: verifici că există și corectezi adresele. |

Reguli de actualizare:
- `rules` (bazele) se schimbă rar: le atingi doar dacă una e greșită sau lipsește un principiu important (croială, paletă, proporții, texturi, încălțăminte, straturi).
- `trends`: păstrează maximum 8. Scoate-le pe cele care nu mai sunt de sezon și adaugă altele **din ultimele ~3 luni**, cu sursă.
- `outfits`: cel puțin o ținută pentru fiecare ocazie din `app/src/features/fashion/occasions.ts`. Ținutele noi folosesc piese care există în `wardrobe` sau se cumpără ușor în București.
- `wardrobe`: piese care se combină cu ce e deja acolo. Fără piese de o singură ocazie.
- Nu repeta un titlu care există deja în fișier.

## 2. Poze (partea cea mai importantă)

Secțiunea e vizuală: proprietarul vrea **să vadă** combinația, nu s-o citească. Fiecare piesă nouă primește o poză, iar ținutele primesc, când găsești, o poză cu ținuta pe om.

Cum obții o poză care chiar merge:
1. Caută produsul cu `WebSearch`, de exemplu `site:footshop.ro carhartt detroit jacket` sau `site:aboutyou.ro camasa oxford barbati`.
2. Ia adresa paginii de produs din rezultate și citește poza din ea:
   `curl -sL -A "Mozilla/5.0" "<pagina>" | grep -oE '<meta[^>]+og:image[^>]+>' | head -1`
3. Pune în `image.url` adresa din `content`, iar în `image.productUrl` pagina produsului. La ținute, `photo.url` + `photo.sourceUrl`, `photo.credit` (magazinul și autorul pozei) și `photo.watch` (ce să observe în poză: culori, unde se termină geaca, cum cade pantalonul).
4. Magazine care merg: **footshop.ro** (Carhartt WIP, adidas, Dr. Martens; are și pagini `/outfit/` cu ținute pe om) și **aboutyou.ro** (cămăși, pantaloni de stofă, tricotaje). Site-urile Carhartt și Massimo Dutti nu dau poza în HTML.

**Reguli pentru poze:**
- Poza trebuie să arate exact piesa descrisă. Dacă poza e altceva (o bluză în loc de cămașă), nu o pune: `fashion:check` verifică doar că e o poză, nu ce conține.
- Nu alege poze cu croieli foarte largi fără să spui asta în `photo.watch`; la 1,76 m recomandarea e croiala dreaptă.
- O poză care nu mai e poză (produs epuizat) e o eroare la verificare: caută alt produs.

## 3. Cercetează (economic, dar corect)

- 1–2 căutări `WebSearch` pe subiect. Pentru trenduri: reviste de modă masculină serioase (OPUMO, Esquire, GQ, Highsnobiety, Mr Porter Journal, Harrods Stories), nu bloguri SEO și nu liste generate cu AI.
- Pentru magazine din București: site-ul magazinului, pagina lui de contact sau un ghid local recent. **Verifică adresa** și că magazinul chiar vinde marca despre care scrii.
- Prețurile sunt orientative, în lei, ca interval („250–450 lei”), potrivite cu bugetul lui.

**Reguli de acuratețe (obligatorii):**
- Fiecare trend are o sursă reală, găsită acum, cu `url` copiat exact din rezultate. **Nu inventa și nu reconstrui URL-uri**, nici măcar pe categorii de magazin (link-urile spre pagini care nu există sunt prinse de `fashion:check`).
- Nu inventa magazine, adrese sau colecții. Dacă nu confirmi un magazin fizic, pune-l ca `online` sau scoate-l.
- Sfaturile sunt pentru 1,76 m și pentru un stil minimalist: fără „poartă ce te face fericit”, fără reguli inventate.

## 4. Cum scrii

Română cu diacritice, adresare cu „tu”, propoziții scurte. Fiecare text spune **ce faci concret**, nu teorie. Termenii de modă în engleză (chore jacket, oversize, layering) se explică la prima apariție.

| Câmp | Ce conține |
|---|---|
| `rules[]` | `title` (principiul), `body` (60–110 cuvinte, cu repere măsurabile), `tip` (un gest de făcut azi). |
| `wardrobe[]` | `image` (vezi secțiunea 2), `name`, `layer` (bază, strat 2, strat 3, pantaloni, încălțăminte, accesorii), `why` (de ce merită), `lookFor` (ce verifici când cumperi: croială, material, detalii), `price` („250–450 lei”), `brands[]`, `shopIds[]` (din `shops`), `url` opțional (o pagină care există). |
| `outfits[]` | `itemIds[]` (piesele din `wardrobe`, în ordine: sus, strat, pantalon, încălțăminte), `photo` opțional, `occasion` (din `occasions.ts`), `name`, `pieces[]` (de sus în jos, 3–6), `why` (de ce funcționează), `avoid` (ce ar strica-o). |
| `trends[]` | `title`, `body` (ce e și de ce se poartă acum), `howToWear` (cum intră în stilul lui, cu o piesă pe care o are), `source` `{title, url}`. |
| `shops[]` | `name`, `kind` (`magazin` sau `online`), `address` (obligatoriu la magazin fizic), `url`, `what` (ce găsește acolo). |

`id`-urile le completează scriptul.

## 5. Verifică și termină

1. Rulează `npm --prefix app run fashion:check -- --fix`.
2. Corectează fiecare eroare și rulează din nou. Un URL mort înseamnă că l-ai construit singur: caută pagina reală sau scoate câmpul.
3. Rulează `npm --prefix app run build`.
4. Raportează pe scurt: ce ai adăugat și ce ai scos.

Nu face commit și nu face push decât dacă ți se cere explicit (de exemplu, de rutina programată).
