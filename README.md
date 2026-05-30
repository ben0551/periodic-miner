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

---

## Keyboard shortcuts
| Key | Action |
|---|---|
| Click element | Mine manually + see fact |
| Click splash | Dismiss discovery popup |

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

- **`beta` branch** — active development
- **`master` branch** — stable, served via GitHub Pages
- Save format: `localStorage` key `periodic-miner-save-v2`
- Debug console helpers: `Game.wipe()`, `Upg.protons += 9999`, `Res.maxUnlockedPeriod = 3`

---

## Screenshots

> *(Add screenshots here once the UI is stable)*

---

## Credits

Built with Claude Code.
