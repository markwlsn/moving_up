# Ani sa Nayon — Game Design Document (working title)

## 1. Premise
After years of working in Manila, the player gets word that their Lolo has passed away
and left them **Bukid ni Lolo**, his small farm in **Barangay Maliwanag**. The barrio is
struggling. Young people have left, the fields are overgrown, the chapel roof leaks, and
the fiestas have stopped. The player decides to stay. By farming, helping neighbors, and
leading **bayanihan** (community) projects, they bring the farm and the barrio back to
life. Along the way they may adopt a pet, fall in love, marry, and raise a family.

## 2. Design Pillars
| Pillar | What it means in practice |
|---|---|
| **Cozy** | No fail states, no combat, no harsh penalties. Soft colors, gentle feedback. |
| **Slow** | Progress is measured in seasons, not minutes. Small daily goals, no grind walls. |
| **Community** | The village matters more than money. Friendships, bayanihan, fiestas, and family drive progression. |
| **Seasons** | The Philippine year: **Tag-init** (dry) and **Tag-ulan** (rainy). They shape crops, weather, and events. |

## 3. Calendar and Time
- **2 seasons, each split into Early and Late:** Early Tag-init, Late Tag-init, Early Tag-ulan, Late Tag-ulan.
- Each part has **28 days**, so a year is **112 days**.
- **The day runs 4:00 AM to 12:00 midnight.** If you're still awake at 2:00 AM, you pass out (a small energy and money loss).
- **All times display in 12-hour format** (for example, `4:00 AM` or `6:30 PM`).

## 4. Language Style
- **Dialogue is English first, with Tagalog words sprinkled in naturally** (*po/opo, Kuya, Ate, salamat, kain tayo, ingat, sige, kilig*).
- The meaning must always be clear from context. Never use full Tagalog sentences without a translation.
- **The "Salita" glossary** explains each Tagalog word the first time it appears.
- UI text is 100% English.

## 5. Villagers (30 total, tiered)
| Tier | Count | Content |
|---|---|---|
| **Romance candidates** | 10 (5 boys, 5 girls) | Full schedules, gift tastes, heart events, a dating system, marriage |
| **Core villagers** | 8 | Full schedules, gift tastes, friendship events |
| **Light villagers** | 12 | A simple schedule, a few rotating lines, basic gift reactions |

Each villager can come from a different generation (Lola, Tito/Tita, millennial, Gen Z, kids), so the barrio feels real.

## 6. Romance and Dating System ("Modern Ligawan")
The goal is a romance system that **feels like real millennial and Gen Z dating**, so players get invested. Players earn a relationship by **paying attention to who the character is**, not by spamming gifts.

### 6.1 Core stats per candidate
- **Hearts (0 to 10):** the overall relationship level.
- **Vibe Match:** compatibility based on the player's dialogue choices over time.
- **Love Language:** each candidate has a primary one, taken from the five love languages (gifts, quality time, words of affirmation, acts of service, physical touch, shown here as hugs and holding hands). The love language decides which actions count double.

### 6.2 Mechanics
1. **Personality-based dialogue choices.** Each candidate has traits (for example: introvert, hopeless romantic, career-driven, chill, witty). Answers that fit their personality raise Vibe Match. Answers that clash lower it slightly. There's **no single "right" answer** across all candidates, so the player has to learn each person.
2. **Green flags and red flags.** Some choices are universally good (being kind, respecting boundaries, being honest) or universally bad (love-bombing, being rude to a Lola, flaking). Candidates react visibly.
3. **Gifting with intent.** Gifts are scored by the candidate's taste, their love language, and *context*: birthdays, a gift that matches what they mentioned recently, or "too much too soon" early on.
4. **Texting (an in-game phone).** At certain heart levels, candidates text the player. Reply choices matter. Taking too long to reply has a mild effect ("seen-zoned" banter, never cruel).
5. **Dates.** From 3 hearts, invite them to date spots: the plaza at night, a *kapehan* (café), stargazing at the farm, a river picnic, fiesta night. Each candidate has favorite and disliked spots.
6. **Talking stage, then "Ano tayo?" (DTR, "define the relationship"), then official.** The relationship goes through stages: *Crush, Talking Stage, Dating, Official (mag-jowa), Engaged, Married*. Each stage gate is a heart event where the player's past choices determine the outcome.
7. **A challenge with no punishment.** A failed DTR or confession can be retried after some days. Candidates don't hate the player forever (the cozy pillar).
8. **Jealousy is optional and soft.** Dating several candidates at once is possible until "Official". After that, flirting with others lowers hearts and triggers a talk-it-out event. It's never toxic or controlling.
9. **Player preference.** At the start, the player chooses their own appearance (placeholder) and who they're interested in: boys, girls, or both. Only the matching candidates show romance options.

