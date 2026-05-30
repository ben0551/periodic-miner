// ============================================================
// PERIODIC MINER — Element Data
// ============================================================
// Each element is a node in the mining chain.
//
// GAME DESIGN — Resource Chain:
//   Elements unlock left-to-right within each period.
//   Unlocking element N requires accumulating a threshold
//   of element N-1. This mirrors AdVenture Communist's
//   "produce enough potatoes to unlock land" mechanic.
//
//   Element properties used by the engine:
//     atomicNumber  — unique ID, also the chain position
//     period        — which row (1-7); completing a period
//                     enables the Nobel Prize prestige reset
//     group         — column (1-18); noble gases (18) are
//                     the "science" currency of each period
//     baseRate      — base production per drill per second
//                     (scales as 1 / atomicNumber^1.2)
//     unlockCost    — how much of element N-1 is needed
//     drillCostBase — cost in element N-1 to buy first drill
//     category      — visual grouping for the table
// ============================================================

// Scaling helpers — tuned for ~1 week playtime.
// Each period takes exponentially longer; Nobel Prize resets are required to progress.
function _defaultRate(atomicNumber) {
  return Math.max(0.001, 1.0 / Math.pow(atomicNumber, 1.15));
}

function _defaultUnlockCost(atomicNumber) {
  if (atomicNumber === 1) return 0;
  return Math.floor(100 * Math.pow(1.6, atomicNumber - 2));
}

function _defaultDrillCost(atomicNumber) {
  if (atomicNumber === 1) return 0;
  return Math.floor(20 * Math.pow(1.65, atomicNumber - 2));
}

function _rarityMultiplier(atomicNumber) {
  // Lanthanides (57-71) are 8x rarer
  if (atomicNumber >= 57 && atomicNumber <= 71) return 8;
  return 1;
}

// ── Element Definitions ──────────────────────────────────
// tableCol / tableRow are the visual grid positions (1-indexed).
// Standard periodic table layout with lanthanide/actinide rows
// placed at the bottom (rows 8-9) and period 6-7 have a gap.

