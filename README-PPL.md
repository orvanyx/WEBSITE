# README — Adding Players to Pirate Premier League (PPL)

This explains exactly how to add a new player so they show up in the
**search page** (`ppl-search.html`) and have their own profile page.

Two files need updating per player:
1. A new profile page (`ppl-players/ppl-NAME.html`)
2. A new search card added to `ppl-search.html`

No coding knowledge needed — just copy, paste, and edit text.

---

## File structure (how it must look on your site)

```
your-site/
├── index.html
├── ppl.html
├── ppl-search.html
├── ppl-styles.css
└── ppl-players/
    ├── ppl-messi.html
    ├── ppl-neymar.html
    ├── ppl-haramball.html
    └── ppl-NAME.html        ← every new player goes here
```

**Important:** all individual player profile pages live inside the
`ppl-players/` folder. `ppl.html`, `ppl-search.html`, and
`ppl-styles.css` stay in the main folder. This is why profile pages
link to the stylesheet and home button using `../` (meaning "go up
one folder") — e.g. `href="../ppl-styles.css"`, `href="../index.html"`.
If you ever copy a profile page and the styling looks broken or the
home/back buttons go to a 404, the `../` is almost always the reason —
double check it's there.

---

## Step 1 — Create the player's profile page

1. Go into the `ppl-players/` folder.
2. Copy an existing profile page, e.g. `ppl-messi.html`.
3. Rename the copy to `ppl-NAME.html` (lowercase, no spaces — use a
   dash if needed, e.g. `ppl-haram-ball.html`).
4. Open the new file and edit these parts:

   | Find | Replace with |
   |---|---|
   | `<title>Messi — PPL Player Profile...` | the new player's name |
   | `<h1 class="profile-name">MESSI</h1>` | new player's name |
   | `Forward` (in the position badge) | their position |
   | All the numbers in `.stat-cell` (goals, assists, conceded, etc.) | their real stats |
   | The rows inside `.stats-table` | their season-by-season results |
   | The `.trophy-item` blocks | delete any trophy they haven't won, duplicate any they've won more than once |

5. Save the file inside `ppl-players/`.

That's it for the profile page — don't touch the `../` paths, leave
those exactly as they are.

---

## Step 2 — Add their card to the search page

1. Open `ppl-search.html`.
2. Find the block of code that looks like this (search for
   `ADD NEW PLAYERS HERE`):

```html
<!--
═══════════════════════════════════════════════════════════════
ADD NEW PLAYERS HERE — copy one block above and edit:
  • href="ppl-players/ppl-PLAYERNAME.html"
  • data-name="firstname lastname nickname"  ← all lowercase,
    space-separated aliases that search will match on
  • .compact-avatar emoji (or swap to <img src="...">)
  • .compact-name / .compact-role text
  • Goals & Assists numbers
  • Trophy emojis (remove any the player hasn't earned)
Full guide: README-PPL.md
═══════════════════════════════════════════════════════════════
-->
```

3. Right above that comment, copy one full player card (an entire
   `<a class="player-card-compact">...</a>` block — for example the
   Messi or Neymar one) and paste it again just above the comment.

4. Edit the pasted copy:

   | Part | What to change |
   |---|---|
   | `href="ppl-players/ppl-messi.html"` | point to the new file you made in Step 1, e.g. `ppl-players/ppl-haram-ball.html` |
   | `data-name="messi"` | **all lowercase**, space-separated nicknames the search should match — e.g. `data-name="haram ball haramball haram"` lets people find the player by typing "haram", "ball", or "haramball" |
   | `<div class="compact-name">MESSI</div>` | player's display name |
   | `<div class="compact-role">Forward · PPL Season 1</div>` | their position / season |
   | The two `.compact-stat-num` numbers | Goals and Assists |
   | The `.trophy-mini` emoji list | keep only the trophies they've won |
   | `.compact-avatar` | either keep an emoji (e.g. `⭐`) or use a photo: `<img src="PHOTO_URL_HERE" alt="Name">` |

5. **Double-check every tag is properly closed.** This is the #1 cause
   of the search page breaking. If you used a photo, make sure the
   `<img>` tag ends with `>` and is followed by `</div>`:

   ✅ Correct:
   ```html
   <div class="compact-avatar"><img src="https://example.com/photo.png" alt="Name"></div>
   ```

   ❌ Broken (missing `>` and `</div>` — this will silently break
   search for every player listed after it, because the browser gets
   confused about where the broken tag ends):
   ```html
   <div class="compact-avatar"><img src="https://example.com/photo.png" alt="Name"</div>
   ```

   If search ever stops finding a player who is clearly in the list,
   this is the first thing to check — open the file and look for an
   `<img>` tag that's missing its closing `>`.

6. Save the file.

---

## Step 3 — Add their card to the main PPL hub (optional)

If your `ppl.html` page also shows player cards directly (not just
via search), repeat the same copy/edit process there using one of the
existing player cards as the template.

---

## Quick checklist before you publish

- [ ] New file created inside `ppl-players/` folder
- [ ] File uses `../ppl-styles.css`, `../index.html`, `../ppl.html` (with the `../`)
- [ ] New card added to `ppl-search.html` just above the `ADD NEW PLAYERS HERE` comment
- [ ] `data-name` is all lowercase
- [ ] Every `<img>` tag has a closing `>` and a matching `</div>`
- [ ] Tested: typing the player's name in the search box on
      `ppl-search.html` shows their card

---

## Updating stats later

To change a player's stats after a match or season:

- **Profile page** (`ppl-players/ppl-NAME.html`): edit the numbers in
  the `.stat-cell` blocks and add a new row to the `.stats-table` for
  the new season.
- **Search card** (`ppl-search.html`): update the two
  `.compact-stat-num` numbers (Goals / Assists) to match.

Both files are plain text — no build step, no server restart. Just
edit, save, and re-upload/deploy to Netlify.
