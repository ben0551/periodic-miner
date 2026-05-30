# Periodic Miner

An idle/incremental game inspired by AdVenture Communist, themed around mining the periodic table of elements.

**Play:** https://ben0551.github.io/periodic-miner/

---

## How to play

### The Mining Chain
Elements unlock left to right across the periodic table by atomic number: **H → He → Li → Be → ...** Each element requires enough of the previous element to unlock.

- **Click** an element cell to mine it manually and see a fun fact
- **Buy Drills** in the left panel — drills auto-mine continuously
- Drill costs are paid in the *previous* element (He drills cost H, Li drills cost He, etc.)

### Protons
**Noble gases** (He, Ne, Ar, Kr…) generate **Protons** passively as they mine. Protons are spent on **Research upgrades** in the right panel.

### Research
Three tabs in the right panel:
| Tab | What it does |
|---|---|
| **Available** | Upgrades you can buy (with Protons ± element costs) |
| **Reactions** | Chemical reactions that fire automatically when you accumulate the right elements |
| **Purchased** | Your upgrade history |

### Chemical Reactions
When you've mined enough of the right elements, a reaction fires automatically:
- Reagents are **consumed** from your stockpiles
- You receive a **Proton bonus**
- A **permanent production multiplier** is applied forever

Example: 500 H + 250 O → **Water (H₂O)** → +150 Protons, Hydrogen mines 25% faster permanently

### Nobel Prize Reset (Prestige)
Once you've unlocked **every element in the current Period**, the **Nobel Reset** button activates. Using it:
1. Resets that period's elements (stockpiles and drills go back to zero)
2. Grants a **permanent production multiplier** (×1.5 for Period 1, ×2.0 for Period 2, etc.)
3. **Unlocks the next Period** — you can't reach Period 2 without resetting Period 1

Earlier periods keep running throughout — you only lose the period you're resetting.

### Proton Prestige
Don't want to grind a full period? **Proton Prestige** lets you reset mid-period for a **×1.3 multiplier**:
- **Cost:** 750,000 Protons
- **Effect:** Reset current period + ×1.3 permanent boost
- **Available anytime** — no period completion required

Use this to break up mid-game grinding and power through plateaus.

### Group Bonuses
Complete all elements in a **periodic table column (group)** to unlock a **×1.2 production multiplier**. Bonuses stack multiplicatively, so completing 3 groups = **×1.728** total boost.

### Features Panel
Click any element to explore:
| Tab | What it shows |
|---|---|
| **Quiz** | Identify elements by symbol/name or reactions by formula. Earn +2 Protons per correct answer, +5 for streaks! |
| **Shells** | Electron shell configuration for any element |
| **Timeline** | Discovery history of all 118 elements by century |

### Radioactive Decay
Heavy elements (Po through Cm) slowly transmute into lighter ones passively, creating a secondary production chain.

### Expensive Proton Sinks
Mid-game Proton dumps to accelerate progression:
| Upgrade | Cost | Effect |
|---|---|---|
| **Element Synthesis** | 200,000 P | Instantly unlock one locked element (repeatable) |
| **Production Overdrive** | 100,000 P | All elements ×10 for 60 seconds |

### Themes
Choose from **7 vibrant themes** using the dropdown in the top bar:
- **Cave (Dark)** — Default dark blue aesthetic
- **Torch (Amber)** — Warm orange cave vibe  
- **Plasma (Neon)** — Electric green lab
- **Hydro (Ocean)** — Deep ocean blue
- **Carbon (Forest)** — Earthy green
- **Solar (Yellow)** — Bright warm gold
- **High Contrast** — Pure black/white for accessibility

Theme preference persists across sessions.

---

## Keyboard shortcuts
| Key | Action |
|---|---|
| Click element | Mine manually + see fact |
| Click splash | Dismiss discovery popup |
| Theme dropdown | Switch themes anytime |

---

## Game pacing
Designed for **1+ week** playtime. Each period takes exponentially longer:

| Period | Elements | Approx. time |
|---|---|---|
| 1 | H, He | ~1 hour |
| 2 | Li → Ne | ~3–6 hours |
| 3 | Na → Ar | ~1–2 days |
| 4 | K → Kr | ~3–4 days |
| 5+ | … | Much longer |

---

## Tech
Pure HTML/CSS/JavaScript — no frameworks, no build step. Open `index.html` via a local server:

```bash
cd periodic-miner
python -m http.server 8080
# then open http://localhost:8080
```

Or use the VS Code **Live Server** extension.

---

## Development

- **`beta` branch** — active development (merged to master after testing)
- **`master` branch** — stable, served via GitHub Pages
- Save format: `localStorage` key `periodic-miner-save`
- Debug console helpers: `Game.wipe()`, `Upg.protons += 9999`, `Res.maxUnlockedPeriod = 3`

### Recent Features
- 7-theme system with persistence
- Proton Prestige for mid-game resets
- Quiz system with longest-streak tracking
- Element Synthesis and Production Overdrive upgrades
- Educational feedback toasts for quiz answers
- Radioactive decay and group bonuses
- Reaction system with electronegativity and rarity mechanics

---

## Screenshots

> *(Add screenshots here once the UI is stable)*

---

## Credits

Built with Claude Code.
