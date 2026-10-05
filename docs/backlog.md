# Backlog

Parked work, roughly in the order it was discussed. Nothing here is started.

## Encrypted cloud backup on Netlify — designed, parked (2026-10-05)

**Problem.** All data lives in one browser on one phone. Clearing Chrome's site
data, losing the phone or switching phones loses everything unless the owner
remembered to export. The habits now include smoking and drinking, so any copy
off the device must be unreadable to anyone but the owner.

**Agreed direction.** Backup and restore only, not live sync. Encrypt on the
device; Netlify stores only ciphertext.

- **Storage:** Netlify Blobs, written and read through one Netlify Function. Fits
  the free plan.
- **Key:** derived on the device from a passphrase the owner picks (WebCrypto,
  PBKDF2 or similar with a high iteration count, then AES-GCM). The passphrase
  and key never leave the phone.
- **Vault ID:** also derived from the passphrase, so there is no account, email
  or login.
- **UI:** a BACKUP TO CLOUD section on REVIEW: set passphrase, back up (after
  changes, or by button), restore on a new device by entering the same passphrase.
- **Costs the owner accepted in principle:**
  - A forgotten passphrase means the backup can't be recovered.
  - The app must require a long passphrase, since a weak one could be guessed by
    anyone who got the stored data.
  - STAMP stops being static files only. It gains one server function, still with
    no accounts or tracking.

**Before building, settle with the owner:**
1. Minimum passphrase strength.
2. Automatic backup after changes (and how often), or a button only.
3. What restore does on a device that already has data: replace or merge.

**Estimate:** one working session, roughly an hour or two from go-ahead to
deployed, plus the owner's phone check. About 200–300 new lines:

| Piece | Effort |
|---|---|
| Netlify Function: save and load one ciphertext per vault in Blobs | Small, ~50 lines |
| Client crypto: passphrase → key → encrypt/decrypt (WebCrypto) | Small to medium; must be exactly right |
| BACKUP TO CLOUD on REVIEW: passphrase, back up, restore, last-backup time | Medium, mostly states and errors |
| Deploy changes | Small, but new to this repo |
| Testing: restore on a fresh origin, wrong passphrase, offline, large text | Most of the time |

**What it changes beyond code:**
- **First dependency.** The function needs `@netlify/blobs`, so the repo gains a
  `package.json`. The staged deploy in CLAUDE.md must also upload the function
  (`--functions`), not just the app files.
- **Abuse protection.** The endpoint is public, so anyone could try to store
  junk. Cap the size and reject anything that isn't shaped like ciphertext.
- **Testing** happens locally with `netlify dev`, then on the live site. There
  is no staging environment.

## Clean up shipping files

- `stamp.zip` in `~/dev/web/` is redundant. The original brief asked for a zip
  for Netlify Drop; the app actually ships with `netlify deploy` from the repo.
  Delete the zip.
- Rewrite `INSTALL.md` for how the app really ships: the staged deploy command
  from CLAUDE.md, bump `CACHE`, Android install steps.
- If a zip is ever rebuilt, exclude `.dev/`, `.git/`, `.netlify/`.

## Smaller ideas mentioned, not agreed

- A reminder to export now and then, until cloud backup exists.
- A mini 2–3 week heatmap on each TODAY card that opens the full one. The "›"
  on the name was chosen instead; revisit only if finding the heatmap is still
  awkward.
- True two-way sync between phone and laptop. Much bigger than backup/restore.

## Brief drift

The owner is editing the original prompt to match what was built. Differences
to carry into it are listed in `docs/decisions.md`. The main ones: the `pauses`
array, quit habits (`kind`, `items`, counts `c`), heatmap day correction, and
the Netlify CLI deploy instead of zip + Netlify Drop.
