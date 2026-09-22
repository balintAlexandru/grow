---
name: events-refresh
description: Caută evenimentele din București pentru secțiunea Evenimente din aplicația Grow (bouldering, șah, board games, teatru, muzică clasică, artă, dezvoltare personală, sport în grup) pe Google, Facebook, Instagram și site-urile de bilete, și le adaugă în app/src/content/events/events.json. Rulează /events-refresh pentru toate categoriile sau /events-refresh <id> pentru una singură.
argument-hint: "[id-categorie ...]"
---

# /events-refresh

Găsești evenimentele din luna curentă la care cititorul ar putea merge și le **adaugi** în `app/src/content/events/events.json`. Site-ul le arată pe cele din luna curentă și le ține minte în browser, grupate după id.

**Cititorul:** 29 de ani, din București, frontend developer care trece spre AI. Vrea ieșiri cu sens, unde cunoaște oameni noi: sport de cățărare și sport în grup, jocuri de minte, cultură și evenimente care îl ajută să crească. E începător la șah. E timid și lucrează la asta (vezi exercițiile sociale din Learning), așa că preferă evenimente **prietenoase cu începătorii și cu un format care te pune ușor în contact cu oamenii** (jocuri cu reguli explicate, alergări în grup, drumeții, Toastmasters). Când sursa spune asta, scrie-o în `description` („potrivit pentru începători”, „vii singur, te pune organizatorul într-o echipă”). Doar evenimente **fizice, în București** (nu online).

## 1. Pregătire

- Citește categoriile din `app/src/features/events/categories.ts`. Dacă ai primit argumente, lucrezi doar pe acele `id`-uri.
- Citește `app/src/content/events/events.json`. Evenimentele de acolo sunt **deja găsite**: nu le adăuga din nou (compară titlul, data și locația, nu doar id-ul).
- Data de azi stabilește luna curentă. Dacă suntem în ultimele 7 zile ale lunii, caută și în luna următoare, ca pagina să nu fie goală pe 1.

## 2. Ce cauți

| `id` | Ce intră | Unde cauți în primul rând |
|---|---|---|
| `bouldering` | Competiții, sesiuni deschise, workshop-uri de tehnică, seri pentru începători, route setting nou anunțat ca eveniment. | Sălile de cățărare din București (site, Facebook, Instagram), Federația Română de Alpinism și Escaladă. |
| `chess` | **Întâi ce e pentru începători:** seri de șah în pub-uri și cafenele unde se strânge lumea să joace, turnee pentru începători sau amatori (fără rating sau sub 1600), cursuri și lecții deschise pentru adulți, simultane. Apoi turnee open (rapid, blitz). | Pub-urile și cafenelele cu seri de șah, cluburile de șah pentru adulți, Meetup, grupurile de Facebook ale comunității de șah, chess-results.com (turnee din ROU, București), Federația Română de Șah. |
| `boardgames` | Seri de board games, turnee, lansări de jocuri, convenții. | Cafenelele cu board games din București, Meetup, Facebook, Instagram. |
| `theatre` | Premiere și spectacole cu dată fixă, festivaluri, stand-up doar dacă e spectacol de teatru. | Programele TNB, Bulandra, Odeon, Teatrul Mic, Nottara, Metropolis, Teatrul de Comedie, teatrele independente; iabilet.ro, eventbook.ro, bilete.ro. |
| `classical` | Concerte simfonice, de cameră, recitaluri, operă. | Filarmonica George Enescu (Ateneul Român), Orchestrele Radio (Sala Radio), Opera Națională București, iabilet.ro, eventbook.ro. |
| `art` | Vernisaje, expoziții (cu `endDate`), tururi ghidate, Noaptea Galeriilor, târguri de artă. | MNAR, MNAC, galeriile de artă contemporană, Instagram și Facebook-ul galeriilor, zilesinopti.ro. |
| `sport` | Sport în grup, deschis oricui și bun ca să cunoști oameni: alergare cu cluburi (run clubs), drumeții de o zi cu plecare din București, ture de bicicletă, meciuri amicale de fotbal, volei, baschet, padel sau tenis la care te înscrii singur, yoga în parc, dans social, înot sau triatlon de grup. Nu competiții pentru spectatori. | Run club-urile din București, Meetup, grupurile de Facebook și Instagram ale cluburilor, platforme de meciuri amicale, organizatorii de drumeții. |
| `growth` | Workshop-uri și conferințe de dezvoltare personală, public speaking (de exemplu Toastmasters), cluburi de carte, meetup-uri de carieră și tech/AI, meditație ghidată, conferințe TEDx. | Meetup, Eventbrite, Facebook, site-urile organizatorilor, zilesinopti.ro. |

