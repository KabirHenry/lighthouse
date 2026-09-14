<p align="center">
  <a href="https://lighthouse.heyrema.com/">
    <img src="docs/banner.svg" alt="Lighthouse — Keep your stuff organized!" width="100%" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/KabirHenry/lighthouse/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/KabirHenry/lighthouse/deploy.yml?style=flat-square&label=deploy&logo=githubactions&logoColor=white" alt="Deploy status" /></a>
  <a href="https://github.com/KabirHenry/lighthouse/tags"><img src="https://img.shields.io/github/v/tag/KabirHenry/lighthouse?sort=semver&style=flat-square&label=version&color=fac505" alt="Latest version" /></a>
  <a href="https://lighthouse.heyrema.com/"><img src="https://img.shields.io/website?url=https%3A%2F%2Flighthouse.heyrema.com&style=flat-square&label=app&up_message=online&down_message=offline" alt="App status" /></a>
  <img src="https://img.shields.io/badge/PWA-works%20offline-5A0FC8?style=flat-square&logo=pwa&logoColor=white" alt="Installable PWA that works offline" />
  <a href="LICENCE"><img src="https://img.shields.io/github/license/KabirHenry/lighthouse?style=flat-square&color=blue" alt="MIT licence" /></a>
</p>

<p align="center">
  Lighthouse helps you keep your home items organized.<br />
  Whether it's on the top shelf or at the back of the closet, Lighthouse helps you find it.
</p>

<p align="center">
  <a href="https://lighthouse.heyrema.com/">
    <img src="docs/open-app-button.svg" alt="Open Lighthouse" width="420" />
  </a>
</p>

<p align="center">
  <sub>Free, no sign-up. Runs in your browser, and you can add it to your home screen.</sub>
</p>

<br />

<table align="center">
  <tr>
    <td align="center"><img src="docs/screenshots/home.png" alt="Home screen" width="240" /><br /><sub><b>Home</b></sub></td>
    <td align="center"><img src="docs/screenshots/items.png" alt="Items list showing where each item is kept" width="240" /><br /><sub><b>Every item, and where it is</b></sub></td>
    <td align="center"><img src="docs/screenshots/rooms.png" alt="Rooms list with location and item counts" width="240" /><br /><sub><b>Rooms at a glance</b></sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/filter.png" alt="Search and filter dialog" width="240" /><br /><sub><b>Search &amp; filter</b></sub></td>
    <td align="center"><img src="docs/screenshots/add-item.png" alt="Add item dialog with room and location pickers" width="240" /><br /><sub><b>Add in seconds</b></sub></td>
    <td align="center"><img src="docs/screenshots/backup.png" alt="Backup and restore screen" width="240" /><br /><sub><b>Backup &amp; restore</b></sub></td>
  </tr>
</table>

## ✨ Features

<table>
  <tr>
    <td width="50%" valign="top">
      <b>🗂️ Rooms, locations and items</b><br />
      Organize things the way your home is laid out: every item sits in a location (a drawer, a shelf, a box) inside a room. Each room shows how many locations and items it holds.
    </td>
    <td width="50%" valign="top">
      <b>🔍 Find anything fast</b><br />
      One list of everything you own, across every room, with where to find it. Search by name, or narrow the list down to certain rooms and locations.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <b>📷 Photos</b><br />
      Give any item, room or location a picture. Take one with your camera, pick one from your library, or drag and drop on desktop.
    </td>
    <td width="50%" valign="top">
      <b>🏘️ Multiple homes</b><br />
      Keep track of several places at once (a house, an apartment, a desk at work) and switch between them in a tap.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <b>⚡ Add in seconds</b><br />
      Add an item and create its room and location right there, if they don't exist yet.
    </td>
    <td width="50%" valign="top">
      <b>💾 Backup &amp; restore</b><br />
      Save everything, photos included, to a single <code>.lighthouse</code> file and bring it back on any device. Backups from older versions are upgraded automatically.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <b>🔒 Private by design</b><br />
      No accounts and no servers. Everything you add stays on your device.
    </td>
    <td width="50%" valign="top">
      <b>📱 Install it, use it offline</b><br />
      Add Lighthouse to your home screen and it works without a connection. It lets you know when an update is ready.
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <b>🧭 Guided tour</b><br />
      An interactive walkthrough on sample data, so you can learn the ropes without touching your own things.
    </td>
    <td width="50%" valign="top">
      <b>⏰ Reminders</b><br />
      <i>Coming soon.</i>
    </td>
  </tr>
</table>

## 🛠️ Built with

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 6" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Bootstrap-5-7952B3?style=flat-square&logo=bootstrap&logoColor=white" alt="Bootstrap 5" />
</p>

Data is stored locally in IndexedDB (via [`idb`](https://github.com/jakearchibald/idb)), offline support comes from [`vite-plugin-pwa`](https://github.com/vite-pwa/vite-plugin-pwa), and the tour is built on [`react-joyride`](https://github.com/gilbarbara/react-joyride).

## 🚀 Run it locally

You'll need Node.js 22 (the version the deploy workflow uses).

```sh
git clone https://github.com/KabirHenry/lighthouse.git
cd lighthouse
npm install
npm run dev
```

| Command           | What it does                         |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server                 |
| `npm run build`   | Type-check and build for production  |
| `npm run preview` | Serve the production build locally   |
| `npm run lint`    | Lint the code                        |

Pushing a tag (for example, `npm version patch && git push --follow-tags`) builds the app and publishes it to GitHub Pages.

## 📄 Licence

Released under the [MIT Licence](LICENCE).

<br />

<p align="center">
  Made with ❤️ by <a href="https://www.linkedin.com/in/kabirhenry/">Kabir</a> and <a href="https://www.paramsid.com/">Param</a>.
</p>
