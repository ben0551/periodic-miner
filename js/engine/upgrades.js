// ============================================================
// PERIOD MINER — Upgrade / Research Engine
// ============================================================
// Effect types:
//   multiply      — { target: atomicNumber|'all'|'period:N'|'category:X', factor }
//   noble-boost   — { target: atomicNumber|'all', factor } — scales Proton generation
//   drill-discount — { factor } — multiplies all drill costs
//   offline-hours — { bonus } — adds hours to offline cap
//   prestige-bonus — { factor } — adds to permanent prestigeMultiplier
//
// elementCost (optional) — array of { atomicNumber, amount }
//   deducted from element stockpiles on purchase.
// ============================================================

const UpgradeEngine = {
  protons:            0,
  prestigeMultiplier: 1.0,
  _purchased:         new Set(),
  _temporaryBoost:    { factor: 1, expiresAt: 0 },

  UPGRADES: [
    // ── Period 1 ──────────────────────────────────────────
    {
      id: 'h-drill-1',
      name: 'Pneumatic Drill',
      desc: 'Hydrogen mining +50%.',
      cost: 10,
      effect: { type: 'multiply', target: 1, factor: 1.5 },
      requires: [],
    },
    {
      id: 'he-tap',
      name: 'Noble Gas Tap',
      desc: 'Helium Proton generation ×2.',
      cost: 15,
      effect: { type: 'noble-boost', target: 2, factor: 2 },
      requires: [],
    },
    {
      id: 'h-drill-2',
      name: 'Diamond Bit',
      desc: 'Hydrogen mining ×2.',
      cost: 50,
      effect: { type: 'multiply', target: 1, factor: 2 },
      requires: ['h-drill-1'],
    },
    {
      id: 'drill-discount-1',
      name: 'Bulk Order',
      desc: 'All drill costs -20%.',
      cost: 100,
      effect: { type: 'drill-discount', factor: 0.8 },
      requires: [],
    },
    {
      id: 'period1-boost',
      name: 'Fusion Catalyst',
      desc: 'All Period 1 elements ×3.',
      cost: 200,
      effect: { type: 'multiply', target: 'period:1', factor: 3 },
      requires: ['h-drill-2'],
    },

    // ── Period 2 (element costs unlock naturally) ─────────
    {
      id: 'water-synthesis',
      name: 'Water Synthesis',
      desc: 'H₂O compound boosts hydrogen output ×3.',
      cost: 50,
      elementCost: [{ atomicNumber: 1, amount: 500 }, { atomicNumber: 8, amount: 250 }],
      effect: { type: 'multiply', target: 1, factor: 3 },
      requires: [],
    },
    {
      id: 'nitrogen-coolant',
      name: 'Liquid N₂ Coolant',
      desc: 'Cool the drills — Period 2 production ×2.',
      cost: 100,
      elementCost: [{ atomicNumber: 7, amount: 800 }, { atomicNumber: 8, amount: 400 }],
      effect: { type: 'multiply', target: 'period:2', factor: 2 },
      requires: [],
    },
    {
      id: 'carbon-tools',
      name: 'Carbon Drill Tips',
      desc: 'Carbon-reinforced drills — all mining ×1.5.',
      cost: 75,
      elementCost: [{ atomicNumber: 6, amount: 1000 }],
      effect: { type: 'multiply', target: 'all', factor: 1.5 },
      requires: [],
    },
    {
      id: 'ne-array',
      name: 'Neon Array',
      desc: 'Neon discharge amplifier — Ne Proton rate ×3.',
      cost: 75,
      elementCost: [{ atomicNumber: 10, amount: 100 }],
      effect: { type: 'noble-boost', target: 10, factor: 3 },
      requires: ['he-tap'],
    },

    // ── Period 3 ──────────────────────────────────────────
    {
      id: 'salt-crystal',
      name: 'Salt Crystal Matrix',
      desc: 'NaCl lattice resonance — Period 3 production ×2.',
      cost: 100,
      elementCost: [{ atomicNumber: 11, amount: 500 }, { atomicNumber: 17, amount: 500 }],
      effect: { type: 'multiply', target: 'period:3', factor: 2 },
      requires: [],
    },
    {
      id: 'silicon-chip',
      name: 'Silicon Processor',
      desc: 'AI mining upgrade — all noble gas Proton yield ×2.',
      cost: 150,
      elementCost: [{ atomicNumber: 14, amount: 2000 }, { atomicNumber: 8, amount: 500 }],
      effect: { type: 'noble-boost', target: 'all', factor: 2 },
      requires: ['ne-array'],
    },
    {
      id: 'argon-shield',
      name: 'Argon Shielding',
      desc: 'Protect drill mechanisms — drill costs -15% additional.',
      cost: 120,
      elementCost: [{ atomicNumber: 18, amount: 200 }],
      effect: { type: 'drill-discount', factor: 0.85 },
      requires: ['drill-discount-1'],
    },
    {
      id: 'sodium-boost',
      name: 'Sodium Abundance',
      desc: 'Sodium mining ×2.5.',
      cost: 50,
      elementCost: [{ atomicNumber: 11, amount: 200 }],
      effect: { type: 'multiply', target: 11, factor: 2.5 },
      requires: [],
    },
    {
      id: 'magnesium-boost',
      name: 'Magnesium Oxide Catalyst',
      desc: 'Magnesium mining ×2.',
      cost: 60,
      elementCost: [{ atomicNumber: 12, amount: 150 }],
      effect: { type: 'multiply', target: 12, factor: 2 },
      requires: [],
    },
    {
      id: 'chlorine-boost',
      name: 'Chlorine Extraction',
      desc: 'Chlorine mining ×3.',
      cost: 80,
      elementCost: [{ atomicNumber: 17, amount: 300 }],
      effect: { type: 'multiply', target: 17, factor: 3 },
      requires: [],
    },
    {
      id: 'electrochemical-catalyst',
      name: 'Electrochemical Catalyst',
      desc: 'Halogen breakthrough — all element production ×2.',
      cost: 150,
      elementCost: [{ atomicNumber: 17, amount: 500 }, { atomicNumber: 11, amount: 400 }],
      effect: { type: 'multiply', target: 'all', factor: 2 },
      requires: [],
    },

    // ── Period 4 ──────────────────────────────────────────
    {
      id: 'iron-alloy',
      name: 'Iron-Carbon Alloy',
      desc: 'Steel drill housings — transition metal production ×2.5.',
      cost: 200,
      elementCost: [{ atomicNumber: 26, amount: 5000 }, { atomicNumber: 6, amount: 2000 }],
      effect: { type: 'multiply', target: 'category:transition-metal', factor: 2.5 },
      requires: [],
    },
    {
      id: 'titanium-frame',
      name: 'Titanium Frame',
      desc: 'Lightweight drill assembly — Period 4 production ×2.',
      cost: 150,
      elementCost: [{ atomicNumber: 22, amount: 2000 }],
      effect: { type: 'multiply', target: 'period:4', factor: 2 },
      requires: [],
    },
    {
      id: 'copper-wiring',
      name: 'Copper Wiring',
      desc: 'High-conductivity motors — drill costs -25% additional.',
      cost: 100,
      elementCost: [{ atomicNumber: 29, amount: 1000 }],
      effect: { type: 'drill-discount', factor: 0.75 },
      requires: ['argon-shield'],
    },

    // ── Mid-game Proton Sinks (Period 3) ──────────────────
    {
      id: 'synthesis-catalyst',
      name: 'Element Synthesis',
      desc: 'Instantly unlock one locked element.',
      cost: 200000,
      effect: { type: 'element-unlock' },
      requires: [],
    },
    {
      id: 'production-overdrive',
      name: 'Production Overdrive',
      desc: 'All elements ×10 for 60 seconds.',
      cost: 100000,
      effect: { type: 'temporary-boost', factor: 10, duration: 60 },
      requires: [],
    },

    // ── Late game ─────────────────────────────────────────
    {
      id: 'offline-1',
      name: 'Autonomous Mining Protocol',
      desc: 'Offline production cap +4 hours.',
      cost: 500,
      effect: { type: 'offline-hours', bonus: 4 },
      requires: [],
    },
    {
      id: 'co2-scrubbing',
      name: 'CO₂ Carbon Capture',
      desc: 'Extended autonomous mining — offline cap +8 hours.',
      cost: 200,
      elementCost: [{ atomicNumber: 6, amount: 1000 }, { atomicNumber: 8, amount: 2000 }],
      effect: { type: 'offline-hours', bonus: 8 },
      requires: ['offline-1'],
    },
    {
      id: 'prestige-1',
      name: 'Nobel Legacy',
      desc: 'Each Nobel Prize reset grants +10% permanent production.',
      cost: 1000,
      effect: { type: 'prestige-bonus', factor: 0.10 },
      requires: ['period1-boost'],
    },
    {
      id: 'quantum-tunneling',
      name: 'Quantum Tunneling',
      desc: 'Subatomic shortcuts — all production ×2.',
      cost: 5000,
      elementCost: [{ atomicNumber: 1, amount: 100000 }, { atomicNumber: 26, amount: 50000 }],
      effect: { type: 'multiply', target: 'all', factor: 2 },
      requires: ['prestige-1'],
    },
  ],

  init() {
    this._purchased.clear();
    this.protons = 0;
  },

  // ── Multiplier queries ────────────────────────────────
  productionMultiplier(atomicNumber) {
    const el = ELEMENT_BY_NUMBER[atomicNumber];
    let m = this.prestigeMultiplier;

    // Group bonus: ×1.2 per completed group (column)
    if (el.group !== null) {
      m *= ResourceEngine.getGroupBonus();
    }

    for (const upg of this.UPGRADES) {
      if (!this._purchased.has(upg.id)) continue;
      const fx = upg.effect;
      if (fx.type !== 'multiply') continue;

      if (fx.target === 'all') {
        m *= fx.factor;
      } else if (fx.target === atomicNumber) {
        m *= fx.factor;
      } else if (typeof fx.target === 'string' && fx.target.startsWith('period:')) {
        if (el.period === parseInt(fx.target.split(':')[1], 10)) m *= fx.factor;
      } else if (typeof fx.target === 'string' && fx.target.startsWith('category:')) {
        if (el.category === fx.target.split(':')[1]) m *= fx.factor;
      }
    }
    // Reaction permanent boosts stack on top
    m *= ReactionEngine.productionMultiplier(atomicNumber);
    // Temporary boosts (from Production Overdrive, etc.)
    if (Date.now() < this._temporaryBoost.expiresAt) {
      m *= this._temporaryBoost.factor;
    }
    return m;
  },

  nobleGasProtonMultiplier(atomicNumber) {
    let m = 1;
    for (const upg of this.UPGRADES) {
      if (!this._purchased.has(upg.id)) continue;
      const fx = upg.effect;
      if (fx.type !== 'noble-boost') continue;
      if (fx.target === 'all' || fx.target === atomicNumber) m *= fx.factor;
    }
    return m;
  },

  drillCostMultiplier() {
    let m = 1;
    for (const upg of this.UPGRADES) {
      if (!this._purchased.has(upg.id)) continue;
      if (upg.effect.type === 'drill-discount') m *= upg.effect.factor;
    }
    return m;
  },

  // ── Purchasing ────────────────────────────────────────
  canAfford(upgradeId) {
    const upg = this.UPGRADES.find(u => u.id === upgradeId);
    if (!upg) return false;
    if (this._purchased.has(upgradeId)) return false;
    if (!upg.requires.every(r => this._purchased.has(r))) return false;
    if (this.protons < upg.cost) return false;
    if (upg.elementCost) {
      for (const ec of upg.elementCost) {
        const s = ResourceEngine.state[ec.atomicNumber];
        if (!s || s.amount < ec.amount) return false;
      }
    }
    return true;
  },

  purchase(upgradeId) {
    if (!this.canAfford(upgradeId)) return false;
    const upg = this.UPGRADES.find(u => u.id === upgradeId);
    this.protons -= upg.cost;
    if (upg.elementCost) {
      for (const ec of upg.elementCost) {
        ResourceEngine.state[ec.atomicNumber].amount -= ec.amount;
      }
    }

    // Handle special effects
    if (upg.effect.type === 'temporary-boost') {
      this._temporaryBoost = {
        factor: upg.effect.factor,
        expiresAt: Date.now() + (upg.effect.duration * 1000),
      };
      UI.showToast(`⚡ Production ×${upg.effect.factor} for ${upg.effect.duration}s!`);
    } else if (upg.effect.type === 'element-unlock') {
      // Unlock the first locked element in current period
      for (const el of ELEMENTS_SORTED) {
        if (el.period <= ResourceEngine.maxUnlockedPeriod) {
          const s = ResourceEngine.state[el.atomicNumber];
          if (!s.unlocked) {
            s.unlocked = true;
            UI.showToast(`✨ Unlocked ${el.name}!`);
            break;
          }
        }
      }
    }

    // Only mark as purchased if it's not a consumable (element-unlock can be used multiple times)
    if (upg.effect.type !== 'element-unlock') {
      this._purchased.add(upgradeId);
    }
    return true;
  },

  isPurchased(upgradeId) { return this._purchased.has(upgradeId); },

  available() {
    return this.UPGRADES.filter(u =>
      !this._purchased.has(u.id) &&
      u.requires.every(r => this._purchased.has(r))
    );
  },

  onPrestige(period) {
    // Base multiplicative bonus scales with period: ×1.5 for P1, ×2.0 for P2, ×2.5 for P3, …
    const base = 1.0 + period * 0.5;
    this.prestigeMultiplier *= base;
    // Nobel Legacy upgrade adds 15% on top
    if (this._purchased.has('prestige-1')) {
      this.prestigeMultiplier *= 1.15;
    }
  },

  serialize() {
    return {
      protons:            this.protons,
      prestigeMultiplier: this.prestigeMultiplier,
      purchased:          [...this._purchased],
    };
  },

  deserialize(saved) {
    this.protons            = saved.protons ?? 0;
    this.prestigeMultiplier = saved.prestigeMultiplier ?? 1.0;
    this._purchased         = new Set(saved.purchased ?? []);
  },
};