const ELEMENTS = [
  // ── Period 1 ──────────────────────────────────────────
  { atomicNumber: 1,   symbol: 'H',  name: 'Hydrogen',      period: 1, group: 1,  tableRow: 1, tableCol: 1,  category: 'nonmetal',        baseRate: 3.0,   unlockCost: 0,         drillCostBase: 20 },
  { atomicNumber: 2,   symbol: 'He', name: 'Helium',         period: 1, group: 18, tableRow: 1, tableCol: 18, category: 'noble-gas',       baseRate: 0.5,   unlockCost: 200,       drillCostBase: 50 },

  // ── Period 2 ──────────────────────────────────────────
  { atomicNumber: 3,   symbol: 'Li', name: 'Lithium',        period: 2, group: 1,  tableRow: 2, tableCol: 1,  category: 'alkali-metal',    baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 4,   symbol: 'Be', name: 'Beryllium',      period: 2, group: 2,  tableRow: 2, tableCol: 2,  category: 'alkaline-earth',  baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 5,   symbol: 'B',  name: 'Boron',          period: 2, group: 13, tableRow: 2, tableCol: 13, category: 'metalloid',       baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 6,   symbol: 'C',  name: 'Carbon',         period: 2, group: 14, tableRow: 2, tableCol: 14, category: 'nonmetal',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 7,   symbol: 'N',  name: 'Nitrogen',       period: 2, group: 15, tableRow: 2, tableCol: 15, category: 'nonmetal',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 8,   symbol: 'O',  name: 'Oxygen',         period: 2, group: 16, tableRow: 2, tableCol: 16, category: 'nonmetal',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 9,   symbol: 'F',  name: 'Fluorine',       period: 2, group: 17, tableRow: 2, tableCol: 17, category: 'halogen',         baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 10,  symbol: 'Ne', name: 'Neon',           period: 2, group: 18, tableRow: 2, tableCol: 18, category: 'noble-gas',       baseRate: null,  unlockCost: null,      drillCostBase: null },

  // ── Period 3 ──────────────────────────────────────────
  { atomicNumber: 11,  symbol: 'Na', name: 'Sodium',         period: 3, group: 1,  tableRow: 3, tableCol: 1,  category: 'alkali-metal',    baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 12,  symbol: 'Mg', name: 'Magnesium',      period: 3, group: 2,  tableRow: 3, tableCol: 2,  category: 'alkaline-earth',  baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 13,  symbol: 'Al', name: 'Aluminium',      period: 3, group: 13, tableRow: 3, tableCol: 13, category: 'post-transition', baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 14,  symbol: 'Si', name: 'Silicon',        period: 3, group: 14, tableRow: 3, tableCol: 14, category: 'metalloid',       baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 15,  symbol: 'P',  name: 'Phosphorus',     period: 3, group: 15, tableRow: 3, tableCol: 15, category: 'nonmetal',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 16,  symbol: 'S',  name: 'Sulfur',         period: 3, group: 16, tableRow: 3, tableCol: 16, category: 'nonmetal',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 17,  symbol: 'Cl', name: 'Chlorine',       period: 3, group: 17, tableRow: 3, tableCol: 17, category: 'halogen',         baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 18,  symbol: 'Ar', name: 'Argon',          period: 3, group: 18, tableRow: 3, tableCol: 18, category: 'noble-gas',       baseRate: null,  unlockCost: null,      drillCostBase: null },

  // ── Period 4 ──────────────────────────────────────────
  { atomicNumber: 19,  symbol: 'K',  name: 'Potassium',      period: 4, group: 1,  tableRow: 4, tableCol: 1,  category: 'alkali-metal',    baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 20,  symbol: 'Ca', name: 'Calcium',        period: 4, group: 2,  tableRow: 4, tableCol: 2,  category: 'alkaline-earth',  baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 21,  symbol: 'Sc', name: 'Scandium',       period: 4, group: 3,  tableRow: 4, tableCol: 3,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 22,  symbol: 'Ti', name: 'Titanium',       period: 4, group: 4,  tableRow: 4, tableCol: 4,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 23,  symbol: 'V',  name: 'Vanadium',       period: 4, group: 5,  tableRow: 4, tableCol: 5,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 24,  symbol: 'Cr', name: 'Chromium',       period: 4, group: 6,  tableRow: 4, tableCol: 6,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 25,  symbol: 'Mn', name: 'Manganese',      period: 4, group: 7,  tableRow: 4, tableCol: 7,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 26,  symbol: 'Fe', name: 'Iron',           period: 4, group: 8,  tableRow: 4, tableCol: 8,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 27,  symbol: 'Co', name: 'Cobalt',         period: 4, group: 9,  tableRow: 4, tableCol: 9,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 28,  symbol: 'Ni', name: 'Nickel',         period: 4, group: 10, tableRow: 4, tableCol: 10, category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 29,  symbol: 'Cu', name: 'Copper',         period: 4, group: 11, tableRow: 4, tableCol: 11, category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 30,  symbol: 'Zn', name: 'Zinc',           period: 4, group: 12, tableRow: 4, tableCol: 12, category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 31,  symbol: 'Ga', name: 'Gallium',        period: 4, group: 13, tableRow: 4, tableCol: 13, category: 'post-transition', baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 32,  symbol: 'Ge', name: 'Germanium',      period: 4, group: 14, tableRow: 4, tableCol: 14, category: 'metalloid',       baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 33,  symbol: 'As', name: 'Arsenic',        period: 4, group: 15, tableRow: 4, tableCol: 15, category: 'metalloid',       baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 34,  symbol: 'Se', name: 'Selenium',       period: 4, group: 16, tableRow: 4, tableCol: 16, category: 'nonmetal',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 35,  symbol: 'Br', name: 'Bromine',        period: 4, group: 17, tableRow: 4, tableCol: 17, category: 'halogen',         baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 36,  symbol: 'Kr', name: 'Krypton',        period: 4, group: 18, tableRow: 4, tableCol: 18, category: 'noble-gas',       baseRate: null,  unlockCost: null,      drillCostBase: null },

  // ── Period 5 ──────────────────────────────────────────
  { atomicNumber: 37,  symbol: 'Rb', name: 'Rubidium',       period: 5, group: 1,  tableRow: 5, tableCol: 1,  category: 'alkali-metal',    baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 38,  symbol: 'Sr', name: 'Strontium',      period: 5, group: 2,  tableRow: 5, tableCol: 2,  category: 'alkaline-earth',  baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 39,  symbol: 'Y',  name: 'Yttrium',        period: 5, group: 3,  tableRow: 5, tableCol: 3,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 40,  symbol: 'Zr', name: 'Zirconium',      period: 5, group: 4,  tableRow: 5, tableCol: 4,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 41,  symbol: 'Nb', name: 'Niobium',        period: 5, group: 5,  tableRow: 5, tableCol: 5,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 42,  symbol: 'Mo', name: 'Molybdenum',     period: 5, group: 6,  tableRow: 5, tableCol: 6,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 43,  symbol: 'Tc', name: 'Technetium',     period: 5, group: 7,  tableRow: 5, tableCol: 7,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 44,  symbol: 'Ru', name: 'Ruthenium',      period: 5, group: 8,  tableRow: 5, tableCol: 8,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 45,  symbol: 'Rh', name: 'Rhodium',        period: 5, group: 9,  tableRow: 5, tableCol: 9,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 46,  symbol: 'Pd', name: 'Palladium',      period: 5, group: 10, tableRow: 5, tableCol: 10, category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 47,  symbol: 'Ag', name: 'Silver',         period: 5, group: 11, tableRow: 5, tableCol: 11, category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 48,  symbol: 'Cd', name: 'Cadmium',        period: 5, group: 12, tableRow: 5, tableCol: 12, category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 49,  symbol: 'In', name: 'Indium',         period: 5, group: 13, tableRow: 5, tableCol: 13, category: 'post-transition', baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 50,  symbol: 'Sn', name: 'Tin',            period: 5, group: 14, tableRow: 5, tableCol: 14, category: 'post-transition', baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 51,  symbol: 'Sb', name: 'Antimony',       period: 5, group: 15, tableRow: 5, tableCol: 15, category: 'metalloid',       baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 52,  symbol: 'Te', name: 'Tellurium',      period: 5, group: 16, tableRow: 5, tableCol: 16, category: 'metalloid',       baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 53,  symbol: 'I',  name: 'Iodine',         period: 5, group: 17, tableRow: 5, tableCol: 17, category: 'halogen',         baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 54,  symbol: 'Xe', name: 'Xenon',          period: 5, group: 18, tableRow: 5, tableCol: 18, category: 'noble-gas',       baseRate: null,  unlockCost: null,      drillCostBase: null },

  // ── Period 6 (incl. lanthanides La-Lu at tableRow 8) ──
  { atomicNumber: 55,  symbol: 'Cs', name: 'Caesium',        period: 6, group: 1,  tableRow: 6, tableCol: 1,  category: 'alkali-metal',    baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 56,  symbol: 'Ba', name: 'Barium',         period: 6, group: 2,  tableRow: 6, tableCol: 2,  category: 'alkaline-earth',  baseRate: null,  unlockCost: null,      drillCostBase: null },
  // 57-71: lanthanides — see below (tableRow 8)
  { atomicNumber: 72,  symbol: 'Hf', name: 'Hafnium',        period: 6, group: 4,  tableRow: 6, tableCol: 4,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 73,  symbol: 'Ta', name: 'Tantalum',       period: 6, group: 5,  tableRow: 6, tableCol: 5,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 74,  symbol: 'W',  name: 'Tungsten',       period: 6, group: 6,  tableRow: 6, tableCol: 6,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 75,  symbol: 'Re', name: 'Rhenium',        period: 6, group: 7,  tableRow: 6, tableCol: 7,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 76,  symbol: 'Os', name: 'Osmium',         period: 6, group: 8,  tableRow: 6, tableCol: 8,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 77,  symbol: 'Ir', name: 'Iridium',        period: 6, group: 9,  tableRow: 6, tableCol: 9,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 78,  symbol: 'Pt', name: 'Platinum',       period: 6, group: 10, tableRow: 6, tableCol: 10, category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 79,  symbol: 'Au', name: 'Gold',           period: 6, group: 11, tableRow: 6, tableCol: 11, category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 80,  symbol: 'Hg', name: 'Mercury',        period: 6, group: 12, tableRow: 6, tableCol: 12, category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 81,  symbol: 'Tl', name: 'Thallium',       period: 6, group: 13, tableRow: 6, tableCol: 13, category: 'post-transition', baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 82,  symbol: 'Pb', name: 'Lead',           period: 6, group: 14, tableRow: 6, tableCol: 14, category: 'post-transition', baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 83,  symbol: 'Bi', name: 'Bismuth',        period: 6, group: 15, tableRow: 6, tableCol: 15, category: 'post-transition', baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 84,  symbol: 'Po', name: 'Polonium',       period: 6, group: 16, tableRow: 6, tableCol: 16, category: 'post-transition', baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 85,  symbol: 'At', name: 'Astatine',       period: 6, group: 17, tableRow: 6, tableCol: 17, category: 'halogen',         baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 86,  symbol: 'Rn', name: 'Radon',          period: 6, group: 18, tableRow: 6, tableCol: 18, category: 'noble-gas',       baseRate: null,  unlockCost: null,      drillCostBase: null },

  // ── Period 7 (incl. actinides Ac-Lr at tableRow 9) ───
  { atomicNumber: 87,  symbol: 'Fr', name: 'Francium',       period: 7, group: 1,  tableRow: 7, tableCol: 1,  category: 'alkali-metal',    baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 88,  symbol: 'Ra', name: 'Radium',         period: 7, group: 2,  tableRow: 7, tableCol: 2,  category: 'alkaline-earth',  baseRate: null,  unlockCost: null,      drillCostBase: null },
  // 89-103: actinides — see below (tableRow 9)
  { atomicNumber: 104, symbol: 'Rf', name: 'Rutherfordium',  period: 7, group: 4,  tableRow: 7, tableCol: 4,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 105, symbol: 'Db', name: 'Dubnium',        period: 7, group: 5,  tableRow: 7, tableCol: 5,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 106, symbol: 'Sg', name: 'Seaborgium',     period: 7, group: 6,  tableRow: 7, tableCol: 6,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 107, symbol: 'Bh', name: 'Bohrium',        period: 7, group: 7,  tableRow: 7, tableCol: 7,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 108, symbol: 'Hs', name: 'Hassium',        period: 7, group: 8,  tableRow: 7, tableCol: 8,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 109, symbol: 'Mt', name: 'Meitnerium',     period: 7, group: 9,  tableRow: 7, tableCol: 9,  category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 110, symbol: 'Ds', name: 'Darmstadtium',   period: 7, group: 10, tableRow: 7, tableCol: 10, category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 111, symbol: 'Rg', name: 'Roentgenium',    period: 7, group: 11, tableRow: 7, tableCol: 11, category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 112, symbol: 'Cn', name: 'Copernicium',    period: 7, group: 12, tableRow: 7, tableCol: 12, category: 'transition-metal', baseRate: null, unlockCost: null,      drillCostBase: null },
  { atomicNumber: 113, symbol: 'Nh', name: 'Nihonium',       period: 7, group: 13, tableRow: 7, tableCol: 13, category: 'post-transition', baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 114, symbol: 'Fl', name: 'Flerovium',      period: 7, group: 14, tableRow: 7, tableCol: 14, category: 'post-transition', baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 115, symbol: 'Mc', name: 'Moscovium',      period: 7, group: 15, tableRow: 7, tableCol: 15, category: 'post-transition', baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 116, symbol: 'Lv', name: 'Livermorium',    period: 7, group: 16, tableRow: 7, tableCol: 16, category: 'post-transition', baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 117, symbol: 'Ts', name: 'Tennessine',     period: 7, group: 17, tableRow: 7, tableCol: 17, category: 'halogen',         baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 118, symbol: 'Og', name: 'Oganesson',      period: 7, group: 18, tableRow: 7, tableCol: 18, category: 'noble-gas',       baseRate: null,  unlockCost: null,      drillCostBase: null },

  // ── Lanthanides (Period 6, table row 8, cols 3-17) ────
  { atomicNumber: 57,  symbol: 'La', name: 'Lanthanum',      period: 6, group: null, tableRow: 8, tableCol: 3,  category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 58,  symbol: 'Ce', name: 'Cerium',         period: 6, group: null, tableRow: 8, tableCol: 4,  category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 59,  symbol: 'Pr', name: 'Praseodymium',   period: 6, group: null, tableRow: 8, tableCol: 5,  category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 60,  symbol: 'Nd', name: 'Neodymium',      period: 6, group: null, tableRow: 8, tableCol: 6,  category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 61,  symbol: 'Pm', name: 'Promethium',     period: 6, group: null, tableRow: 8, tableCol: 7,  category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 62,  symbol: 'Sm', name: 'Samarium',       period: 6, group: null, tableRow: 8, tableCol: 8,  category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 63,  symbol: 'Eu', name: 'Europium',       period: 6, group: null, tableRow: 8, tableCol: 9,  category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 64,  symbol: 'Gd', name: 'Gadolinium',     period: 6, group: null, tableRow: 8, tableCol: 10, category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 65,  symbol: 'Tb', name: 'Terbium',        period: 6, group: null, tableRow: 8, tableCol: 11, category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 66,  symbol: 'Dy', name: 'Dysprosium',     period: 6, group: null, tableRow: 8, tableCol: 12, category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 67,  symbol: 'Ho', name: 'Holmium',        period: 6, group: null, tableRow: 8, tableCol: 13, category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 68,  symbol: 'Er', name: 'Erbium',         period: 6, group: null, tableRow: 8, tableCol: 14, category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 69,  symbol: 'Tm', name: 'Thulium',        period: 6, group: null, tableRow: 8, tableCol: 15, category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 70,  symbol: 'Yb', name: 'Ytterbium',      period: 6, group: null, tableRow: 8, tableCol: 16, category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 71,  symbol: 'Lu', name: 'Lutetium',       period: 6, group: null, tableRow: 8, tableCol: 17, category: 'lanthanide',      baseRate: null,  unlockCost: null,      drillCostBase: null },

  // ── Actinides (Period 7, table row 9, cols 3-17) ──────
  { atomicNumber: 89,  symbol: 'Ac', name: 'Actinium',       period: 7, group: null, tableRow: 9, tableCol: 3,  category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 90,  symbol: 'Th', name: 'Thorium',        period: 7, group: null, tableRow: 9, tableCol: 4,  category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 91,  symbol: 'Pa', name: 'Protactinium',   period: 7, group: null, tableRow: 9, tableCol: 5,  category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 92,  symbol: 'U',  name: 'Uranium',        period: 7, group: null, tableRow: 9, tableCol: 6,  category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 93,  symbol: 'Np', name: 'Neptunium',      period: 7, group: null, tableRow: 9, tableCol: 7,  category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 94,  symbol: 'Pu', name: 'Plutonium',      period: 7, group: null, tableRow: 9, tableCol: 8,  category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 95,  symbol: 'Am', name: 'Americium',      period: 7, group: null, tableRow: 9, tableCol: 9,  category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 96,  symbol: 'Cm', name: 'Curium',         period: 7, group: null, tableRow: 9, tableCol: 10, category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 97,  symbol: 'Bk', name: 'Berkelium',      period: 7, group: null, tableRow: 9, tableCol: 11, category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 98,  symbol: 'Cf', name: 'Californium',    period: 7, group: null, tableRow: 9, tableCol: 12, category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 99,  symbol: 'Es', name: 'Einsteinium',    period: 7, group: null, tableRow: 9, tableCol: 13, category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 100, symbol: 'Fm', name: 'Fermium',        period: 7, group: null, tableRow: 9, tableCol: 14, category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 101, symbol: 'Md', name: 'Mendelevium',    period: 7, group: null, tableRow: 9, tableCol: 15, category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 102, symbol: 'No', name: 'Nobelium',       period: 7, group: null, tableRow: 9, tableCol: 16, category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
  { atomicNumber: 103, symbol: 'Lr', name: 'Lawrencium',     period: 7, group: null, tableRow: 9, tableCol: 17, category: 'actinide',        baseRate: null,  unlockCost: null,      drillCostBase: null },
];

// Fill in null values with computed defaults
ELEMENTS.forEach(el => {
  if (el.baseRate      === null) el.baseRate      = _defaultRate(el.atomicNumber);
  if (el.unlockCost    === null) el.unlockCost    = _defaultUnlockCost(el.atomicNumber);
  if (el.drillCostBase === null) el.drillCostBase = _defaultDrillCost(el.atomicNumber);

  // Apply rarity multiplier (lanthanides 8x more expensive)
  const rarity = _rarityMultiplier(el.atomicNumber);
  el.unlockCost *= rarity;
  el.drillCostBase *= rarity;
});

// Lookup map by atomic number for O(1) access
const ELEMENT_BY_NUMBER = Object.fromEntries(
  ELEMENTS.map(el => [el.atomicNumber, el])
);

// Sorted by atomic number (the chain order)
const ELEMENTS_SORTED = [...ELEMENTS].sort((a, b) => a.atomicNumber - b.atomicNumber);
