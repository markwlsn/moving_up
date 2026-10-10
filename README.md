# Ani sa Nayon (working title)

A cozy 2D farming-life game set in Barangay Maliwanag, a fictional Philippine barrio.
Built with HTML5 Canvas and plain JavaScript (ES modules). There are no frameworks and no build step.

## How to Clone and Run

### 1. Clone the repository
```bash
git clone https://github.com/markwlsn/moving_up.git
cd moving_up
```

### 2. Start the local server
The game loads data files via `fetch`, so it **must be run through a local web server** (double-clicking `index.html` will not work due to browser CORS security):
```bash
python -m http.server 8000
```
*(On macOS or Linux you may need `python3` instead of `python`.)*

### 3. Open in Browser
Open your browser to:
👉 **http://localhost:8000**

To stop the server, press `Ctrl+C` in the terminal. Any other static server works as well (e.g., `npx serve` or VS Code "Live Server").

## Controls

| Action | Keys |
|---|---|
| Move | Arrow keys or WASD |
| Use tool / Interact / Harvest / Talk / Pet | Space or J |
| Open / Close Inventory Bag | I or Tab |
| Open / Close Phone (Texting & Dates) | P |
| Open / Close Controls & Guide | F1 or H |
| Interact with Kaing (Shipping) | Space or J (facing basket) |
| Interact with Bed (Sleep) | Space or J (in farmhouse) |
| Interact with Shop Counter | Space or J (in Tindahan ni Aling Nena) |
| Interact with Bayanihan Board | Space or J (in village plaza) |
| Cycle tools / Toggle Shop tabs | Q / E |
| Cycle seed packet | R (when Seed Bag is selected) |
| Quick Phone Date Invites | 1 (Plaza) / 2 (Kapehan) |
| Cancel / Close modal | Esc or K |
| Quick Save / Quick Load | F5 / F9 |
| Toggle debug overlay | F3 or backtick (`) |
| *Debug only:* skip 1 hour / drain energy / grow crops | `]` / `-` / `=` (while overlay is visible) |

## Features in the MVP Release
- 🌾 **Cozy Philippine Agriculture:** 8 native crops (Palay, Kamote, Talong, Sitaw, Kalabasa, Mais, Ampalaya, Okra) across 2 seasons (Tag-init & Tag-ulan, 112-day year). Unwatered crops pause growth gently.
- 🌅 **Atmospheric Day/Night Cycle:** Dynamic lighting shifts across misty indigo dawn (4:00 AM), sunny noon, golden hour dusk (5:00 PM), and deep moonlit night (7:00 PM - 2:00 AM).
- 🏘️ **30 Living Barrio Residents:** 10 romance candidates, 8 core pillars, and 12 light villagers with authentic Filipino routines, schedules, and gifting tastes.
- 📖 **Salita Glossary:** Dialogue naturally blends English and Tagalog vocabulary (*po, opo, salamat, kain tayo, meryenda, bayanihan*) with built-in context.
- 📱 **Modern Ligawan Dating ("Ano tayo?"):** Smartphone texting (`P`), banter, vibe matching, date invitations, talking stage, official dating (*mag-jowa*), marriage, and children!
- 🏛️ **Bayanihan Village Board:** Rebuild Barangay Maliwanag through community projects (Kapilya repair, Bamboo bridge, Basketball court, Farmhouse expansion).
- 🐕 **Adoptable Pet:** Pet a rescue dog (*Aso*) or cat (*Pusa*) with following AI and daily heart affection.
- 🎆 **4 Seasonal Fiestas:** Day 20 festivals with music, plaza decorations, and community gatherings.
- 💾 **Full Persistence:** Automatic overnight saving, manual quick-save (`F5`), quick-load (`F9`), and a Sunset Title Screen with Lolo's Letter prologue.

## Project layout
```
index.html         Entry page
src/               Game code (ES modules)
  main.js          Boot: loads data and wires everything together
  title.js         Sunset title screen, prologue story, dating preference picker
  loop.js          Fixed-timestep game loop
  screen.js        Canvas scaling to the window
  input.js         Keyboard input tracking
  player.js        Player movement and collision
  clock.js         In-game clock (12-hour format, AM/PM)
  debug.js         Debug overlay
  map.js           Tile map loading, collision, and rendering
  camera.js        Camera that smoothly follows the player
  energy.js        Player energy & fatigue management
  farm.js          Farming plots, tilling, watering, growth, harvesting
  hud.js           Date/time/weather/money panel, active tool HUD
  inventory.js     16-slot inventory, stacking, food consumption
  shipping.js      Kaing shipping bin, item deposits, overnight payout
  shop.js          Tindahan ni Aling Nena (Sari-Sari Store) Buy & Sell UI
  sleep.js         Sleep prompt, pass-out clinic rescue, and day transition
  storage.js       LocalStorage save and load system
  toast.js         Floating in-game status notifications
  toolbar.js       Tool selection and seed cycling
  weather.js       Dynamic weather effects (sunny, rain)
  sprites.js       Procedural pixel-art sprite & tile renderer
  npc.js           30 Villagers scheduling, friendship, and gifting
  dialogue.js      Taglish dialogue box, choices, and Salita glossary
  bayanihan.js     Community restoration projects board & unlocks
  pet.js           Pet adoption (Dog/Cat), daily petting, following AI
  phone.js         In-game smartphone texting, banter, date invites
  romance.js       Modern Ligawan dating stages, marriage, and family
  events.js        4 seasonal fiestas, festivals, and wedding ceremonies
data/              All game data as JSON
  config.json      Engine settings (screen, speed, clock, energy, sleep, HUD)
  calendar.json    Season parts, rain chances, and weekdays
  crops.json       8 Philippine crop definitions, season tags, grow rates
  items.json       Crops, seeds, and food consumables definitions
  tools.json       Hoe, watering can, sickle, seed bag
  tiles.json       Tile types (color, solid or not, tillable, actions)
  npcs.json        30 villagers (10 romance, 8 core, 12 light)
  projects.json    4 Bayanihan village restoration projects
  glossary.json    Salita Tagalog dictionary for dialogue tooltips
  fiestas.json     4 seasonal fiesta festival definitions
  maps/
    farm.json      Bukid ni Lolo (crops, kaing, house & village warps)
    house.json     Lolo's House interior (bed, furniture, rug, exit door)
    village.json   Barangay Maliwanag plaza, store, bayanihan board
    store.json     Tindahan ni Aling Nena interior (counter, shelves)
docs/              GDD, roadmap, design decisions, playtest checklist
assets/placeholder Placeholder art
```

## Troubleshooting
- **Blank page, or "Could not start the game":** you opened the file directly. Use the server steps above.
- **`python` is not recognized:** try `py -m http.server 8000` on Windows, or reinstall Python with "Add to PATH" ticked.
- **Changes not showing:** hard-refresh with `Ctrl+F5`.
