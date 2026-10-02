# Becoming Planner: put it on your iPad dock

Your planner is a small web app. GitHub Pages hosts it for free, then Safari turns it into an app icon.

## 1. Put the files on GitHub (one time, about 5 minutes)
1. Sign in at github.com (or create a free account).
2. Tap **+ → New repository**. Name it `planner`, choose **Public**, tick **Add a README file**, then **Create repository**.
3. Tap **Add file → Upload files**. Drag in **everything inside** the `becoming-app` folder:
   `index.html`, `manifest.webmanifest`, `sw.js`, and the `css`, `js`, `fonts` and `icons` folders.
   (Upload the contents, not the folder itself, so `index.html` sits at the top level.)
4. Tap **Commit changes**.
5. Open **Settings → Pages**. Under *Build and deployment*, set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
6. Wait 1–2 minutes. Your link appears at the top of that page, for example `https://YOUR-USERNAME.github.io/planner/`.

## 2. Add it to your iPad
1. Open your link in **Safari** on the iPad.
2. Tap **Share → Add to Home Screen**, keep the name **Becoming**, then tap **Add**.
3. Press and hold the new icon, then drag it down into your **dock**.

It now opens full screen like a normal app and works offline.

## Good to know
- Everything you write, tick, draw or upload is saved on that device automatically.
- Each new day opens a fresh page. Every past page stays saved: see **Past** in the tabs (with search).
- The iPad and MacBook keep separate copies. To move entries, use **More → Download backup** on one device and **More → Restore** on the other.
- Download a backup now and then, and keep it in Files or iCloud Drive.
- Don't delete the Home Screen app and its website data at the same time: that removes your saved pages unless you have a backup.
- On your MacBook you can open the same link in Safari and choose **File → Add to Dock**.

## Updating to a new version
1. Unzip the new file on your computer.
2. In your GitHub repository, tap **Add file → Upload files** and drag in the *contents* of the folder (`index.html`, `sw.js`, `manifest.webmanifest`, `README.md` and the `css`, `js`, `fonts`, `icons` folders). Let them replace the old files, then **Commit changes**.
3. Check the `js` folder on GitHub: it must contain `growth.js`.
4. Wait 2–3 minutes for GitHub Pages to update.
5. On the iPad, close the app completely (swipe it away), then open it again. The bottom of the home page should say **version 3**.

## Starting fresh
Go to **More → Start fresh** (or add `#/reset` to the end of your link) and tap the button twice. This erases every saved page on that device.
Removing the app icon from your Home Screen also erases its saved pages. Add it again from Safari for a clean start.
