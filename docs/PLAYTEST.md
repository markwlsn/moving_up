# Ani sa Nayon — MVP Playtest Checklist & Verification Guide

This checklist guides you through verifying every system in the complete MVP release of **Ani sa Nayon** (Barangay Maliwanag).

---

## 🚀 Quickstart
1. In the terminal, start the local server:
   ```bash
   python -m http.server 8000
   ```
2. Open your web browser to:
   ```
   http://localhost:8000/
   ```

---

## 🎮 Controls Reference
| Key | Action | Context |
|---|---|---|
| **Arrow Keys** or **WASD** | Move player character | All maps |
| **Space** or **J** | Interact / Confirm / Use tool / Harvest / Talk / Pet | In-world & dialogs |
| **Escape** or **K** | Cancel / Close modal / Return | All menus & modals |
| **Q** / **E** | Cycle active tool (Hoe, Watering Can, Sickle, Seeds) | In-world farming |
| **R** | Cycle active seed type (Kamote, Okra, Talong, etc.) | In-world farming |
| **I** or **Tab** | Open / close inventory bag | In-world |
| **P** | Open / close smartphone (Modern Ligawan) | In-world |
| **F1** or **H** | Open / close Controls Guide (Gabay sa Nayon) | Anytime during play |
| **F5** | Quick Save game | In-world |
| **F9** | Quick Load game | In-world |
| **F3** or **`** | Toggle Debug Overlay | In-world |
| **]** | Skip 1 hour (requires debug overlay) | Debug |
| **-** | Drain 20 energy (requires debug overlay) | Debug |
| **=** | Water and advance crops 1 day (requires debug overlay) | Debug on Farm |

---

## 📋 Comprehensive Playtest Checklist

### 1. Title Screen & Opening Prologue
- [ ] **Sunset Title Screen:** Launching the game displays the warm twilight sky, silhouette mountains, nipa hut, and "ANI SA NAYON" title banner.
- [ ] **Controls Modal:** Selecting `Controls & Guide` opens the full overlay. Pressing `Escape`, `Space`, or `H` returns smoothly to the title menu.
- [ ] **Dating Preference Selection:** Selecting `Start New Game` opens the Modern Ligawan dating preference modal:
  - *Everyone (Boys & Girls)*
  - *Girls Only* (Maya, Bianca, Tala, Nicole, Andrea)
  - *Boys Only* (Jericho, Miguel, Joshua, Rafael, Enzo)
- [ ] **Lolo's Letter Prologue:** 3-page story sequence detailing moving from Manila traffic back to Bukid ni Lolo with grandfather's handwritten letter. Pressing `Space` advances each slide until entering the farm.

### 2. Bukid ni Lolo (Farm & Chibi Character)
- [ ] **Visual Appearance:** Player renders as an authentic chibi farmer wearing a woven straw *salakot* hat and blue *camisa*.
- [ ] **Smooth Movement:** Smooth 8-directional movement with 4-frame walk cycle animations and boundary collision.
- [ ] **Facing Cursor:** A targeted white tile outline indicates the interactive tile in front of the player.
- [ ] **Atmospheric Lighting:** Experience dynamic ambient lighting shifts:
  - *Misty Dawn (4:00 AM - 6:00 AM):* Soft indigo mist.
  - *Golden Hour (5:00 PM - 7:00 PM):* Warm amber glow.
  - *Night (7:00 PM - 2:00 AM):* Deep moonlit blue.

### 3. Farming Cycle & Filipino Crops
- [ ] **Tilling Soil:** Equip the **Hoe** (`Q`/`E`), face a soil tile, press `Space`. Soil turns into rich dark tilled earth.
- [ ] **Planting Seeds:** Equip **Seeds**, select **Kamote** or **Okra** (`R`), face tilled soil, press `Space`. A seed is consumed from inventory and a small green sprout appears.
- [ ] **Watering:** Equip the **Watering Can**, press `Space` on planted soil. Plot darkens with wet soil texture.
- [ ] **Crop Growth:** Use debug key `=` or sleep overnight. Sprouts grow into adolescent plants, then into ripe harvestable vegetables.
- [ ] **Regrow Mechanics:** Harvest ripe **Talong** or **Okra** with `Space`. Yield enters inventory, and the plot reverts to regrowth stage instead of vanishing!
- [ ] **Cozy Rule:** Unwatered crops pause growth rather than withering or dying.

### 4. Bag & Inventory Management
- [ ] Press `I` or `Tab` to open the 16-slot woven bag modal.
- [ ] Navigate grid slots using Arrow keys.
- [ ] Hovering over items displays English name, Tagalog name, description, and market sell value.
- [ ] Select a food item (**Pan de Sal**, **Kapeng Barako**, or **Bibingka**) and press `Space` to consume it and restore Energy.

### 5. Overnight Shipping (Kaing Basket)
- [ ] Walk to the woven bamboo *kaing* basket at the edge of the farm path (tile X: 24, Y: 11).
- [ ] Press `Space` to open the shipping deposit menu.
- [ ] Deposit harvested vegetables into the basket.
- [ ] Sleep in bed at Lolo's House.
- [ ] **Morning Statement:** The morning summary card displays items shipped, gross earnings, and adds money to your wallet.

### 6. Lolo's House, Sleep & Pass-out Safety
- [ ] Step into the doorway of Lolo's House (X: 19, Y: 8) to enter the interior with woven *sawali* walls and capiz windows.
- [ ] Walk up to the wooden bed (X: 10, Y: 5) and press `Space`.
- [ ] Confirm sleep: Screen fades out, day advances, energy fully restores to 100, and player wakes up at 4:00 AM.
- [ ] **Pass-out Test:** Stay awake until 2:00 AM (or use `]` debug key). Player collapses from exhaustion and wakes up safely at 6:00 AM in bed with a 10% clinic fee deducted.

### 7. Barangay Maliwanag Exploration (Map Warps)
- [ ] Exit Bukid ni Lolo down the eastern path to transition seamlessly into **Barangay Maliwanag Village**.
- [ ] Explore the village plaza, stone fountain, community basketball court, kapilya (chapel), and riverbank.
- [ ] Walk into **Tindahan ni Aling Nena** (X: 16, Y: 13) to enter the general store.

### 8. Tindahan ni Aling Nena (Shop Economy)
- [ ] Speak with Aling Nena behind the wooden counter or interact with the cash register.
- [ ] **Buy Tab:** Purchase seasonal seeds (Kamote, Talong, Okra, Palay) and merienda food snacks (Pan de Sal, Kapeng Barako, Bibingka).
- [ ] **Sell Tab:** Press `Q`/`E` to switch to Sell mode and immediately liquidate bag items for cash.

### 9. 30 Villagers, Dialogue & Salita Glossary
- [ ] Meet villagers across morning, afternoon, and evening schedules.
- [ ] Talk to villagers using `Space`. Dialogue box displays character portraits, role titles, friendship hearts, and authentic Filipino dialogue.
- [ ] **Salita Glossary:** In-game Tagalog terms (*po, opo, salamat, kain tayo, meryenda, bayanihan*) are accompanied by natural context.
- [ ] **Gifting:** Select an item in bag, talk to a villager, and choose `Give Gift`. Villagers react with distinct Loved, Liked, or Disliked reactions.

### 10. Bayanihan Village Restoration Board
- [ ] Visit the wooden bulletin board in the village plaza (X: 23, Y: 15) and press `Space`.
- [ ] View progress across 4 landmark community projects:
  - *Kapilya Roof Repair* (1,200g, 15 Palay) — Unlocks village weddings!
  - *Bamboo Footbridge* (800g, 10 Mais) — Connects shortcut paths.
  - *Barangay Basketball Court* (1,500g, 20 Kamote) — Unlocks summer tournament.
  - *Bukid ni Lolo House Expansion* (2,500g, 25 Kalabasa) — Required for marriage and nursery!
- [ ] Donate gold or crops with `Space`. Progress bar updates in real time.

### 11. Adoptable Pet (Aso / Pusa)
- [ ] Find the wandering rescue pet in the village or farm.
- [ ] Approach within range and press `Space` to pet. Heart emoticons and affection gain are toasted.
- [ ] Once adopted, the pet follows the player between maps and greets you every morning.

### 12. Smartphone & Modern Ligawan Dating
- [ ] Press `P` anytime in-world to bring up the sleek smartphone interface.
- [ ] Candidates match the dating preference chosen at game start.
- [ ] Select a candidate to open their message thread.
- [ ] **Date Invites:** Press `[1]` to ask on a Plaza date or `[2]` to invite to Enzo's Kapihan. At 3+ hearts, candidates enthusiastically accept with banter (+25 Vibe Match)!
- [ ] **DTR Chat:** Press `Space` to initiate "Ano tayo?" Define the Relationship. Move from Crush → Talking Stage → Mag-jowa (Official).
- [ ] **Marriage Proposal:** At 10 hearts with upgraded farmhouse and repaired chapel, propose with Singsing!

### 13. Seasonal Fiestas
- [ ] On Day 20 of each season part:
  - *Day 20 (Early Tag-init):* Flores Festival in the plaza.
  - *Day 48 (Late Tag-init):* Pista ng Ani (Harvest Festival).
  - *Day 76 (Early Tag-ulan):* Araw ng Bayanihan celebration.
  - *Day 104 (Late Tag-ulan):* Barangay Fiesta with lechon and music.
- [ ] The top HUD displays a glowing golden fiesta badge on festival days.

### 14. Persistence & Quick Save/Load
- [ ] Press `F5` to quick save at any time. A green "Progress saved! [F5]" toast appears.
- [ ] Harvest crops, spend money, or move maps.
- [ ] Press `F9` to quick load. All positions, wallet, inventory, plots, and romances are perfectly restored.
- [ ] Refresh the browser. Title Screen detects existing save file and displays **Continue Game** as the primary option!
