---
name: learning-daily
description: Scrie planul zilnic din secțiunea Learning a aplicației Grow, 3 lecții scurte, verificate, fiecare cu o misiune concretă: încredere în conversații (în fiecare zi), drumul spre AI engineer (în fiecare zi) și, pe rând, sport, nutriție, minte, bani sau noutăți din AI. Scrie în app/src/content/learning/days/<data>.json. Rulează /learning-daily pentru ziua de azi, /learning-daily tot pentru planul de azi plus câte o lecție nouă în fiecare arie (butonul de pe site), sau /learning-daily <arie> ca să rescrii doar lecția acelei arii.
argument-hint: "[tot | id-arie]"
---

# /learning-daily

Scrii planul de azi: 3 lecții de câte 3–4 minute, fiecare cu **o misiune mică și concretă**. În total, 10–15 minute pe zi.

**Cititorul** (profil din chestionarul lui, spec 0005): bărbat de 29 de ani, din București, frontend developer (React, TypeScript) care vrea să devină **AI engineer pe aplicații** (produse cu LLM: RAG, agenți, evals, UI). Vrea să crească și ca om: **formă fizică generală (forță și cardio)**, **nutriție explicată prin știință** (dovezi, nu mituri), **conversații cu necunoscuți**, obiceiuri, focus și emoții, bani și carieră. **Blocajul lui principal e timiditatea.** Revine zilnic pentru **o acțiune concretă**, nu pentru teorie.

## 1. Ce arii intră azi

| Slot | Aria (`areaId`) | Când |
|---|---|---|
| 1 | `social` | În fiecare zi. |
| 2 | `ai-engineer` | În fiecare zi. |
| 3 | după ziua săptămânii: luni `body`, marți `nutrition`, miercuri `mind`, joi `money`, vineri `body`, sâmbătă `ai-news`, duminică `mind` | O zi pe săptămână pentru fiecare arie, două pentru `body` și `mind`. |

Cu argument (`/learning-daily nutrition`): rescrii doar lecția acelei arii din ziua de azi și lași celelalte neschimbate.

Cu argumentul `tot` (butonul de pe site): scrii (sau rescrii) planul de azi, apoi adaugi **câte o lecție nouă pentru fiecare arie care nu e în planul de azi** (4 lecții) la finalul listei `lessons` din `app/src/content/learning/library.json`. Așa fiecare arie din Explorează primește ceva nou la fiecare apăsare. Lecțiile din bibliotecă urmează aceleași reguli (secțiunile 3–5), fără `step` și fără `eventTitle`; la `ai-news` alegi o noutate din ultimele 14 zile, alta decât cele deja scrise.

## 2. Pregătire

- Citește ariile din `app/src/features/learning/areas.ts` și treptele `socialSteps`.
- **Titluri deja folosite:** cele din toate fișierele `app/src/content/learning/days/*.json`, din `library.json` și din `history.json`. Nu le repeta și nu scrie despre aceeași idee sub alt titlu.
- **Treapta socială:** găsește ultima lecție `social` cu `step` (cea mai nouă zi). Rămâi pe aceeași treaptă 3 zile la rând, apoi urci una. Prima lecție pornește de la treapta 1. După treapta 6, alternează treptele 4–6 cu variații noi.
- **Evenimente:** citește `app/src/content/events/events.json`. Dacă în următoarele 7 zile e un eveniment potrivit (o alergare în grup, o seară de șah sau board games, Toastmasters), leagă de el misiunea `social` de la treapta 3 în sus sau misiunea `body` și pune în `eventTitle` titlul și ziua („Runners of Bucharest, miercuri 19:00”).
- Data de azi (YYYY-MM-DD) e numele fișierului. **Dacă `days/<azi>.json` există deja și nu ai argument, scrii un plan nou care îl înlocuiește** (așa funcționează butonul de pe site):
  1. Muți lecțiile vechi, neschimbate (cu tot cu `id`), la finalul listei `lessons` din `app/src/content/learning/library.json`. Așa rămân în Explorează și bifele lor rămân valabile.
  2. Scrii 3 lecții noi, pe aceleași arii (sloturile zilei), cu titluri noi. La `social` păstrezi **aceeași treaptă** ca lecția socială veche: înlocuirea nu urcă treapta.
  3. În fișierul zilei pui `"version"` = versiunea veche + 1 (lipsește = 1). Scriptul folosește versiunea în id-uri, ca să nu se ciocnească de lecțiile mutate.

