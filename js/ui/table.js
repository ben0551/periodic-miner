// ============================================================
// PERIODIC(TABLE) MINER — Periodic Table UI Renderer
// ============================================================
// DESIGN:
//   Renders the periodic table as a CSS grid (18 cols × 9 rows).
//   Rows 8-9 are the lanthanide/actinide series with a 2-col
//   indent to match the standard table layout.
//
//   Each cell:
//     - Shows atomic number, symbol, element name
//     - CSS class: locked / unlocked / producing
//     - A production bar (bottom) that fills proportionally
//       to how close the element is to its unlock threshold
//       (or production rate if already running)
//     - Click → open element detail modal
//
//   updateProduction() is called by GameLoop every UI frame
//   to refresh classes and progress bars without re-rendering
//   the whole grid (expensive).
//
//   TODO: hover tooltip with element details
//   TODO: click → open modal (wired in game.js / UI.openModal)
// ============================================================

const TableUI = {
  // Map atomicNumber → DOM element for fast updates
  _cells: {},

  // ── Full render (called once on init / after prestige) ─
  render() {
    const container = document.getElementById('periodic-table');
    container.innerHTML = '';
    this._cells = {};

    // Build a 9-row × 18-col grid map
    // Rows 1-7: standard periods; rows 8-9: lanthanides/actinides
    const grid = Array.from({ length: 9 }, () => Array(18).fill(null));

    ELEMENTS.forEach(el => {
      const row = el.tableRow - 1; // 0-indexed
      const col = el.tableCol - 1;
      grid[row][col] = el;
    });

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 18; col++) {
        const el = grid[row][col];

        if (el) {
          const cell = this._buildCell(el);
          container.appendChild(cell);
          this._cells[el.atomicNumber] = cell;
        } else {
          // Empty spacer cell to maintain grid alignment
          const spacer = document.createElement('div');
          spacer.className = 'element-cell spacer';
          container.appendChild(spacer);
        }
      }
    }

    this.updateProduction();
  },

  _buildCell(el) {
    const cell = document.createElement('div');
    cell.className = 'element-cell locked';
    cell.dataset.atomicNumber = el.atomicNumber;
    cell.dataset.category     = el.category;
    cell.title = `${el.name} (${el.atomicNumber})`;

    cell.innerHTML = `
      <span class="atomic-num">${el.atomicNumber}</span>
      <span class="symbol">${el.symbol}</span>
      <span class="el-name">${el.name}</span>
      <div class="prod-bar" style="width:0%"></div>
    `;

    cell.addEventListener('click', (e) => {
      e.preventDefault();
      const s = ResourceEngine.state[el.atomicNumber];
      if (s && s.unlocked) {
        ResourceEngine.manualMine(el.atomicNumber);
        UI.showSplash(el.atomicNumber, false);
      } else {
        UI.openElementModal(el.atomicNumber);
      }
    });

    // Info strip on hover
    cell.addEventListener('mouseenter', () => TableUI._setInfoStrip(el));
    cell.addEventListener('mouseleave', () => TableUI._clearInfoStrip());

    return cell;
  },

  // ── Info strip (bottom of table panel) ───────────────
  _setInfoStrip(el) {
    const strip   = document.getElementById('element-info-strip');
    const symEl   = document.getElementById('info-symbol');
    const nameEl  = document.getElementById('info-name');
    const factEl  = document.getElementById('info-fact');
    const s       = ResourceEngine.state[el.atomicNumber];
    const color   = UI._CATEGORY_COLORS?.[el.category] ?? 'var(--accent)';

    symEl.textContent  = el.symbol;
    symEl.style.color  = color;
    nameEl.textContent = `${el.name}  #${el.atomicNumber} · ${el.category.replace(/-/g,' ')}`;

    if (s?.unlocked) {
      factEl.textContent = getElementFact(el.atomicNumber);
    } else {
      const prev = ELEMENT_BY_NUMBER[el.atomicNumber - 1];
      factEl.textContent = el.atomicNumber > 1
        ? `Locked — requires ${el.unlockCost.toLocaleString()} ${prev?.symbol ?? ''}`
        : 'Always available';
    }

    strip.classList.remove('empty');
    FeaturesUI.updateShellsOnHover(el.atomicNumber);
  },

  _clearInfoStrip() {
    document.getElementById('element-info-strip').classList.add('empty');
  },

  // ── Light update — called every UI frame ──────────────
  updateProduction() {
    ELEMENTS.forEach(el => {
      const cell = this._cells[el.atomicNumber];
      if (!cell) return;

      const s = ResourceEngine.state[el.atomicNumber];
      if (!s) return;

      // Update lock state
      cell.classList.toggle('locked',    !s.unlocked);
      cell.classList.toggle('unlocked',   s.unlocked);
      cell.classList.toggle('producing',  s.unlocked && s.drills > 0);

      // Production bar: for locked elements, shows progress toward unlock cost.
      // For unlocked elements, shows drills as a fraction of some visual max.
      const bar = cell.querySelector('.prod-bar');
      if (bar) {
        if (!s.unlocked) {
          // Show how close we are to unlocking
          if (el.atomicNumber > 1) {
            const prev = ResourceEngine.state[el.atomicNumber - 1];
            const pct  = prev ? Math.min(100, (prev.amount / el.unlockCost) * 100) : 0;
            bar.style.width = pct + '%';
          }
        } else {
          // Show drills as a soft indicator (caps at 20 drills = 100%)
          bar.style.width = Math.min(100, (s.drills / 20) * 100) + '%';
        }
      }
    });
  },
};
