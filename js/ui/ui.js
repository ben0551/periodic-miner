// ============================================================
// PERIODIC MINER — General UI Manager
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
  _lastNotifiedPrestigePeriod: 0,
  _chainRenderPending: false,

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

  // Category → display colour map (mirrors CSS --cat-color vars)
  _CATEGORY_COLORS: {
    'alkali-metal':     '#ff6b6b',
    'alkaline-earth':   '#ffa07a',
    'transition-metal': '#87ceeb',
    'post-transition':  '#98fb98',
    'metalloid':        '#dda0dd',
    'nonmetal':         '#7fffd4',
    'halogen':          '#ffd700',
    'noble-gas':        '#00d4ff',
    'lanthanide':       '#ff69b4',
    'actinide':         '#ff8c00',
  },

  // ── Per-frame update (cheap) ──────────────────────────
  update() {
    this._updateChain();
    this._updateHeader();
    if (this._activeTab === 'reactions') {
      this._updateReactions();
    } else {
      this._updateUpgradeAffordability();
    }
    GameLoop._updatePrestigeButton();
    this._checkPrestigeReady(); // notify when period is complete
    this._drainDiscoveryQueue();
    this._drainReactionQueue();
  },

  _checkPrestigeReady() {
    const period = ResourceEngine.maxUnlockedPeriod;
    if (period <= this._lastNotifiedPrestigePeriod) return;

    const periodElements = ELEMENTS_SORTED.filter(el => el.period === period);
    const allUnlocked = periodElements.every(el => ResourceEngine.state[el.atomicNumber]?.unlocked);

    if (allUnlocked) {
      this._lastNotifiedPrestigePeriod = period;
      this._showPrestigeReadyNotification(period);
    }
  },

  _showPrestigeReadyNotification(period) {
    const next = period + 1;
    const bonus = (1.0 + period * 0.5).toFixed(1);
    const msg = `Period ${period} Complete! Nobel Prize Reset available → ×${bonus} production + unlock Period ${next}`;

    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed; bottom: 70px; left: 50%; transform: translateX(-50%);
      background: var(--success); color: var(--bg-deep); padding: 0.75rem 1.5rem;
      border-radius: 6px; font-size: 0.75rem; z-index: 300;
      box-shadow: 0 0 20px rgba(68,255,136,0.4);
      animation: prestige-pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
      pointer-events: none;
    `;
    notif.textContent = msg;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 6000);
  },

  _drainDiscoveryQueue() {
    while (ResourceEngine._newlyUnlocked.length > 0) {
      this.showSplash(ResourceEngine._newlyUnlocked.shift(), true);
    }
  },

  _drainReactionQueue() {
    while (ReactionEngine._newlyFired.length > 0) {
      this._showReactionSplash(ReactionEngine._newlyFired.shift());
    }
  },

  // ── Chain Panel ───────────────────────────────────────
  _queueChainRender() {
    if (this._chainRenderPending) return;
    this._chainRenderPending = true;
    requestAnimationFrame(() => {
      this._renderChain();
      this._chainRenderPending = false;
    });
  },

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
        if (ResourceEngine.buyDrill(n)) this._queueChainRender();
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
    if (this._activeTab === 'reactions') { this._renderReactions(); return; }

    const list = document.getElementById('upgrade-list');
    list.innerHTML = '';

    let upgs = this._activeTab === 'available'
      ? UpgradeEngine.available()
      : UpgradeEngine.UPGRADES.filter(u => UpgradeEngine.isPurchased(u.id));

    // Sort available upgrades: affordable first, then by progress toward affordability
    if (this._activeTab === 'available') {
      upgs.sort((a, b) => {
        const aAffordable = UpgradeEngine.canAfford(a.id);
        const bAffordable = UpgradeEngine.canAfford(b.id);
        if (aAffordable !== bAffordable) return bAffordable ? 1 : -1;
        // Both affordable or both unaffordable: sort by progress (closest to affordable first)
        const aProgress = this._calcUpgradeProgress(a);
        const bProgress = this._calcUpgradeProgress(b);
        return bProgress - aProgress;
      });
    }

    if (upgs.length === 0) {
      list.innerHTML = `<p class="text-muted" style="font-size:0.7rem;padding:0.5rem">
        ${this._activeTab === 'available' ? 'No upgrades available yet.' : 'None purchased yet.'}
      </p>`;
      return;
    }

    upgs.forEach(upg => {
      const card      = document.createElement('div');
      const purchased = UpgradeEngine.isPurchased(upg.id);
      const affordable = UpgradeEngine.canAfford(upg.id);
      card.className  = `upgrade-card${purchased ? ' purchased' : ''}${!affordable && !purchased ? ' unaffordable' : ''}`;
      card.dataset.upgradeId = upg.id;

      const progress = purchased ? 100 : this._calcUpgradeProgress(upg);
      card.innerHTML = `
        <div class="upg-title">${upg.name}</div>
        <div class="upg-desc">${upg.desc}</div>
        <div class="upg-cost">${purchased ? '✓ Purchased' : this._formatUpgradeCost(upg)}</div>
        ${!purchased ? `<div class="upg-progress"><div class="upg-progress-fill" style="width:${progress}%"></div></div>` : ''}
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

  _calcUpgradeProgress(upg) {
    let minPct = Math.min(100, (UpgradeEngine.protons / upg.cost) * 100);
    if (upg.elementCost) {
      for (const ec of upg.elementCost) {
        const have = ResourceEngine.state[ec.atomicNumber]?.amount ?? 0;
        minPct = Math.min(minPct, Math.min(100, (have / ec.amount) * 100));
      }
    }
    return Math.floor(minPct);
  },

  _updateUpgradeAffordability() {
    if (this._activeTab === 'reactions') return;
    document.querySelectorAll('.upgrade-card:not(.purchased)').forEach(card => {
      const id  = card.dataset.upgradeId;
      const upg = UpgradeEngine.UPGRADES.find(u => u.id === id);
      card.classList.toggle('unaffordable', !UpgradeEngine.canAfford(id));
      const fill = card.querySelector('.upg-progress-fill');
      if (fill && upg) fill.style.width = this._calcUpgradeProgress(upg) + '%';
      const costEl = card.querySelector('.upg-cost');
      if (costEl && upg) costEl.innerHTML = this._formatUpgradeCost(upg);
    });
  },

  // ── Reactions Tab ─────────────────────────────────────
  _renderReactions() {
    const list = document.getElementById('upgrade-list');
    list.innerHTML = '';
    REACTIONS.forEach(rx => {
      const fired   = ReactionEngine._fired.has(rx.id);
      const canFire = !fired && ReactionEngine._canFire(rx);
      const card    = document.createElement('div');
      card.className = `reaction-card${fired ? ' rx-done' : ''}${canFire ? ' rx-ready' : ''}`;
      card.dataset.rxId = rx.id;

      const rows = rx.reagents.map(r => {
        const el   = ELEMENT_BY_NUMBER[r.atomicNumber];
        const have = Math.min(ResourceEngine.state[r.atomicNumber]?.amount ?? 0, r.amount);
        const pct  = fired ? 100 : Math.min(100, (have / r.amount) * 100);
        const met  = fired || have >= r.amount;
        return `
          <div class="rx-reagent-row">
            <span class="rx-reagent-symbol ${met ? 'met' : ''}">${el.symbol}</span>
            <div class="rx-reagent-bar"><div class="rx-reagent-fill" style="width:${pct}%"></div></div>
            <span class="rx-reagent-count ${met ? 'met' : ''}">${fired ? '✓' : `${this.formatNum(Math.floor(have))}/${this.formatNum(r.amount)}`}</span>
          </div>`;
      }).join('');

      const boostStr = rx.permaBoost ? ` · ${this._describeBoost(rx.permaBoost)}` : '';
      card.innerHTML = `
        <div class="rx-header">
          <span class="rx-formula">${rx.formula}</span>
          <span class="rx-name">${rx.name}</span>
          <span class="rx-reward">+${rx.protonReward}⚛${boostStr}</span>
        </div>
        <div class="rx-flavour">${rx.flavour}</div>
        <div class="rx-reagents">${rows}</div>
        ${fired ? '<div class="rx-status">✓ Reacted</div>' : ''}
      `;
      card.addEventListener('click', () => this._showReactionModal(rx));
      list.appendChild(card);
    });
  },

  _describeBoost(boost) {
    const f = `×${boost.factor}`;
    if (boost.type === 'all')      return `all ${f}`;
    if (boost.type === 'element')  return `${ELEMENT_BY_NUMBER[boost.atomicNumber]?.symbol} ${f}`;
    if (boost.type === 'period')   return `Period ${boost.period} ${f}`;
    if (boost.type === 'category') return `${boost.category.replace(/-/g,' ')} ${f}`;
    return '';
  },

  _updateReactions() {
    if (ReactionEngine._newlyFired.length > 0) { this._renderReactions(); return; }
    document.querySelectorAll('.reaction-card:not(.rx-done)').forEach(card => {
      const rxId = card.dataset.rxId;
      const rx   = REACTIONS.find(r => r.id === rxId);
      if (!rx) return;
      card.classList.toggle('rx-ready', ReactionEngine._canFire(rx));
      rx.reagents.forEach((r, i) => {
        const have    = Math.min(ResourceEngine.state[r.atomicNumber]?.amount ?? 0, r.amount);
        const pct     = Math.min(100, (have / r.amount) * 100);
        const met     = have >= r.amount;
        const fills   = card.querySelectorAll('.rx-reagent-fill');
        const counts  = card.querySelectorAll('.rx-reagent-count');
        const symbols = card.querySelectorAll('.rx-reagent-symbol');
        if (fills[i])   fills[i].style.width = pct + '%';
        if (counts[i])  { counts[i].textContent = `${this.formatNum(Math.floor(have))}/${this.formatNum(r.amount)}`; counts[i].classList.toggle('met', met); }
        if (symbols[i]) symbols[i].classList.toggle('met', met);
      });
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
  _showReactionModal(rx) {
    const modal = document.getElementById('modal-element');
    const content = document.getElementById('modal-content');

    let html = `<h3>${rx.name}</h3>
      <div style="margin:0.5rem 0;font-size:0.8rem">
        <div style="font-family:var(--font-mono);font-size:1rem;margin-bottom:0.5rem;color:var(--accent)">${rx.formula}</div>
        <div style="margin-bottom:0.5rem;color:var(--muted)">${rx.flavour}</div>
        <div style="border-top:1px solid var(--border);padding-top:0.5rem">
          <div><strong>Reagents:</strong></div>`;

    rx.reagents.forEach(r => {
      const el = ELEMENT_BY_NUMBER[r.atomicNumber];
      html += `<div>· ${el.name} (${el.symbol}): ${r.amount}</div>`;
    });

    html += `<div style="margin-top:0.5rem"><strong>Reward:</strong> +${rx.protonReward} Protons`;
    if (rx.permaBoost) {
      html += ` · ${this._describeBoost(rx.permaBoost)} permanent`;
    }
    html += `</div></div></div>`;

    content.innerHTML = html;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },

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

  _formatUpgradeCost(upg) {
    let html = `${this.formatNum(upg.cost)} Protons`;
    if (upg.elementCost?.length) {
      const parts = upg.elementCost.map(ec => {
        const sym = ELEMENT_BY_NUMBER[ec.atomicNumber]?.symbol ?? '?';
        const have = ResourceEngine.state[ec.atomicNumber]?.amount ?? 0;
        const met  = have >= ec.amount;
        return `<span style="color:${met ? 'var(--success)' : 'var(--danger)'}">${this.formatNum(ec.amount)} ${sym}</span>`;
      }).join(' · ');
      html += `<span class="upg-element-cost">${parts}</span>`;
    }
    return html;
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  },

  // ── Centered discovery splash ─────────────────────────
  showSplash(atomicNumber, isNew = false) {
    const el   = ELEMENT_BY_NUMBER[atomicNumber];
    const fact = getElementFact(atomicNumber);
    if (!el) return;

    const color = this._CATEGORY_COLORS[el.category] ?? 'var(--accent)';
    document.getElementById('splash-symbol').textContent   = el.symbol;
    document.getElementById('splash-symbol').style.color   = color;
    document.getElementById('splash-title').textContent    = isNew ? `Discovered: ${el.name}!` : el.name;
    document.getElementById('splash-subtitle').textContent =
      `#${el.atomicNumber} · Period ${el.period} · ${el.category.replace(/-/g,' ')}`;
    document.getElementById('splash-fact').textContent     = fact;

    this._showSplashOverlay();
  },

  _showReactionSplash(rxId) {
    const rx = REACTIONS.find(r => r.id === rxId);
    if (!rx) return;
    document.getElementById('splash-symbol').textContent   = rx.formula;
    document.getElementById('splash-symbol').style.color   = 'var(--success)';
    document.getElementById('splash-title').innerHTML      = `<div style="font-size:0.6rem;color:var(--success);margin-bottom:0.2rem">NEW REACTION</div>${rx.name}`;
    document.getElementById('splash-subtitle').textContent =
      `+${rx.protonReward} Protons · ${rx.permaBoost ? this._describeBoost(rx.permaBoost) + ' permanent' : ''}`;
    document.getElementById('splash-fact').textContent     = rx.flavour;
    this._showSplashOverlay();
  },

  _showSplashOverlay() {
    const overlay = document.getElementById('splash-overlay');
    overlay.classList.remove('hidden');
    // Cancel any pending auto-dismiss
    clearTimeout(this._splashAutoTimer);
    if (this._splashDismissCleanup) this._splashDismissCleanup();
    // Defer dismiss listener one tick — prevents the opening click from immediately closing it
    clearTimeout(this._splashTimer);
    this._splashTimer = setTimeout(() => {
      const dismiss = () => overlay.classList.add('hidden');
      document.addEventListener('click', dismiss, { once: true, capture: true });
      this._splashDismissCleanup = () => document.removeEventListener('click', dismiss, { capture: true });
      this._splashAutoTimer = setTimeout(dismiss, 10000);
    }, 0);
  },

  _splashTimer:        null,
  _splashAutoTimer:    null,
  _splashDismissCleanup: null,
};