## 3. Ce conține fiecare arie

| `areaId` | Ce scrii | Reguli specifice |
|---|---|---|
| `social` | O abilitate de conversație și misiunea de pe treapta curentă: cum începi, cum continui (întrebări de continuare, afirmații în loc de interogatoriu), cum ieși elegant, cum gestionezi tăcerea, ce faci cu emoția de dinainte. | Bazat pe psihologie cu dovezi: expunere graduală, renunțarea la comportamentele de siguranță, „liking gap”, efectul reflectorului, restructurare cognitivă (CBT). `step` = treapta. Misiunea are și o **variantă mai ușoară** („Dacă azi e prea mult: …”), ca să nu sari peste zi. Niciodată rușinare, manipulare sau „tehnici de pickup”. |
| `ai-engineer` | Ce îți trebuie ca să devii AI engineer pe aplicații: RAG, tool use și agenți, evals, streaming în UI, embeddings, costuri și tokeni, observabilitate; plus ce cer angajatorii, proiecte de portofoliu, întrebări de interviu. | Pleci de la ce știe un frontend developer. `code` opțional: TypeScript, maximum 15 linii, API-uri verificate în documentația oficială. Misiunea e un exercițiu de 10–20 de minute sau un pas concret spre job. |
| `body` | Forță și cardio pentru cineva care stă mult la birou: principii (supraîncărcare progresivă, volum, zona 2, recuperare, somn), tehnica unui exercițiu de bază, cum construiești o rutină. | Surse: ghidurile OMS și ACSM, meta-analize, antrenori cu pregătire științifică. Misiunea se face fără sală, sau o dată cu un eveniment sportiv din app. Fără promisiuni de transformare rapidă; siguranța vine înaintea intensității. |
| `nutrition` | Știința din spate: cum funcționează, ce arată studiile, **mit contra dovezi** (proteine, carbohidrați seara, mese dese, suplimente, zahăr, post intermitent). | Surse: meta-analize, reviste științifice, Examine.com, EFSA, Harvard T.H. Chan School of Public Health. Spui cât de solidă e dovada (studii mari față de un singur studiu). Fără diete extreme și fără sfaturi medicale; misiunea e o observație sau un experiment mic („citește eticheta la…”, „notează proteinele de azi”). |
| `mind` | Obiceiuri (cum se formează, cum le ții), focus și muncă profundă, reglarea emoțiilor, stres, anxietate socială din perspectivă cognitivă. | Cercetare psihologică (de exemplu BJ Fogg, Wendy Wood, CBT, mindfulness cu dovezi). Leagă-l de viața lui: învățatul după job, timiditatea, consecvența. |
| `money` | Negocierea salariului în tech, finanțe personale în România (fond de urgență, ETF-uri, Pilonul III, taxe pe salariu în IT), personal branding (LinkedIn, GitHub, cum îți prezinți proiectele AI). | Date actuale și surse românești oficiale acolo unde contează (ANAF, ASF, BNR). Nu recomanzi produse financiare anume; explici principii. |
| `ai-news` | Cea mai importantă noutate din AI din ultimele ~7 zile, explicată prin „ce înseamnă pentru un AI engineer pe aplicații”. | Doar ultimele 14 zile, cu data în text. Separă ce s-a anunțat de ce s-a demonstrat. |

Subiecte **înguste și concrete** („De ce întrebările de continuare te fac mai plăcut”), nu teme generale („Comunicarea”).

## 4. Cercetează (economic, dar corect)

- 1–2 căutări `WebSearch` pe lecție, cel mult un `WebFetch` când trebuie confirmată o cifră, o dată sau un API. Surse de încredere: studii și meta-analize, universități, instituții, documentație oficială, presă serioasă. Fără bloguri anonime, conținut SEO sau rezumate scrise cu AI.
- Video (opțional, maximum 1): `site:youtube.com <subiect>`, canale originale și cunoscute (AI: Anthropic, OpenAI, Google, IBM Technology, Andrej Karpathy, Fireship; restul: TED, TED-Ed, Kurzgesagt, Huberman Lab doar când e susținut de studii, Jeff Nippard pentru antrenament). Sub 20 de minute, pe exact aceeași idee; altfel lași `videos` gol.

