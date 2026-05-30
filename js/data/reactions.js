// ============================================================
// PERIOD MINER — Chemical Reactions Data
// ============================================================
// When reagent thresholds are met, a reaction fires automatically:
//   - reagents are consumed from stockpiles
//   - protonReward Protons are granted
//   - permaBoost (if any) is permanently applied to production
//
// permaBoost types:
//   { type: 'element', atomicNumber, factor }   — specific element ×factor
//   { type: 'period',  period,       factor }   — whole period ×factor
//   { type: 'category', category,    factor }   — element category ×factor
//   { type: 'all',                   factor }   — all elements ×factor
// ============================================================

const REACTIONS = [
  // ── Period 1-2 ─────────────────────────────────────────
  {
    id:           'water',
    formula:      'H₂O',
    name:         'Water',
    flavour:      'Two hydrogens, one oxygen — the molecule that makes life possible on Earth.',
    reagents:     [{ atomicNumber: 1, amount: 500 }, { atomicNumber: 8, amount: 250 }],
    protonReward: 150,
    permaBoost:   { type: 'element', atomicNumber: 1, factor: 1.25 },
  },
  {
    id:           'ammonia',
    formula:      'NH₃',
    name:         'Ammonia',
    flavour:      'The Haber-Bosch process made ammonia at scale — and now feeds roughly half the world\'s population.',
    reagents:     [{ atomicNumber: 7, amount: 300 }, { atomicNumber: 1, amount: 900 }],
    protonReward: 200,
    permaBoost:   { type: 'element', atomicNumber: 7, factor: 1.3 },
  },
  {
    id:           'methane',
    formula:      'CH₄',
    name:         'Methane',
    flavour:      'The simplest hydrocarbon. Natural gas is mostly methane, formed over millions of years from ancient organisms.',
    reagents:     [{ atomicNumber: 6, amount: 200 }, { atomicNumber: 1, amount: 800 }],
    protonReward: 175,
    permaBoost:   { type: 'element', atomicNumber: 6, factor: 1.25 },
  },
  {
    id:           'co2',
    formula:      'CO₂',
    name:         'Carbon Dioxide',
    flavour:      'Plants breathe it in. We breathe it out. And right now there\'s more of it in the atmosphere than at any point in the last 3 million years.',
    reagents:     [{ atomicNumber: 6, amount: 300 }, { atomicNumber: 8, amount: 600 }],
    protonReward: 250,
    permaBoost:   { type: 'period', period: 2, factor: 1.2 },
  },

  // ── Period 3 ──────────────────────────────────────────
  {
    id:           'hcl',
    formula:      'HCl',
    name:         'Hydrochloric Acid',
    flavour:      'Your stomach produces it to digest food. Concentrated, it dissolves most metals.',
    reagents:     [{ atomicNumber: 1, amount: 1000 }, { atomicNumber: 17, amount: 500 }],
    protonReward: 220,
    permaBoost:   { type: 'element', atomicNumber: 17, factor: 1.3 },
  },
  {
    id:           'salt',
    formula:      'NaCl',
    name:         'Table Salt',
    flavour:      'Roman soldiers were sometimes paid in salt — the origin of the word "salary". An ionic lattice so stable it survives cooking.',
    reagents:     [{ atomicNumber: 11, amount: 800 }, { atomicNumber: 17, amount: 800 }],
    protonReward: 350,
    permaBoost:   { type: 'period', period: 3, factor: 1.25 },
  },
  {
    id:           'h2s',
    formula:      'H₂S',
    name:         'Hydrogen Sulfide',
    flavour:      'The rotten-egg smell of volcanic vents. Some deep-sea ecosystems run entirely on hydrogen sulfide rather than sunlight.',
    reagents:     [{ atomicNumber: 1, amount: 800 }, { atomicNumber: 16, amount: 400 }],
    protonReward: 180,
    permaBoost:   { type: 'element', atomicNumber: 16, factor: 1.25 },
  },

  // ── Period 3-4 ────────────────────────────────────────
  {
    id:           'h2o2',
    formula:      'H₂O₂',
    name:         'Hydrogen Peroxide',
    flavour:      'Pure hydrogen peroxide is so reactive it can spontaneously combust. The 3% solution in your medicine cabinet is another matter.',
    reagents:     [{ atomicNumber: 1, amount: 1200 }, { atomicNumber: 8, amount: 600 }],
    protonReward: 300,
    permaBoost:   { type: 'element', atomicNumber: 8, factor: 1.3 },
  },
  {
    id:           'h2so4',
    formula:      'H₂SO₄',
    name:         'Sulfuric Acid',
    flavour:      'The most produced industrial chemical on Earth. Over 200 million tonnes made annually — a direct indicator of a nation\'s industrial output.',
    reagents:     [{ atomicNumber: 1, amount: 600 }, { atomicNumber: 16, amount: 300 }, { atomicNumber: 8, amount: 1200 }],
    protonReward: 600,
    permaBoost:   { type: 'all', factor: 1.1 },
  },

  // ── Period 4 ──────────────────────────────────────────
  {
    id:           'iron-oxide',
    formula:      'Fe₂O₃',
    name:         'Iron Oxide (Rust)',
    flavour:      'The surface of Mars is red because of iron oxide dust. Iron has been rusting across the solar system for billions of years.',
    reagents:     [{ atomicNumber: 26, amount: 2000 }, { atomicNumber: 8, amount: 1500 }],
    protonReward: 500,
    permaBoost:   { type: 'element', atomicNumber: 26, factor: 1.4 },
  },
  {
    id:           'copper-oxide',
    formula:      'CuO',
    name:         'Copper Oxide',
    flavour:      'The green patina on old copper is mostly copper oxide and carbonate — the Statue of Liberty gets its colour this way.',
    reagents:     [{ atomicNumber: 29, amount: 1500 }, { atomicNumber: 8, amount: 750 }],
    protonReward: 450,
    permaBoost:   { type: 'category', category: 'transition-metal', factor: 1.2 },
  },
  {
    id:           'bronze',
    formula:      'Cu+Sn',
    name:         'Bronze',
    flavour:      'The Bronze Age began when humans discovered that a small amount of tin transformed soft copper into a hard, workable alloy. Civilisation changed overnight.',
    reagents:     [{ atomicNumber: 29, amount: 3000 }, { atomicNumber: 50, amount: 1000 }],
    protonReward: 800,
    permaBoost:   { type: 'period', period: 5, factor: 1.3 },
  },
];
