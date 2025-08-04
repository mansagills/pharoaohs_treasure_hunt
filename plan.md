# Pharaoh’s Treasure Hunt — Game Design Plan

> **Platform:** Web (HTML/CSS/JavaScript). Prototype will be built in **Claude Code** with reusable modules for expansion.
> **Audience:** Ages 7–12 (upper elementary / early middle school)
> **Learning Goals:** Ancient‑Egypt history & culture, critical thinking, pattern recognition, problem solving.

---

## 1  Overview
**Pharaoh’s Treasure Hunt** places the player inside a multi‑chambered tomb beneath the Giza plateau. Guided by a friendly AI scribe, players decode hieroglyphs, disarm traps, and collect six sacred relics to unlock the Pharaoh’s Vault. Each chamber blends a short educational fact with an interactive mini‑puzzle lasting 3–5 minutes.

*Moment‑to‑moment loop ⇒ quick sessions; meta‑progression ⇒ sustained engagement.*

---

## 2  Core Gameplay Loop
| Step | Player Action | System Response | Learning Tie‑In |
|------|---------------|-----------------|-----------------|
| **1. Enter Chamber** | Choose a locked door on the tomb map. | Chamber scene loads with flickering torchlight. Scribe Samir greets player with a **foreshadow fact** (15 words). | Introduces cultural context. |
| **2. Explore & Gather** | Hover/click murals, statues, jars. | Tool‑tips + audio clips surface 1–2 clues. | Hieroglyph pronunciations, artifact usage. |
| **3. Solve Puzzle** | Interact with mini‑game (drag, arrange, type). | Puzzle engine tracks moves / timer. | Reinforces clues. |
| **4. Claim Treasure** | Collect 1 of 6 relics. | Inventory UI animates; XP/stars awarded. Micro‑quiz delivers extra bonus. | Retrieval practice. |
| **5. Choose Path** | Advance deeper or return to hub. | Next chamber unlocks; autosave progress. | Player agency. |

Average chamber time **≈ 4 min** → ideal for classroom centers or home study breaks.

---

## 3  Win & Lose Conditions
| Type | Condition | Feedback |
|------|-----------|----------|
| **Chamber Win** | Puzzle solved before **Torchlight** (time) or **Health** (trap hits) depletes. | “Treasure Acquired!” pop‑up, hieroglyph stamp animation, XP gain. |
| **Game Win** | All six relics + final Vault decoded. | Cinematic: Pharaoh’s spirit thanks player; printable certificate unlocked. |
| **Soft Lose** | Time or health reaches 0 in a chamber. | “You were lost in the dark …” Retry button with 1 free power‑up. |
| **Hard Lose** (optional) | 3 soft‑loses in one session. | Restart tomb; XP retained (kid‑friendly). |

---

## 4  Difficulty Curve
| Tier | Adjustments | Hieroglyph Decoder Example |
|------|-------------|--------------------------------|
| Easy (Ch 1–2) | ▪ 3 symbols ▪ No timer ▪ Reference chart visible | Match 3 glyphs to meanings. |
| Medium (Ch 3–4) | ▪ 5 symbols ▪ 60 s timer ▪ Chart fades after 10 s | Add 2 decoy glyphs. |
| Hard (Ch 5) | ▪ Randomized positions ▪ Base × 0.85 timer | Decode phrase “Life to Ra”. |
| Expert (Vault) | ▪ Chain of 3 puzzles with shared timer | Cipher → slider → logic path. |

**Adaptive Formula** (JS):
```js
const baseTime = 90; // sec
const levelFactor = 0.85;
const timeLimit = Math.floor(baseTime * Math.pow(levelFactor, tier - 1));
```

---

## 5  Power‑Ups & Collectibles
| Item | Acquire | Effect | Lore Justification |
|------|---------|--------|-------------------|
| Torch Refill | Hidden urn | +30 s Torchlight | Torches light tomb. |
| Ankh of Life | Quiz streak | +1 Heart | Ankh = life symbol. |
| Rosetta Hint | Watch 15‑s history clip | Highlights correct glyph for 5 s | Rosetta Stone. |
| Scarab Compass | Daily login | Glows over interactive objects | Scarab = guidance. |
| Golden Horus Wings | Rare drop / coin shop | Auto‑solve one puzzle quadrant | Horus = divine power. |

*All power‑ups are optional aids, not pay‑to‑win.*

---

## 6  Progression & Meta‑Systems
1. **Experience (XP)** – Puzzles → XP → Player Level 1‑20. Each level unlocks cosmetic skins (explorer hat, backpack).
2. **Treasure Altar** – Six relic slots glow when filled; drives completion.
3. **Badge Book** – Challenges such as *Glyph Guru* (solve 25 glyph matches), *Trap Dodger* (avoid 10 traps), *Historian* (view all facts).
4. **Printable Packets** – After each chamber, auto‑generate 1‑page PDF (trace a glyph, reflection prompt) via serverless function.

---

## 7  Additional Gameplay Elements
| Feature | Purpose | Implementation |
|---------|---------|---------------|
| Light Meter | Unified timer | `requestAnimationFrame` overlay gradually darkens screen. |
| Trap Micro‑Events | Breaks monotony | 2‑sec QTE: click safe tile before spikes. |
| Ambient Scrolls | Narrative depth | Randomize scroll passages from `scrolls.json`. |
| Adaptive Hints | Reduce frustration | After 2 wrong moves, puzzle element pulses. |
| Accessibility | Inclusive design | Toggle dyslexic font, high‑contrast palette. |

---

## 8  High‑Level JavaScript Architecture
```text
/game
  main.js          // finite‑state machine (MENU, HUB, CHAMBER…)
  audio.js         // loops & SFX, mute toggles
  map.js           // interactive tomb map & level gating
  puzzles/
      glyphMatch.js
      slider.js
      trapRun.js
  components/
      progressBar.js
      hintSystem.js
      inventory.js
  data/
      chambers.json  // tier, timer, glyph sets, reward IDs
      facts.json     // blurb strings + audio file refs
```
Use a lightweight **EventEmitter** (e.g., [`mitt`](https://github.com/developit/mitt)) to decouple modules.

---

## 9  Replay & Retention
* **Daily Challenge** – One randomized hard puzzle; leaderboard resets every 24 h.
* **Procedural Generator** – Shuffle glyph sets using date‑seed; classrooms solve same puzzle each day.
* **Speed‑Run Mode** – Unlock after story completion; score = total time, encourages mastery.

---

## 10  Next Steps
1. **Choose first puzzle** to prototype (recommend *Hieroglyph Decoder*).
2. Scaffold modules (`main.js`, `glyphMatch.js`) in Claude Code.
3. Integrate a JSON loader for glyph sets & facts.
4. Build printable packet generator (Node/Cloud Function + Puppeteer).

> **Need help?** Ask ChatGPT for a code skeleton, UI mock‑ups, or worksheet template.
