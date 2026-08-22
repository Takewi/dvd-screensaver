# takewi // Vaporwave DVD Screensaver

An interactive 80s/90s retro vaporwave DVD screensaver featuring pinball physics, Web Audio synthesizer effects, and CRT/VHS aesthetics.

---

## ✨ Features

- **📼 Retro Vaporwave Aesthetic:** 3D perspective wireframe grid, retro sunset, starfield, and VHS scanline overlay.
- **📀 Bouncing DVD Logo:** Classic bouncing DVD logo that changes neon color palettes on each edge bounce and celebrates perfect corner hits.
- **🕹️ Pinball Physics & Interaction:**
  - **Drag & Fling:** Grab and throw the logo across the screen with real momentum.
  - **Mouse Kick:** Swipe the mouse across the logo to deflect it.
  - **Screen Click Pulse:** Click anywhere on the background to send a shockwave impulse.
- **🎵 Web Audio Synthesizer:** Real-time synthesized chimes on bounces and fanfare chords on corner hits.
- **🎛️ Floating HUD Controls:**
  - **Volume & Audio Toggle:** Adjust sound volume (`0% - 100%`) with neon slider or mute/unmute audio.
  - **Speed Presets:** Slow, Normal, Fast, and Turbo.
  - **Color Palette Switcher:** Cycle through 8 neon synthwave themes.
  - **VHS FX Toggle:** Enable or disable CRT distortion and scanlines.
  - **Fullscreen Mode:** One-click full-screen experience.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- `npm`

### Installation & Local Development

1. Clone or open the repository folder:
   ```bash
   cd homepage
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the local URL displayed in your terminal (typically `http://localhost:5173`).

---

## 📦 Build for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 🐳 Docker Deployment

Run the application using Docker and Docker Compose:

```bash
docker compose up -d --build
```

Access the app at `http://localhost`.

---

## 🛠️ Built With

- **HTML5 & Vanilla JavaScript (ES Modules)**
- **CSS3** (Custom properties, responsive layout, neon glow filters)
- **Web Audio API** (Procedural synth audio engine)
- **HTML5 Canvas** (3D perspective grid, sun, and particle systems)
- **[Vite](https://vitejs.dev/)** (Fast build tool and development server)
- **Nginx** (Production web server)

---

## 📄 License

MIT License.
