# Decisions

Why STAMP works the way it does. Newest at the bottom. The original brief was a
long prompt asking for a neo-brutalist, local-first habit PWA with mechanics
borrowed from Streaks, Loop, Done/HabitNow, Atomic Habits, Tiny Habits and
GitHub's contribution graph. Where the app departs from that brief, it says so
here.

## Product rules

- **Today is the whole app.** One tap stamps, a second tap undoes. Current
  streak, best streak and strength are on every card.
- **Soft cap at 7 active habits.** Past 7, HABITS shows an orange warning and the
  new-habit form says which number this would be. It never blocks.
- **No gamification.** No points, pets, feed or shame modal. The only
  celebrations are toasts at 7, 30 and 100.
- **DON'T MISS TWICE** looks at the previous *scheduled, unpaused* day, not
  literally yesterday, so a Mon/Wed/Fri habit missed on Monday still triggers it
  on Wednesday.

## Scoring

- **Strength** weights each of the last 42 days by 0.93^daysAgo. Skips, pauses
  and an open today are left out of the denominator. One miss in an otherwise
  perfect run gives 93, not 0.
- **Weekly habits** score by week, with partial credit (2 of 3 done counts 2/3)
  rather than all-or-nothing, so one short week reduces the score instead of
  wiping it.
- **A short past week is frozen, not broken,** if skips and paused days cover the
  shortfall. The brief only said "skip freezes"; this is how that translates to
  quotas.

## Data

- **`pauses: [[from, to]]` was added beside `pausedUntil`.** With only
  `pausedUntil`, a new pause overwrote the old one and the earlier paused days
  turned into misses after the fact. Imports that only carry `pausedUntil` are
  converted.
- **One validator.** `normalize()` cleans both what's loaded from storage and
  what's imported, so there's a single place that defines valid data.
- **Past days can be corrected** by tapping a heatmap cell. Forgetting to log
  yesterday shouldn't permanently break a streak. Not in the brief.
- **Delete exists, behind a confirm,** with Archive recommended above it.

## Quit habits (added after the first build)

The owner asked for a way to track quitting, with counts, for things like
smoking and drinking where several items belong together.

- **A third kind of habit, `avoid`, shown in the UI as QUIT.** A build habit's
  default is "missed unless stamped". A quit habit's default is "clean unless a
  slip is logged". Nothing to tap on a good day.
- **One habit, many items.** Smoking = Cigarettes, Cigars, Shisha. Each item has
  its own +1 / − counter. Any count above 0 makes the day a slip for the habit.
- **Items are just names, no units.** "3" means cigarettes, sessions or drinks
  depending on the item. Unit fields would add typing for little gain.
- **Quit since** is an editable date, so the clean count starts from when the
  owner actually stopped, not when the habit was entered.
- **Removing an item keeps its history.** Old counts still mark those days as
  slips and show as "Removed items" in the counts.
- **The counts table is stacked, not a grid.** A five-column table needed
  sideways scrolling at the owner's text size, so each item gets its own line
  with its four numbers wrapping underneath.
- **Quit habits sit in their own QUITTING section** on TODAY and are left out of
  the "stamped / due" progress, which only measures build habits.

## Interface

- **The OPEN button was removed** from HABITS rows: the name already opens the
  habit. Names gained a "›" and a pressed state, because the owner couldn't find
  the heatmap when the name didn't look tappable.
- **The whole card is not tappable,** on purpose. See CLAUDE.md.
- **Back returns to the same scroll position; fresh visits start at the top.**
  Each history entry gets an id in `history.state`, and its scroll position is
  remembered when you leave it. Tabs, the logo and links create new entries,
  so they open at the top. The owner asked for this after losing their place
  when going back from a habit's page.
- **The big date on TODAY is capped with `vw`,** because at 26px root text
  "OCTOBER" broke mid-word.

## Hosting

- **Netlify, deployed from the CLI.** Same approach as Speed Runner and the
  Schulte trainer: deploy and check the live URL. The local server is for
  reviewing before a commit or deploy, and its LAN address can't test install
  or offline.
- **Demo data lives in `.dev/`** because the Netlify CLI skips dot-folders
  (confirmed in its `getDeployFilesFilter`). Publishing it would put a page on
  the live origin that can overwrite real habits.
- **Deploys upload an allowlist of app files** from a staging folder, not the
  repo root. The first two deploys used `--dir=.`, which was fine until
  `CLAUDE.md` and `docs/` existed; after that it would have published the notes.

## Night mode

- **A moon/sun button in the header** flips light and night in one tap, as most
  apps do. It replaced a LIGHT / NIGHT / AUTO setting on REVIEW, which the owner
  didn't want; AUTO went with it. Light stays the default.
- **At night the yellow header goes dark** and the logo inverts to yellow, to cut
  glare. Accent colours stay; text on them stays dark.
- **Stamped cards get a dark tint of their colour at night** instead of a full
  bright fill, which glared in a dark room. The cream STAMPED button still shows
  the state.
- **Done cells in the heatmap are cream at night,** following "done = ink".

## Compact TODAY rows

- **Why:** with full cards, 50 habits on TODAY were about 29 phone screens long.
  Rows bring that to about 9. The owner compared both layouts side by side in
  `.dev/mockups.html` (TODAY and HABITS, before and after) before choosing.
- **The name gets its own line,** with streak and the button underneath. The
  first mockup put them on one line, which squeezed names to a letter per line
  at the owner's 26px text.
- **Tapping a row expands it** instead of opening the habit page, so the page
  is reached from the "Open habit page" link in the expanded card.
- **Kept, not deleted:** the full-card version is the git tag
  `today-full-cards`, chosen as the way to "remember the old setup". If the
  owner wants both layouts inside the app, a FULL / COMPACT setting on REVIEW
  is the next step.
- **The name with "›" opens the habit page** on TODAY rows too; the rest of the
  row expands. The owner preferred that to the "Open habit page" link that the
  first build put inside the expanded card, which is now gone.
- **The header date is capped to one line** (`min(.78rem, 3.4vw)`), because at
  26px text it stacked to three lines next to the new night switch.

## REVIEW vs SETTINGS

- **REVIEW is insights only:** habit strength and the quit-habit summaries.
- **SETTINGS holds controls:** day boundary, backup (export/import), install.
  It opens from a sliders button in the header, next to the night switch, and
  has no bottom tab: a fourth tab doesn't fit at the owner's text size, and
  settings aren't a daily screen.
- **The header logo is capped with `vw`** so the logo, date and both buttons
  fit on one line at 26px text.