> ⚠️ Design guardrail: the system must model **healthy** modern dating. It should reward communication, consent, and consistency. No manipulation mechanics.

## 7. Marriage and Family
- **Proposal:** at 10 hearts and the Official stage, buy a placeholder proposal item (a ring) to propose.
- **Wedding:** a village event with a wedding cutscene in a barrio fiesta style.
- **The spouse moves in** to the upgraded farmhouse. They have a daily routine and sometimes help (watering, feeding the pet).
- **Children:** up to 2, if the player wants them. Kids grow through stages (baby, toddler, child) over in-game seasons. Adoption is available for every couple.
- **Family events:** birthdays, the first day of school, family fiesta outings.
- Requires a **house upgrade** (a small carpentry project at the village).

## 8. MVP Feature List
1. **Movement and world:** a top-down tile map with the farm, the village square, and interiors.
2. **Time:** a 12-hour clock (4 AM to 12 AM), the 4-part calendar, and sleeping to end the day.
3. **Energy:** tool use costs energy. Sleeping and eating restore it.
4. **Farming:** 8 season-tagged crops.
5. **Tools:** hoe, watering can, sickle, seed bag. No upgrades.
6. **Inventory and a shipping basket (kaing).**
7. **Sari-sari store.**
8. **30 villagers,** tiered as in section 5.
9. **The Modern Ligawan romance system,** as in section 6.
10. **Marriage and family,** as in section 7.
11. **Pet: a dog or a cat.**
12. **3 bayanihan projects,** plus a house upgrade project.
13. **4 fiestas,** one per season part (placeholder names: Flores Festival, Pista ng Ani, Araw ng Bayanihan, Barangay Fiesta).
14. **Save and load** to localStorage.
15. **Data-driven content** in `/data/*.json`.

## 9. Out of Scope (MVP)
- Livestock (carabao, chickens, goats)
- Mining, fishing, foraging minigames
- Tool upgrades and crafting trees
- Combat
- Multiplayer, mobile/touch controls, and gamepad support
- Real art, music, and sound (placeholders only)
- Voice acting and full localization
- Multiple save slots
- Divorce and family breakup mechanics
- Any copyrighted names, art, or music from Harvest Moon, Story of Seasons, Natsume, or Stardew Valley. We're inspired by their mechanics only.

## 10. Controls (keyboard)
| Action | Keys |
|---|---|
| Move | Arrow keys or WASD |
| Use tool / Interact / Talk | Space or J |
| Cancel / Back | Esc or K |
| Cycle tool | Q / E |
| Inventory | I or Tab |
| Phone (texts) | P |
| Toggle debug overlay | F3 (backtick as a fallback) |

## 11. Target Session Length
- **One in-game day:** about 12 real minutes.
- **Typical session:** 20 to 40 minutes.
- **MVP "main arc"** (restore the village, marry): about 2 in-game years, roughly 40 to 50 hours.

## 12. Tagalog Notes
- I'm confident about: *ani, nayon, bukid, lolo, bayanihan, barangay, sari-sari, tag-init, tag-ulan, kaing, aso, pusa, salamat, pista, ligawan (courtship), kilig, jowa (slang for partner), kapehan*.
- ⚠️ **Flag:** "Pista ng Ani" and "Araw ng Bayanihan" are invented names. Please confirm.
- ⚠️ **Flag:** "Ano tayo?" ("What are we?") is common Filipino Gen Z slang for DTR. Please confirm you like it in-game.
