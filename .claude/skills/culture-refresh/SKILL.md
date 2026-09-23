---
name: culture-refresh
description: Actualizează secțiunea Culture din aplicația Grow: filme, cărți, muzică, documentare și podcasturi de recomandat, povești adevărate bune de spus la o bere și locuri culturale din București. Scrie în app/src/content/culture/guide.json. Rulează /culture-refresh sau /culture-refresh recomandari|povesti|locuri.
argument-hint: "[recomandari | povesti | locuri]"
---

# /culture-refresh

Aduci lucruri noi în secțiunea Culture. **Adaugi, nu ștergi**: fișierul e o bibliotecă ce crește. Nu atinge niciodată `data/culture.json`: acolo sunt marcajele lui („vreau”, „făcut”), salvate din site.

**Cititorul:** bărbat de 29 de ani, din București, frontend developer care trece spre AI. Vrea două lucruri de la cultură: să vadă și să citească lucruri care merită timpul lui, și **să aibă ce spune** când e cu oameni. Nu vrea liste de capodopere obligatorii și nici recenzii lungi.

## 1. Ce actualizezi

| Argument | Ce faci |
|---|---|
| (fără) | 3 recomandări noi (tipuri diferite), 1 poveste nouă, și verifici locurile. |
| `recomandari` | 4 recomandări noi. |
| `povesti` | 2 povești noi. |
| `locuri` | Verifici adresele și programul locurilor; adaugi 1–2 locuri noi. |

Reguli:
- Maximum 40 de recomandări, 20 de povești, 15 locuri. Când depășești, scoate ce e mai slab, nu ce e mai vechi.
- Acoperă toate tipurile din `app/src/features/culture/kinds.ts`: film, carte, album, documentar, podcast.
- Nu repeta un titlu care există deja.
- Amestecă: lucruri românești și internaționale, recente și vechi, greu și ușor. Cel puțin o treime din recomandări să fie ceva ce poate consuma într-o seară.

## 2. Ce intră

- **Recomandări**: lucruri concrete, cu autor și an. `why` spune de ce merită timpul lui, `talkingPoint` e detaliul care face conversația (o poveste din spatele operei, un fapt surprinzător), `whereToFind` e realist pentru România (Netflix, HBO Max, YouTube, librării, Spotify, cinemateca).
- **Povești**: întâmplări adevărate și verificabile din artă, istorie, muzică, oraș. 120–220 de cuvinte. `tellIt` arată cum le spune în 30 de secunde, la o bere.
- **Locuri**: muzee, cinematografe de artă, librării, săli de concert, galerii din București. Adresa exactă, plus ce e util (program, zi cu intrare liberă, preț).

**Reguli de acuratețe (obligatorii):**
- Fiecare poveste are cel puțin o sursă solidă (muzeu, enciclopedie, presă serioasă), cu `url` copiat exact din rezultatele căutării. **Nu inventa URL-uri**: `culture:check` prinde paginile inexistente.
- Verifică anul, numele autorului și faptul-surpriză înainte să le scrii. O poveste bună spusă greșit e mai rea decât niciuna.
- Pentru locuri, confirmă adresa pe site-ul locului sau pe o pagină locală recentă. Nu inventa programul: dacă nu îl confirmi, lasă `practical` gol.
- Evenimentele cu dată (concerte, expoziții temporare) nu intră aici: sunt treaba lui `/events-refresh`.

## 3. Cum scrii

Română cu diacritice, adresare cu „tu”, propoziții scurte, fără limbaj de critic („o meditație asupra condiției umane”). Spune ce e, de ce contează și ce rămâne cu tine.

`id`-urile le completează scriptul, iar marcajele lui se leagă de ele: **nu schimba `id`-ul unei intrări existente**.

## 4. Verifică și termină

1. Rulează `npm --prefix app run culture:check -- --fix`.
2. Corectează fiecare eroare și rulează din nou. Un URL mort înseamnă că l-ai construit singur: caută pagina reală.
3. Rulează `npm --prefix app run build`.
4. Raportează pe scurt: ce ai adăugat și pe ce tipuri.

Nu face commit și nu face push decât dacă ți se cere explicit (de exemplu, de rutina programată).
