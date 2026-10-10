# Design Decisions Log

| ID | Decision | Reason |
|---|---|---|
| D-001 | Vanilla JS (ES modules) + HTML5 Canvas, no build step | Requested. Easy to run and inspect. |
| D-002 | All content lives in /data as JSON | Requested. Content can change without touching code. |
| D-003 | 2 Philippine seasons (Tag-init / Tag-ulan), each split into Early/Late of 28 days | Approved by you. It's authentic to the setting, and the sub-seasons keep crop and event variety. |
| D-004 | MVP excludes livestock, combat, tool upgrades, and marriage/children | Keeps scope achievable. Romance is in, but stops at the relationship stage. |
| D-005 | No fail states | Supports the "cozy" pillar. |
| D-006 | The day runs 4:00 AM to 12:00 midnight. Pass out at 2:00 AM. About 12 real minutes per day. | Your feedback: PH farmers start around 4 AM. |
| D-007 | All in-game times use 12-hour format (AM/PM) | Your feedback: the PH commonly uses 12-hour time. |
| D-008 | Dialogue is English first with Tagalog words sprinkled in, plus a glossary | Your feedback: friendly to global players while keeping local flavor. |
| D-009 | 20 villagers | Your request. It makes the barrio feel alive. (Scope risk: see open questions.) |
| D-010 | 4 fiestas, one per season part | Your request. One per 28-day part gives each part a climax. |
| D-011 | Pet: dog or cat, player's choice | Your request. Adds coziness without a livestock system. |
| D-012 | Romance route, with a boy or girl love interest chosen by the player | Your request. Inclusive, and driven by player preference. |
| D-013 | Debug overlay toggles with F3 | A common convention with no key conflicts. |
| D-014 | 30 villagers in tiers: 10 romance, 8 core, 12 light | Your request. Tiering keeps the writing load manageable. |
| D-015 | 10 romance candidates (5 boys, 5 girls). The player picks boys, girls, or both. | Your request. Inclusive and preference-driven. |
| D-016 | "Modern Ligawan" dating: Vibe Match, love languages, green/red flags, texting, dates, DTR stages | Your request. Mirrors millennial and Gen Z dating so players stay invested, and rewards attention over gift spam. |
| D-017 | Failed confessions and DTRs can be retried, and there's no permanent hate | Cozy pillar: a challenge without punishment. |
| D-018 | Marriage and family (up to 2 kids, adoption available) are in the MVP | Your request. This replaces D-004's exclusion of marriage. |
| D-019 | Save/load moved from Phase 10 to Phase 6 | Long-term systems (romance, family) need saves for testing. |
| D-020 | The dating system must model healthy relationships, with no manipulation mechanics | Keeps the tone cozy and respectful. |
| D-021 | Internal resolution 480x270, scaled by whole numbers with letterboxing | A 16:9 ratio. Whole-number scaling keeps placeholder pixels crisp on any window size. |
| D-022 | Fixed timestep at 60 ticks/sec, with render interpolation and a 0.25 s frame cap | Same game speed on any monitor. Interpolation keeps motion smooth on 120/144 Hz screens. The cap prevents a catch-up freeze after switching tabs. |
| D-023 | 4-direction movement, with vertical keys taking priority when two are held | Matches classic grid-farming feel and avoids diagonal movement. |
| D-024 | Tunables (speed, colors, clock rate) live in data/config.json | Follows the "data in JSON" rule even for engine settings. |
| D-025 | Phase 1 clock wraps at 2:00 AM to 4:00 AM the next day | A temporary placeholder. Phase 3 will add pass-out and sleep. |
| D-026 | Maps are JSON with a `legend` and `rows` of text characters, and tile types live in data/tiles.json | You can read and edit a map in any text editor. Tile properties are defined once and reused. |
| D-027 | The map loader validates row count, row width, and unknown characters, then fails with a clear error | Bad map data shows up immediately instead of as silent visual bugs. |
| D-028 | 16 px tiles, and the player hitbox is 14 px | A tile-sized player would snag on 1-tile gaps (like the fence gate). 14 px slides through comfortably. |
| D-029 | Axis-separated collision that snaps flush to the tile edge | Simple and reliable, with no tunneling at our speeds, and the player sits neatly against walls. |
| D-030 | The camera centers on the player, clamps to map edges, and rounds to whole pixels | No void beyond the map edges, and no tile shimmer. Small maps get centered. |
| D-031 | Outside the map counts as solid | The player can never leave the map, even without border tiles. |
| D-032 | Only visible tiles are drawn | Keeps rendering cheap as maps grow. |
| D-033 | Time is stored as minutes since midnight, and values past 1440 mean after midnight (same in-game day) | Staying up until 1 AM still counts as "today", which keeps sleep and day logic simple. |
| D-034 | The year starts on Early Tag-init Day 1, a Monday. 112-day year, 7-day week. | A clean start. Weekdays will drive shop hours and NPC schedules later. Calendar lives in data/calendar.json. |
| D-035 | Sleeping before 12 AM restores 100% energy, after 12 AM restores 75%, and passing out at 2 AM restores 50% | Gentle pressure to sleep on time, with no harsh penalty (cozy). Restoring never lowers energy. |
| D-036 | Passing out will cost 10% of money, applied in Phase 5 | Money doesn't exist yet. The value is already in config. |
| D-037 | At 0 energy the player moves at 60% speed instead of fainting | No fail states. Exhaustion is felt but never blocks play. |
| D-038 | Temporary: interacting with the house door triggers sleep | There's no house interior or bed until Phase 6. This is a tile `action` in tiles.json, so it's easy to move later. |
| D-039 | The clock pauses during the sleep prompt and the transition | You don't lose time while reading a prompt. |
| D-040 | Debug keys (`]` = +1 hour, `-` = drain energy) only work while the debug overlay is visible | Fast testing of late nights and exhaustion without affecting normal play. |
| D-041 | Each season part has its own color in the HUD | You can see at a glance which part of the year it is. |
| D-042 | 8 Philippine crops defined in data/crops.json with season tags, grow/regrow times, and prices | Covers both Tag-init and Tag-ulan with multi-harvest regrowable crops (Talong, Sitaw, Ampalaya, Okra) and single-harvest crops (Palay, Kamote, Kalabasa, Mais). |
| D-043 | Unwatered crops pause growth rather than withering | Reinforces the cozy pillar (no harsh penalties or stress). |
| D-044 | Target cursor indicator rendered on facing tile | Gives clear visual feedback on which tile hoe/can/sickle/seeds will interact with. |
| D-045 | Tools cycle with Q/E, seed varieties cycle with R, use/interact with Space/J | Familiar ergonomic keyboard control scheme. |
| D-046 | Rain automatically waters all tilled plots overnight and rolls probabilistically from calendar part rainChance | Simulates authentic Philippine wet/dry seasonal dynamics without requiring daily manual watering on rainy days. |
| D-047 | Debug key `=` immediately waters and advances crop growth by 1 day | Accelerates testing of multi-stage plant growth and regrowth cycles. |
| D-048 | 16-slot grid inventory with stack support (up to 99) in src/inventory.js and data/items.json | Simple, expandable bag interface accessed with `I` or `Tab`. |
| D-049 | Planting seeds consumes seed packets from inventory | Connects farming production directly to the player's stock and store purchases. |
| D-050 | Consumable food items (Pan de Sal, Kapeng Barako, Bibingka) restore energy | Offers active recovery options during the work day without having to sleep prematurely. |
| D-051 | Shipping basket (Kaing) overnight payout with clear morning financial report | Culturally authentic vessel (kaing basket); morning card highlights exact earnings and hospital fees. |
| D-052 | Multiple maps with data-driven `warps` list and fade transitions | Farm, House Interior, Barangay Maliwanag Village, and Tindahan ni Aling Nena smoothly interconnected. |
| D-053 | Tindahan ni Aling Nena with dedicated Buy and Sell tabs | Players can buy seeds/snacks or liquidate goods for immediate cash in the village. |
| D-054 | Automatic game saving to localStorage on overnight sleep, plus manual quick-save [F5] and quick-load [F9] | Players never lose daily progress; testing long seasonal arcs is friction-free. |
| D-055 | Procedural pixel-art rendering in src/sprites.js (salakot hat farmer, chibi villagers, pet, textured tiles) | Elevates game visuals from flat monochrome block placeholders to a cozy, nostalgic 16-bit retro style without external assets. |
| D-056 | 30 tiered villagers in data/npcs.json with morning/afternoon/evening schedules | Full barrio atmosphere with 10 romance candidates, 8 core pillars, and 12 colorful barrio residents. |
| D-057 | Salita Glossary dictionary in data/glossary.json automatically annotations dialogue | Preserves authentic Tagalog linguistic flavor while ensuring global accessibility. |
| D-058 | Bayanihan board in village plaza tracks 4 restoration projects with tangible gameplay unlocks | Reinforces the Community pillar: repairing the chapel unlocks weddings, expanding the farmhouse unlocks family life. |
| D-059 | Pet system (Aso / Pusa) with daily petting, heart affection, and following AI | Adds cozy companionship to Bukid ni Lolo. |
| D-060 | In-game smartphone (Modern Ligawan) messaging with banter, date planning, and DTR chats | Adapts dating sim gameplay to modern millennial and Gen Z communication styles. |
| D-061 | 4 seasonal fiestas on Day 20 of each season part with plaza celebrations | Provides festive milestone events throughout the 112-day year. |
| D-062 | Atmospheric time-of-day lighting tints for misty dawn, sunset golden hour, and moonlight night | Enhances rural immersion without performance penalty; soft color overlays applied cleanly above tile layers. |
| D-063 | Title screen & opening prologue system in `src/title.js` | Welcomes player with rural silhouette sunset, dating preference picker (all/girls/boys), and Lolo's Letter story slides. |
| D-064 | In-game Controls Guide modal accessible via [F1] / [H] and Title Screen | Seamless, instant keybind reference without breaking gameplay or needing external manuals. |
| D-065 | Economy & crop growth balance tuned for satisfying 112-day seasonal loop | Quick income from fast crops (Okra, Kamote) funds long-term staples (Palay, Mais, Kalabasa) and community restoration goals. |
