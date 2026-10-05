# Install STAMP on Android

1. **Unzip** `stamp.zip`. You get a `stamp` folder with `index.html`, `manifest.webmanifest`, `sw.js` and the icons.
2. **Host it over HTTPS** (needed for install and offline):
   - **Netlify Drop:** go to <https://app.netlify.com/drop> and drag the `stamp` folder onto the page.
   - **Cloudflare Pages:** Workers & Pages → Create → Pages → *Upload assets*, then drag the `stamp` folder in and deploy.
3. **Open the HTTPS URL in Chrome on your Android phone.**
4. **Install:** tap **Install app** if Chrome offers it, or open the ⋮ menu → **Install app** / **Add to Home screen**.
5. Launch STAMP from the home screen. After the first load it works offline.

Your data stays in that browser on that phone. Use **Review → Export JSON** for backups; **Import** restores them, including onto a new phone.

To ship an update, upload the folder again and bump `CACHE` in `sw.js` (e.g. `stamp-v2`). The new version shows on the next launch after that.
