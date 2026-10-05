# STAMP

A local-first habit tracker, built as an installable PWA for Android Chrome.
Two kinds of habit: **build** habits you stamp when done, and **quit** habits
where you count slips per item and unlogged days count as clean.

Plain HTML, CSS and JavaScript in one file. No framework, no build step, no
backend: every habit and log lives in the browser's `localStorage`, on the
device that made it. No accounts, analytics or sync.

## Commands

```bash
python3 -m http.server 8765 --bind 0.0.0.0     # serve the repo; phone reaches it on the LAN
# then open http://<laptop-ip>:8765/.dev/demo.html to load mock habits

# publish: stage only the app files, so CLAUDE.md, docs/ and .dev/ never go live
rm -rf /tmp/stamp-deploy && mkdir /tmp/stamp-deploy \
  && cp index.html sw.js manifest.webmanifest icon-*.png /tmp/stamp-deploy/ \
  && npx netlify-cli deploy --prod --dir=/tmp/stamp-deploy
```

**Never deploy with `--dir=.`**: it uploads every non-dot file in the repo,
including these notes. If the app gains a file (a new icon, a second page), add
it to the `cp` list above.

- Live at **https://stamp-habits.netlify.app** (Netlify project `stamp-habits`,
  linked through `.netlify/`, which is gitignored).
- Code at **https://github.com/ngiftsun23/stamp** (`origin`, SSH host alias
  `github-alt`). Repo-local git identity: `ngiftsun23 <ngiftsun@protonmail.com>`.
- **Bump `CACHE` in `sw.js` on every deploy that changes a file.** The service
  worker serves the cached shell first and refreshes in the background, so an
  installed app shows a new version on the launch *after* the one that fetched it.

## How the owner wants to work

- **Show the running app before committing or deploying.** Serve it locally, load
  `.dev/demo.html`, and say where each new feature shows up in the demo data.
  Commit and deploy only once they've said it looks fine.
- **Their phone uses enlarged system text.** Check layouts with
  `html{font-size:22px}` and `26px` injected, at 360px wide, not just at default
  size. Give important text its own line rather than squeezing it into a row.
- When a feature is added, add demo habits to `.dev/demo.html` that exercise it.
- Discuss architecture before building anything large; keep replies short.

## Layout

| File | What it holds |
|---|---|
| `index.html` | The whole app: CSS, views, logic, events. About 1,100 lines. |
| `sw.js` | Service worker: app shell cache, offline fallback, Google Fonts cache. |
| `manifest.webmanifest` | Install metadata. `start_url` and `id` are `./index.html`. |
| `icon-*.png` | 192, 512 and maskable 512. Rendered from HTML with Playwright. |
| `.dev/demo.html` | Seeds mock habits relative to today, then opens the app. Local only. |
| `INSTALL.md` | User install steps. Out of date (see `docs/backlog.md`). |
| `docs/decisions.md` | Why the rules work the way they do. |
| `docs/backlog.md` | Parked work, including the designed-but-unbuilt encrypted backup. |

Inside `index.html`, in order: date helpers → `normalize()` (the single
validator for stored and imported data) → habit logic (`dayStatus`, `weekInfo`,
`streak`, `bestStreak`, `strength`) → mutations → views (`viewToday`,
`viewHabits`, `viewDetail`, `viewEdit`, `viewReview`) → day sheet → routing →
event delegation. Screens re-render by assigning `innerHTML`; every click is
handled by one delegated listener that dispatches on `data-act`.

## Data model (`localStorage` key `stamp-habits-v1`)

```
habits: [{ id, kind: do|avoid, name, identity, cue, two,
           freq: daily|weekdays|weekly, days: [1-7], times,
           color, created: YYYY-MM-DD, archived, pausedUntil,
           pauses: [[from, to]], items: [{ id, name }], toasted }]
logs:   { [habitId]: { [YYYY-MM-DD]: { s: done|skip, n: note, c: { [itemId]: count } } } }
settings: { boundary: 0-6,    // before this hour, "today" is still yesterday
            theme: light|dark|auto }
```

- `pauses` keeps every pause; `pausedUntil` only mirrors the current one.
- For quit habits, `cue` holds "when the urge hits, instead I…", `two` is unused,
  `freq` is always `daily`, and `created` is the editable "quit since" date.
- `toasted` stores `date:streak` so a quit milestone toast fires once per day.

## Rules that are not obvious from the code

- **Day status drives everything.** `dayStatus()` returns one of
  `pre | off | extra | done | skip | pause | open | future | miss`. Streak,
  strength, the heatmap and the DON'T MISS TWICE banner all read from it. For
  quit habits it maps clean → `done` and slip → `miss`, so the build-habit maths
  works unchanged.
- **Skip and pause freeze a streak; an unmarked past scheduled day breaks it.**
  Today never breaks a streak while it is still open.
- **Weekly habits** succeed when the done count reaches `times`. A past week that
  falls short is frozen, not broken, if skips plus paused days cover the gap.
- **Quit habits are clean by default.** Any count above 0 makes the day a slip.
  Clean streaks grow when a day ends, not on a tap, so quit milestones are
  checked when TODAY renders (`quitMilestones`).
- **Escape every user string** with `esc()` before it goes into `innerHTML`,
  including inside attributes. Uppercase *before* escaping, never after.
- **IDs are validated** (`validId`) on load and import; `__proto__` and friends
  are rejected, since habit IDs become object keys.
- **The habit name is the way into a habit's page.** It is a full-width button
  with a "›" after it. The whole card is deliberately *not* tappable, because
  stray taps near STAMP or +1 would navigate away.

- **Night mode is a second set of CSS tokens** on `:root[data-theme="dark"]`.
  Use the tokens, never raw colours: `--ink`/`--card`/`--page` flip, `--on` is
  dark text on accent blocks in both themes, `--hi-bg`/`--hi-fg` mark the active
  tab and selected chips. A small script in `<head>` applies the saved theme
  before first paint so NIGHT doesn't flash light.

## Gotchas

- **Renaming the Netlify site changes the origin** and strands every installed
  copy's data, since `localStorage` is per origin. Keep `stamp-habits`.
- **A new Netlify site returns 401** until SSO login is cleared:
  `npx netlify-cli api updateSite --data '{"site_id":"<id>","body":{"sso_login":false}}'`.
  Already done for `stamp-habits`.
- **LAN HTTP can't test install or offline.** Chrome only allows service workers
  and install on HTTPS or `localhost`. Use `localhost:8765` on the laptop, or the
  live site, for those.
- **Demo data is per origin.** Loading it at the LAN address never touches the
  live app's data, and vice versa.
- **The dialog's `close` event is async.** Tests that save the day sheet must
  wait a tick before reading the re-rendered page.
- **Google Fonts are cached on the second online visit**, because the service
  worker doesn't control the very first page load. Until then, offline falls back
  to Arial Black and the system monospace.

## Testing

There is no test suite in the repo. Checks so far used Playwright from
`~/dev/web/flight-deals/node_modules/playwright` against the local server:
load `.dev/demo.html`, drive the screens, read the console for errors, measure
overflow at 22px and 26px root text, toggle offline and reload, and use the CDP
call `Page.getInstallabilityErrors` on the live site.
