# Roadmap: Ani sa Nayon

## Antigravity Tools Guide
None of the installed Antigravity **skills** are made for game development. Most are for Google Cloud and data work.
The tools that actually help us are below. Each phase lists the ones that fit it.

| Tool | Type | Why it helps |
|---|---|---|
| `/plan` | Slash command | Plans a phase step by step before any code is written |
| `/grill-me` | Slash command | An interview that settles design details (dialogue, dating rules) before building |
| `/browser` | Slash command | The agent opens the game in a browser to test and screenshot it |
| `/boost` | Slash command | Deep thinking plus verification, for complex systems |
| `/learn` | Slash command | Saves project conventions so the agent follows them every time |
| `/goal` | Slash command | Long, thorough runs (for example, writing all the villager data) |
| `generative_ui` | Skill | Interactive diagrams and visual previews (maps, UI mockups, relationship graphs) |
| `agy-customizations` | Skill | Lets us create a **custom project skill** for this game (see Phase 1) |
| `managing-python-dependencies` | Skill | Only for running `python -m http.server` safely (no installs needed) |

## Phase 0: Design Doc
- [x] docs/GDD.md
- [x] docs/ROADMAP.md
- [x] docs/DECISIONS.md

**Tools:** `/grill-me` (done informally through our Q&A)

## Phase 1: Foundation
- [x] Folder structure: src/, data/, docs/, assets/placeholder/
- [x] Fixed-timestep game loop
- [x] Canvas that scales to the browser window
- [x] 4-direction keyboard movement for a placeholder square
- [x] Debug overlay: FPS, player position, in-game clock (12-hour format)
- [x] README.md with run instructions
- [ ] *(Optional)* Create a project skill `ani-sa-nayon-rules` (data in JSON, no copyrighted assets, 12-hour clock, English-first dialogue, update DECISIONS.md)

**Tools:** `agy-customizations` (for the project skill), `/learn`, `/browser` (to check the movement and overlay)

## Phase 2: Tile Map and Camera
- [x] Map format in data/maps/*.json
- [x] Tile rendering, collision, and a camera that follows and clamps

**Tools:** `/plan`, `generative_ui` (preview the map layout before coding), `/browser`

## Phase 3: Time, Calendar, and Energy
- [x] Clock from 4:00 AM to 12:00 midnight (12-hour format). Pass out at 2:00 AM.
- [x] 4-part calendar (Early/Late Tag-init and Tag-ulan, 28 days each)
- [x] Sleep, the energy bar, and the HUD

**Tools:** `/plan`, `generative_ui` (HUD mockup), `/browser`

## Phase 4: Farming Core
- [x] data/crops.json (8 crops)
- [x] Tools and the till, plant, water, grow, harvest loop
- [x] Rain auto-waters crops

**Tools:** `/plan`, `/boost` (the crop state machine), `/browser`

## Phase 5: Items, Inventory, and Shipping
- [x] data/items.json, the inventory UI, the kaing shipping basket, and money

**Tools:** `generative_ui` (inventory UI mockup), `/browser`

## Phase 6: Maps, the Shop, and Save/Load
- [x] Farm, village, interiors, and warps
- [x] Sari-sari store UI
- [x] Save and load to localStorage

**Tools:** `/plan`, `/boost` (save data format and versioning), `/browser`

## Phase 7: Villagers and Dialogue
- [x] data/npcs.json for 30 villagers (10 romance, 8 core, 12 light)
- [x] Dialogue box with choices (English first, with Tagalog words) and the Salita glossary
- [x] Schedules, friendship, and gifting

**Tools:** `/grill-me` (villager personalities), `/goal` (writing data for 30 villagers), `generative_ui` (villager relationship map), `/browser`

## Phase 8: Bayanihan, Pet, and the House Upgrade
- [x] Donation board and 3 village projects
- [x] House upgrade project
- [x] Pet adoption (dog or cat)

**Tools:** `/plan`, `/browser`

## Phase 9: Weather, Events, and the 4 Fiestas
- [x] Out-of-season crops wither, and weather (sunny, rain, bagyo)
- [x] Data-driven cutscene/event system
- [x] 4 fiestas

**Tools:** `/boost` (event/cutscene engine), `/grill-me` (fiesta content), `/browser`

## Phase 10: Romance, Marriage, and Family
- [x] Interest preference at game start
- [x] Hearts, Vibe Match, love languages, and green/red flags
- [x] In-game phone texting
- [x] Dates and date spots
- [x] Relationship stages, with heart events at each gate (Crush through Married)
- [x] Proposal and wedding event
- [x] Spouse routine, children (up to 2) and adoption, family events

**Tools:** `/grill-me` (dating rules and candidate personalities), `/boost` (Vibe Match scoring), `/goal` (heart events for 10 candidates), `generative_ui` (relationship stage flowchart), `/browser`

## Phase 11: Polish and MVP Release
- [x] Balancing (prices, growth, hearts)
- [x] Opening intro (Sunset title screen, Lolo's Letter prologue, romance preference picker)
- [x] Bug fixing and a playtest checklist (docs/PLAYTEST.md and scratch test suites)
- [x] Update the docs and tag the MVP (README, DECISIONS, ROADMAP, PLAYTEST)

**Status:** COMPLETE (All 11 phases finished). Ready for cozy play!