**Facebook și Instagram:** API-urile lor nu permit căutarea publică de evenimente, iar paginile cer adesea logare. Le găsești prin `WebSearch` (de exemplu `site:facebook.com/events București bouldering septembrie 2026`) și folosești datele din rezultatul căutării doar dacă apar clar (titlu, dată, locație). Dacă nu apar clar, confirmă evenimentul pe site-ul organizatorului sau pe un site de bilete și pune acel URL.

## 3. Cercetează (economic, dar corect)

- 2–4 căutări `WebSearch` pe categorie, cu luna și anul în text („octombrie 2026”). `WebFetch` doar pe paginile de program (teatru, filarmonică, chess-results), unde găsești mai multe evenimente într-o singură pagină.
- Țintă: 3–10 evenimente pe categorie pe lună. Mai puține, dar sigure, sunt mai bune decât multe nesigure. O categorie poate rămâne fără evenimente noi.

**Reguli de acuratețe (obligatorii):**
- Adaugi un eveniment doar dacă **data, locația și titlul** apar într-o sursă găsită acum și evenimentul e în București. Fără date ghicite din „în fiecare marți”, decât dacă organizatorul anunță explicit data.
- `url` e pagina pe care ai confirmat evenimentul, copiată exact din rezultate. **Nu inventa și nu reconstrui URL-uri.** `source` e `facebook`, `instagram` sau `web`, după acel URL.
- `time` și `price` le scrii doar dacă apar în sursă. Nu le ghici.
- La o piesă cu mai multe reprezentații în lună: un eveniment pentru fiecare dată, sau cel mult primele 3 date, fiecare cu id propriu.
- **Evenimente săptămânale** (seară de șah în pub, run club): un singur eveniment cu `weekdays` (0 = duminică … 6 = sâmbătă), `date` = prima sesiune de azi încolo, `endDate` = ultima sesiune din lună. Adaugi doar dacă organizatorul arată programul săptămânal ca **activ acum** (postare, pagină sau calendar actualizat în ultima lună), nu dintr-o pagină veche.

## 4. Actualizează fișierul

- **Nu șterge și nu modifica id-ul** evenimentelor existente: browserul îmbină după id, iar un id schimbat ar dubla evenimentul.
- Dacă afli că un eveniment existent s-a mutat sau are alt preț, corectează câmpurile, dar păstrează `id`-ul. Dacă a fost anulat, pune `"cancelled": true`, nu îl șterge.
- Evenimentele noi le adaugi fără `id`; îl calculează scriptul.
- `description`: 1–2 propoziții în română, cu diacritice, maximum ~280 de caractere: ce e și de ce merită, fără superlative goale.
- **Dacă nu ai găsit nimic nou și nu ai corectat nimic, nu modifica fișierul deloc** (nici `generatedAt`). Așa site-ul știe că nu are ce descărca.
- Dacă ai modificat ceva, pune în `generatedAt` data de azi.

```json
{
  "city": "București",
  "generatedAt": "2026-09-22",
  "events": [
    {
      "title": "…",
      "categoryId": "classical",
      "date": "2026-09-25",
      "time": "19:00",
      "venue": "Ateneul Român",
      "address": "Str. Benjamin Franklin 1-3",
      "price": "40–120 lei",
      "description": "…",
      "url": "https://…",
      "source": "web"
    },
    { "title": "…", "categoryId": "art", "date": "2026-09-10", "endDate": "2026-10-20", "venue": "…", "description": "…", "url": "https://…", "source": "instagram" },
    { "title": "Seară de șah la …", "categoryId": "chess", "date": "2026-09-22", "endDate": "2026-09-29", "weekdays": [2], "time": "19:00", "venue": "…", "description": "…", "url": "https://…", "source": "facebook" }
  ]
}
```

## 5. Verifică și termină

1. Rulează `npm --prefix app run events:check -- --fix`. Completează id-urile, scoate evenimentele din lunile trecute și sortează după dată.
2. Corectează fiecare eroare și rulează din nou până nu mai apar. Un URL mort: caută altă sursă pentru eveniment sau scoate evenimentul, dacă e unul adăugat acum. Citește avertismentele de posibil duplicat și îmbină-le dacă e același eveniment.
3. Rulează `npm --prefix app run build`.
4. Raportează pe scurt: câte evenimente noi pe categorie și cele mai interesante 3–5.

Nu face commit și nu face push decât dacă ți se cere explicit (de exemplu, de rutina programată).
