// ============================================================
// PERIODIC(TABLE) MINER — General UI Manager
// ============================================================
// DESIGN:
//   UI.render()  — full rebuild (on init / prestige)
//   UI.update()  — fast per-frame refresh (numbers, affordability)
//
//   Chain Panel (left):
//     Shows every unlocked element as a row with:
//       - symbol chip, name, production rate
//       - current stockpile amount
//       - Buy Drill button (disabled if can't afford)
//
//   Upgrades Panel (right):
//     Shows available upgrades (from UpgradeEngine.available())
//     and purchased upgrades filtered by active tab.
//
//   Header:
//     - Proton count (noble gas currency)
//     - Current period progress
//     - Total elements unlocked
//
//   Modal:
//     openElementModal(atomicNumber) — detail view for a cell click
//     closeModal()
//
//   Number formatting:
//     formatNum() — K/M/B/T suffixes for large idle numbers
//
//   TODO: per-frame particle / floating-number effects for mining
//   TODO: discovery notification toast when new element unlocks
// ============================================================

const UI = {
  _activeTab: 'available',

  // ── Formatting helpers ────────────────────────────────
  formatNum(n) {
    if (n === undefined || n === null) return '0';
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9)  return (n / 1e9).toFixed(2)  + 'B';
    if (n >= 1e6)  return (n / 1e6).toFixed(2)  + 'M';
    if (n >= 1e3)  return (n / 1e3).toFixed(2)  + 'K';
    return Math.floor(n).toString();
  },

  formatRate(n) {
    return this.formatNum(n) + '/s';
  },

  // ── Full render (expensive, call sparingly) ───────────
  render() {
    this._renderChain();
    this._renderUpgrades();
    this._renderHeader();
    this._setupTabButtons();
  },

  // Wire tab buttons once per render (not inside _renderUpgrades to avoid accumulation)
  _setupTabButtons() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = (e) => {
        this._activeTab = e.currentTarget.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this._renderUpgrades();
      };
    });
  },

  // ── Per-frame update (cheap) ──────────────────────────
  update() {
    this._updateChain();
    this._updateHeader();
    this._updateUpgradeAffordability();
    GameLoop._updatePrestigeButton();
    this._drainDiscoveryQueue();
  },

  _drainDiscoveryQueue() {
    while (ResourceEngine._newlyUnlocked.length > 0) {
      this._showDiscoveryToast(ResourceEngine._newlyUnlocked.shift());
    }
  },

  // ── Chain Panel ───────────────────────────────────────
  _renderChain() {
    const list = document.getElementById('chain-list');
    list.innerHTML = '';

    ELEMENTS_SORTED.forEach(el => {
      const s = ResourceEngine.state[el.atomicNumber];
      if (!s || !s.unlocked) return;

      const row = document.createElement('div');
      row.className = 'chain-row';
      row.dataset.atomicNumber = el.atomicNumber;

      const payerNum   = drillPayerNumber(el.atomicNumber);
      const payer      = ELEMENT_BY_NUMBER[payerNum];
      const payerState = ResourceEngine.state[payerNum];
      const canBuy     = payer !== undefined;
      const costStr    = canBuy ? this.formatNum(ResourceEngine.drillCost(el.atomicNumber)) : '';
      const prevSymbol = payer ? payer.symbol : '';

      row.innerHTML = `
        <div class="chain-symbol" style="background:var(--bg-deep);color:var(--text)">${el.symbol}</div>
        <div class="chain-info">
          <div class="chain-name">${el.name}</div>
          <div class="chain-rate">${this.formatRate(el.baseRate * s.drills * UpgradeEngine.productionMultiplier(el.atomicNumber))}</div>
        </div>
        <div class="chain-count">${this.formatNum(s.amount)}</div>
        ${canBuy
          ? `<button class="btn-buy-drill" data-atomic="${el.atomicNumber}">
               Drill<br><small>${costStr} ${prevSymbol}</small>
             </button>`
          : ''}
      `;

      list.appendChild(row);
    });

    // Wire up drill buy buttons
    list.querySelectorAll('.btn-buy-drill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const n = parseInt(e.currentTarget.dataset.atomic, 10);
        if (ResourceEngine.buyDrill(n)) this._renderChain();
      });
    });
  },

  _updateChain() {
    const list = document.getElementById('chain-list');

    // If an element just unlocked, we need a full re-render
    const unlockedCount = ELEMENTS_SORTED.filter(
      el => ResourceEngine.state[el.atomicNumber]?.unlocked
    ).length;
    const renderedCount = list.querySelectorAll('.chain-row').length;
    if (unlockedCount !== renderedCount) {
      this._renderChain();
      return;
    }

    // Otherwise just update numbers
    list.querySelectorAll('.chain-row').forEach(row => {
      const n   = parseInt(row.dataset.atomicNumber, 10);
      const el  = ELEMENT_BY_NUMBER[n];
      const s   = ResourceEngine.state[n];
      if (!s) return;

      const rateEl  = row.querySelector('.chain-rate');
      const countEl = row.querySelector('.chain-count');
      const buyBtn  = row.querySelector('.btn-buy-drill');

      if (rateEl) {
        const rate = el.baseRate * s.drills * UpgradeEngine.productionMultiplier(n);
        rateEl.textContent = this.formatRate(rate);
      }
      if (countEl) {
        countEl.textContent = this.formatNum(s.amount);
      }
      if (buyBtn) {
        const payerNum   = drillPayerNumber(n);
        const cost       = ResourceEngine.drillCost(n);
        const payerState = ResourceEngine.state[payerNum];
        const prevSymbol = ELEMENT_BY_NUMBER[payerNum]?.symbol ?? '';
        buyBtn.disabled  = !payerState?.unlocked || payerState.amount < cost;
        buyBtn.innerHTML = `Drill<br><small>${this.formatNum(cost)} ${prevSymbol}</small>`;
      }
    });
  },

  // ── Upgrades Panel ────────────────────────────────────
  _renderUpgrades() {
    const list = document.getElementById('upgrade-list');
    list.innerHTML = '';

    const upgs = this._activeTab === 'available'
      ? UpgradeEngine.available()
      : UpgradeEngine.UPGRADES.filter(u => UpgradeEngine.isPurchased(u.id));

    if (upgs.length === 0) {
      list.innerHTML = `<p class="text-muted" style="font-size:0.7rem;padding:0.5rem">
        ${this._activeTab === 'available' ? 'No upgrades available yet.' : 'None purchased yet.'}
      </p>`;
      return;
    }

    upgs.forEach(upg => {
      const card = document.createElement('div');
      const purchased = UpgradeEngine.isPurchased(upg.id);
      const affordable = UpgradeEngine.canAfford(upg.id);
      card.className = `upgrade-card${purchased ? ' purchased' : ''}${!affordable && !purchased ? ' unaffordable' : ''}`;
      card.dataset.upgradeId = upg.id;

      card.innerHTML = `
        <div class="upg-title">${upg.name}</div>
        <div class="upg-desc">${upg.desc}</div>
        <div class="upg-cost">${purchased ? '✓ Purchased' : `${this.formatNum(upg.cost)} Protons`}</div>
      `;

      if (!purchased) {
        card.addEventListener('click', () => {
          if (UpgradeEngine.purchase(upg.id)) {
            this._renderUpgrades();
            this._renderHeader();
          }
        });
      }

      list.appendChild(card);
    });
  },

  _updateUpgradeAffordability() {
    if (this._activeTab !== 'available') return;
    document.querySelectorAll('.upgrade-card:not(.purchased)').forEach(card => {
      const id = card.dataset.upgradeId;
      card.classList.toggle('unaffordable', !UpgradeEngine.canAfford(id));
    });
  },

  // ── Header ────────────────────────────────────────────
  _renderHeader() {
    this._updateHeader();
  },

  _updateHeader() {
    document.getElementById('stat-protons').textContent =
      `Protons: ${this.formatNum(UpgradeEngine.protons)}`;

    const unlocked = ELEMENTS_SORTED.filter(
      el => ResourceEngine.state[el.atomicNumber]?.unlocked
    ).length;
    document.getElementById('stat-total-elements').textContent =
      `Elements Unlocked: ${unlocked} / ${ELEMENTS.length}`;

    // Current period = highest period with any unlocked element
    const maxPeriod = ELEMENTS_SORTED
      .filter(el => ResourceEngine.state[el.atomicNumber]?.unlocked)
      .reduce((max, el) => Math.max(max, el.period), 1);
    document.getElementById('stat-rank').textContent = `Period: ${maxPeriod}`;
  },

  // ── Element Modal ─────────────────────────────────────
  openElementModal(atomicNumber) {
    const el = ELEMENT_BY_NUMBER[atomicNumber];
    const s  = ResourceEngine.state[atomicNumber];
    if (!el || !s) return;

    const content    = document.getElementById('modal-content');
    const mult       = UpgradeEngine.productionMultiplier(atomicNumber);
    const effRate    = el.baseRate * mult;
    const payerNum   = drillPayerNumber(atomicNumber);
    const payer      = ELEMENT_BY_NUMBER[payerNum];
    const payerState = ResourceEngine.state[payerNum];
    const drillCost  = ResourceEngine.drillCost(atomicNumber);
    const canAfford  = payerState?.unlocked && payerState.amount >= drillCost;

    content.innerHTML = `
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
        <div style="font-size:3rem;font-weight:bold;color:var(--accent)">${el.symbol}</div>
        <div>
          <div style="font-size:1.1rem">${el.name}</div>
          <div class="text-muted" style="font-size:0.75rem">
            #${el.atomicNumber} · Period ${el.period}${el.group ? ' · Group ' + el.group : ''} · ${el.category.replace(/-/g,' ')}
          </div>
        </div>
      </div>
      <table style="width:100%;font-size:0.75rem;border-collapse:collapse">
        <tr><td class="text-muted">Status</td><td>${s.unlocked ? '<span class="text-accent">Unlocked</span>' : 'Locked'}</td></tr>
        <tr><td class="text-muted">Stockpile</td><td>${this.formatNum(s.amount)}</td></tr>
        <tr><td class="text-muted">Drills</td><td>${s.drills}</td></tr>
        <tr><td class="text-muted">Base rate</td><td>${this.formatRate(el.baseRate)}</td></tr>
        <tr><td class="text-muted">Eff. rate</td><td>${this.formatRate(effRate * s.drills)}</td></tr>
        ${atomicNumber > 1 ? `
        <tr><td class="text-muted">Unlock cost</td><td>${this.formatNum(el.unlockCost)} ${ELEMENT_BY_NUMBER[atomicNumber-1].symbol}</td></tr>
        ` : ''}
        ${payer ? `
        <tr><td class="text-muted">Next drill cost</td><td>${this.formatNum(drillCost)} ${payer.symbol}</td></tr>
        ` : ''}
      </table>
      ${s.unlocked && payer ? `
        <button class="btn-buy-drill" style="margin-top:1rem;width:100%;padding:6px"
          ${canAfford ? '' : 'disabled'}
          onclick="ResourceEngine.buyDrill(${atomicNumber}); UI.closeModal(); UI.render()">
          Buy Drill (${this.formatNum(drillCost)} ${payer.symbol})
        </button>` : ''}
    `;

    document.getElementById('modal-overlay').classList.remove('hidden');
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  },

  // ── Discovery Toast ───────────────────────────────────
  _showDiscoveryToast(atomicNumber) {
    const el   = ELEMENT_BY_NUMBER[atomicNumber];
    const fact = getElementFact(atomicNumber);
    if (!el) return;

    const container = document.getElementById('toast-container');

    // Cap visible toasts at 3 — remove oldest if needed
    while (container.children.length >= 3) {
      container.removeChild(container.lastChild);
    }

    const toast = document.createElement('div');
    toast.className = 'discovery-toast';

    // Use the element's category CSS variable for the symbol colour
    toast.innerHTML = `
      <div class="toast-symbol" style="color:var(--accent)">${el.symbol}</div>
      <div class="toast-body">
        <div class="toast-header">Discovered: ${el.name} (#${el.atomicNumber})</div>
        <div class="toast-fact">${fact}</div>
      </div>
    `;

    // Dismiss on click
    toast.addEventListener('click', () => this._dismissToast(toast));

    container.prepend(toast);

    // Auto-dismiss after 7 seconds
    setTimeout(() => this._dismissToast(toast), 7000);
  },

  _dismissToast(toast) {
    if (!toast.parentNode) return;
    toast.classList.add('toast-out');
    setTimeout(() => toast.parentNode?.removeChild(toast), 400);
  },
};
