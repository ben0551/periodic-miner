// ============================================================
// PERIODIC(TABLE) MINER — Upgrade / Research Engine
// ============================================================
// DESIGN:
//   Upgrades are bought with Protons (the noble-gas currency).
//   Each upgrade has:
//     id         — unique string
//     name       — display name
//     desc       — flavour description
//     cost       — Proton cost
//     effect     — what the upgrade does (type + params)
//     requires   — array of upgrade IDs that must be purchased first
//     purchased  — runtime flag
//
//   Effect types:
//     { type: 'multiply', target: atomicNumber|'all'|'period:N', factor: X }
//       → multiplies production rate of target elements by X
//     { type: 'drill-discount', target, factor: X }
//       → multiplies drill purchase cost by X (e.g., 0.8 = 20% off)
//     { type: 'unlock-cost', target, factor: X }
//       → reduces the unlock cost threshold for an element
//     { type: 'prestige-bonus', factor: X }
//       → adds to the permanent prestige multiplier
//
//   Prestige bonuses:
//     Each Nobel Prize reset accumulates a permanent multiplier stored
//     in prestigeMultiplier. This is NOT reset on prestige.
//
//   TODO: Add more upgrade definitions — this is a starter set.
//   TODO: Implement tech tree visual in the UI panel.
// ============================================================

const UpgradeEngine = {
  protons:           0,
  prestigeMultiplier: 1.0,  // permanent, survives resets
  _purchased:        new Set(),

  // ── Upgrade definitions ───────────────────────────────
  // Expand this array to add more upgrades.
  UPGRADES: [
    {
      id: 'h-drill-1',
      name: 'Pneumatic Drill',
      desc: 'Hydrogen mining +50%.',
      cost: 10,
      effect: { type: 'multiply', target: 1, factor: 1.5 },
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
      id: 'period1-boost',
      name: 'Fusion Catalyst',
      desc: 'All Period 1 elements ×3.',
      cost: 200,
      effect: { type: 'multiply', target: 'period:1', factor: 3 },
      requires: ['h-drill-2'],
    },
    {
      id: 'drill-discount-1',
      name: 'Bulk Order',
      desc: 'Drill costs -20% across the board.',
      cost: 100,
      effect: { type: 'drill-discount', target: 'all', factor: 0.8 },
      requires: [],
    },
    {
      id: 'offline-1',
      name: 'Autonomous Mining Protocol',
      desc: 'Offline time cap +4 hours.',
      cost: 500,
      // TODO: hook into MAX_OFFLINE_SECONDS in resources.js
      effect: { type: 'offline-hours', bonus: 4 },
      requires: [],
    },
    {
      id: 'prestige-1',
      name: 'Nobel Legacy',
      desc: 'Each prestige reset grants +10% permanent production.',
      cost: 1000,
      effect: { type: 'prestige-bonus', factor: 0.10 },
      requires: ['period1-boost'],
    },
    // TODO: add upgrades for periods 2-7, transition metal boosts,
    //       lanthanide/actinide special mechanics, etc.
  ],

  init() {
    this._purchased.clear();
    this.protons = 0;
  },

  // ── Multiplier query (called by ResourceEngine.tick) ──
  productionMultiplier(atomicNumber) {
    const el = ELEMENT_BY_NUMBER[atomicNumber];
    let m = this.prestigeMultiplier;

    for (const upg of this.UPGRADES) {
      if (!this._purchased.has(upg.id)) continue;
      const fx = upg.effect;
      if (fx.type !== 'multiply') continue;

      if (fx.target === 'all') {
        m *= fx.factor;
      } else if (fx.target === atomicNumber) {
        m *= fx.factor;
      } else if (typeof fx.target === 'string' && fx.target.startsWith('period:')) {
        const p = parseInt(fx.target.split(':')[1], 10);
        if (el.period === p) m *= fx.factor;
      }
    }
    return m;
  },

  // Drill cost multiplier (from drill-discount upgrades)
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
    return this.protons >= upg.cost;
  },

  purchase(upgradeId) {
    if (!this.canAfford(upgradeId)) return false;
    const upg = this.UPGRADES.find(u => u.id === upgradeId);
    this.protons -= upg.cost;
    this._purchased.add(upgradeId);
    return true;
  },

  isPurchased(upgradeId) {
    return this._purchased.has(upgradeId);
  },

  // Available = requires met + not yet purchased
  available() {
    return this.UPGRADES.filter(u =>
      !this._purchased.has(u.id) &&
      u.requires.every(r => this._purchased.has(r))
    );
  },

  // ── Prestige hook ─────────────────────────────────────
  onPrestige(period) {
    const bonusUpgrades = this.UPGRADES.filter(
      u => this._purchased.has(u.id) && u.effect.type === 'prestige-bonus'
    );
    for (const upg of bonusUpgrades) {
      this.prestigeMultiplier += upg.effect.factor;
    }
  },

  // ── Serialization ─────────────────────────────────────
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
