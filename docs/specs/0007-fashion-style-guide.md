# 0007. Fashion as a style guide for a beginner

**Date**: 2026-09-23
**Status**: In Progress

## Summary

Fashion teaches the owner to dress, from zero. Five tabs on one page: **Bazele** (principles), **Garderoba de bază** (the pieces to own), **Ținute** (outfits per occasion), **Trenduri** (what is current, with sources) and **Magazine** (where to buy in București). A **wishlist** modal saves pieces, links and picture links in the browser. The **„Generează stil nou”** button runs `/fashion-refresh` the same way Learning and Evenimente do (spec 0006).

## Context

His answers: 29, 1.76 m, no fashion knowledge, urban minimalist taste (Carhartt WIP, adidas Originals, Dr. Martens, plain tees), **200–600 lei per piece**, relaxed office, wants to start from a **base wardrobe**.

## Requirements

- **AC-1**: Each tab renders from `app/src/content/fashion/style.json`, with no network call.
- **AC-2**: Outfits cover every occasion in `occasions.ts` (birou, oraș, restaurant, weekend, întâlnire) and can be filtered.
- **AC-3**: Every trend carries a real source; every physical shop an address; every piece a price range, brands and shops.
- **AC-4**: The wishlist adds from a wardrobe card or by hand (title, link, picture link, note), removes, and survives a reload.
- **AC-5**: `npm run fashion:check -- --fix` validates shape, unknown `shopIds`, occasions, and dead URLs; it fills ids.
- **AC-6**: The button starts `fashion-refresh.yml`, which commits only `app/src/content/fashion`.

## Decision (revised 2026-09-23, after the owner saw the first version)

The first version was text only and he could not picture anything from it. The section is now **photo first**: outfits open the page, each with a photo of the whole look on a person or, when there is none, a collage of its pieces; every piece card is a product photo. Text is one line per card.

- **Photos come from shops** that serve them to other sites: footshop.ro (Carhartt WIP, adidas, Dr. Martens, plus its `/outfit/` pages of looks on people) and aboutyou.ro (shirts, wool trousers, knitwear). Carhartt's and Massimo Dutti's own sites render with JavaScript and give no photo in the HTML.
- **They break, and that is handled**: `fashion:check` fails when a photo url stops being an image (sold out), and the page shows the piece's name instead of a broken icon.
- Showing them is acceptable here because the site is private, behind the password from spec 0006, and each photo links back to the product page.

## Earlier decisions

- Advice is aimed at 1.76 m and a small palette (3 neutrals + one earth accent), because that is what makes a beginner's outfits work; the skill keeps that frame.
- Prices are ranges, marked as orientative on the page: shop prices change faster than the content.
- No product images in the content: hotlinked shop pictures break. Pictures live in the wishlist, where the owner pastes the link.
- The wishlist is `localStorage`, like the Learning ticks, until feature 10 decides real persistence.

## Build plan

- [x] Types, occasions, page with 5 tabs, wishlist modal, check script, skill, workflow (tested in Chrome: wishlist survives a reload, filters work, no errors)
- [x] First content: 6 rules, 14 pieces, 6 outfits, 5 trends (autumn 2026), 9 shops, all links live
- [x] Rebuilt photo first: 16 photos (13 of 14 pieces, 3 looks on people), collage for outfits without a look photo, `/fashion-refresh` taught to fetch photos (og:image) and check them
- [ ] First run from the site's button