**Reguli de acuratețe (obligatorii):**
- Fiecare afirmație factuală vine dintr-o sursă găsită acum. Dacă nu ești sigur, nu o scrie.
- URL-urile (surse și video) le copiezi exact din rezultate. **Nu inventa și nu reconstrui URL-uri.**
- Cifrele au context (cine a măsurat, când, pe cine). Nu transforma o corelație în cauză.

## 5. Scrie lecția

Română cu diacritice, adresare cu „tu”, termenii tehnici consacrați în engleză, explicați la prima apariție. **200–280 de cuvinte** (hook, secțiuni, exemplu; codul nu se numără): 3–4 minute de citit.

| Câmp | Ce conține |
|---|---|
| `areaId` | Aria din tabelul de mai sus. |
| `title` | Concret și curios, sub 70 de caractere. |
| `hook` | 1–2 propoziții: o întrebare sau un fapt surprinzător. |
| `coreIdea` | O singură propoziție: toată lecția pe scurt. |
| `sections` | 2 × `{heading, body, code?}`, rar 3. `heading` spune ideea, nu doar tema. |
| `example` | O scenă din viața lui: la job, la un interviu, la o seară de șah, la o alergare în grup. |
| `takeaways` | Exact 3 idei de ținut minte, fără să repete `coreIdea`. |
| `tryToday` | **Misiunea**: o acțiune făcută azi, măsurabilă („pune o întrebare de continuare la 2 colegi”), sub 20 de minute. La `social`, cu variantă mai ușoară. |
| `quiz` | `{question, answer}`: verifică înțelegerea, nu un detaliu. |
| `sources` | 1–3 × `{title, url}`. |
| `videos` | 0–1 × `{url}`. |
| `step` | Doar la `social`: treapta (1–6). |
| `eventTitle` | Opțional, când misiunea e la un eveniment din app. |

**Stil:** ca un antrenor bun care te cunoaște: cald, direct, concret, cu umor unde se potrivește, fără condescendență. Interzise: „În era digitală”, „Este important de menționat”, „În concluzie”, „fascinant”, „revoluționar”, „game changer”, „ieși din zona de confort” fără un pas concret, motivație goală.

**Verifică înainte să salvezi:** misiunea e mică, concretă și făcută azi? Faptele au sursă, iar URL-urile vin din căutare? Treapta socială e cea corectă? Cele 3 lecții sunt din arii diferite și nu repetă titluri vechi?

## 6. Salvează

Scrii `app/src/content/learning/days/<azi>.json`:

```json
{
  "date": "2026-09-23",
  "lessons": [
    { "areaId": "social", "step": 2, "title": "…", "hook": "…", "coreIdea": "…", "sections": [{ "heading": "…", "body": "…" }, { "heading": "…", "body": "…" }], "example": "…", "takeaways": ["…", "…", "…"], "tryToday": "…", "quiz": { "question": "…", "answer": "…" }, "videos": [], "sources": [{ "title": "…", "url": "https://…" }] },
    { "areaId": "ai-engineer", "…": "…" },
    { "areaId": "nutrition", "…": "…" }
  ]
}
```

`id` și `readingMinutes` le calculează scriptul (cu `version`, dacă există). Zilele mai vechi de 60 de zile sunt arhivate automat în `history.json`.

## 7. Verifică și termină

1. Rulează `npm --prefix app run content:check -- --fix`.
2. Corectează fiecare eroare sau avertisment de lungime și rulează din nou până nu mai apar erori. Citește liniile `ℹ` cu canalul fiecărui video: dacă e o copie reîncărcată, caută originalul sau scoate video-ul.
3. Rulează `npm --prefix app run build`.
4. Raportează pe scurt: cele 3 titluri, treapta socială și misiunile zilei.

Nu face commit și nu face push decât dacă ți se cere explicit (de exemplu, de rutina programată).
