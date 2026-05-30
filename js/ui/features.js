// ============================================================
// PERIODIC(TABLE) MINER — Feature Panel UI
// ============================================================
// Four tabs: Quiz | Shells | Trends | Timeline
// Renders below the periodic table element info strip.
// ============================================================

const FeaturesUI = {
  _activeFeature: 'quiz',
  _quizState: {
    streak: 0,
    mode: 'symbol-to-name', // or 'name-to-symbol'
    current: null,
  },
  _trendsProp: 'electronegativity',
  _historyCenturies: {},

  // ── Initialization ─────────────────────────────────────
  init() {
    const tabs = document.querySelectorAll('.feat-btn');
    tabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this._activeFeature = e.currentTarget.dataset.feat;
        tabs.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.render();
      });
    });
    this._buildHistoryCenturies();
    this.render();
  },

  _buildHistoryCenturies() {
    this._historyCenturies = {
      'Prehistoric': [],
      '1600s': [],
      '1700s': [],
      '1800s': [],
      '1900s': [],
      '2000s': [],
    };
    for (let i = 1; i <= 118; i++) {
      const props = ELEMENT_PROPS[i];
      if (!props.discoveryYear) {
        this._historyCenturies['Prehistoric'].push(i);
      } else if (props.discoveryYear < 1700) {
        this._historyCenturies['1600s'].push(i);
      } else if (props.discoveryYear < 1800) {
        this._historyCenturies['1700s'].push(i);
      } else if (props.discoveryYear < 1900) {
        this._historyCenturies['1800s'].push(i);
      } else if (props.discoveryYear < 2000) {
        this._historyCenturies['1900s'].push(i);
      } else {
        this._historyCenturies['2000s'].push(i);
      }
    }
  },

  // ── Main render ────────────────────────────────────────
  render() {
    const content = document.getElementById('feature-content');
    content.innerHTML = '';

    switch (this._activeFeature) {
      case 'quiz': this._renderQuiz(); break;
      case 'shells': this._renderShells(1); break; // default to H
      case 'trends': this._renderTrends(); break;
      case 'timeline': this._renderTimeline(); break;
    }
  },

  // ── Quiz ───────────────────────────────────────────────
  _renderQuiz() {
    const unlockedNumbers = ELEMENTS_SORTED
      .filter(el => ResourceEngine.state[el.atomicNumber]?.unlocked)
      .map(el => el.atomicNumber);

    if (unlockedNumbers.length === 0) {
      document.getElementById('feature-content').innerHTML =
        '<p class="text-muted" style="padding:1rem">Unlock elements to take the quiz.</p>';
      return;
    }

    // Always pick a new random unlocked element
    this._quizState.current = unlockedNumbers[Math.floor(Math.random() * unlockedNumbers.length)];

    const el = ELEMENT_BY_NUMBER[this._quizState.current];
    const isSymbolMode = Math.random() > 0.5;

    // Generate wrong answers
    const otherNumbers = unlockedNumbers.filter(n => n !== this._quizState.current);
    const wrongAnswers = otherNumbers
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
      .map(n => ELEMENT_BY_NUMBER[n]);

    const correctAnswer = isSymbolMode ? el.name : el.symbol;
    const options = [correctAnswer, ...wrongAnswers.map(w => isSymbolMode ? w.name : w.symbol)]
      .sort(() => Math.random() - 0.5);

    const content = document.getElementById('feature-content');
    const html = `
      <div class="quiz-container">
        <div class="quiz-question">
          ${isSymbolMode ? `<div class="quiz-symbol">${el.symbol}</div>` : `<div class="quiz-name">${el.name}</div>`}
          <div class="quiz-prompt">${isSymbolMode ? 'Name?' : 'Symbol?'}</div>
        </div>
        <div class="quiz-streak">Streak: ${this._quizState.streak}</div>
        <div class="quiz-options">
          ${options.map((opt, idx) => `
            <button class="quiz-btn" data-correct="${opt === correctAnswer}">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    content.innerHTML = html;

    content.querySelectorAll('.quiz-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const isCorrect = e.currentTarget.dataset.correct === 'true';
        if (isCorrect) {
          this._quizState.streak++;
          UpgradeEngine.protons += 2;
          this._renderQuiz();
        } else {
          this._quizState.streak = 0;
          e.currentTarget.style.backgroundColor = 'var(--danger)';
          setTimeout(() => this._renderQuiz(), 800);
        }
      });
    });
  },

  // ── Electron Shells ────────────────────────────────────
  _renderShells(atomicNumber) {
    const el = ELEMENT_BY_NUMBER[atomicNumber];
    const s = ResourceEngine.state[atomicNumber];
    const props = ELEMENT_PROPS[atomicNumber];
    const unlocked = s?.unlocked;

    const maxRadius = 150;
    const shells = props.shells;
    const totalShells = shells.length;
    const shellRadius = maxRadius / (totalShells + 1);

    let svg = `<svg viewBox="0 0 300 300" class="shells-svg" style="max-height:150px">
      <circle cx="150" cy="150" r="12" fill="var(--accent)" opacity="${unlocked ? 1 : 0.3}"/>`;

    // Draw shells and electrons
    for (let i = 0; i < totalShells; i++) {
      const radius = shellRadius * (i + 1);
      svg += `<circle cx="150" cy="150" r="${radius}" fill="none" stroke="var(--accent)" stroke-width="1" opacity="${unlocked ? 0.3 : 0.15}"/>`;

      const electronCount = shells[i];
      for (let j = 0; j < electronCount; j++) {
        const angle = (j / electronCount) * Math.PI * 2;
        const x = 150 + radius * Math.cos(angle);
        const y = 150 + radius * Math.sin(angle);
        svg += `<circle cx="${x}" cy="${y}" r="4" fill="var(--accent)" opacity="${unlocked ? 0.8 : 0.3}"/>`;
      }
    }

    svg += `</svg>`;

    const content = document.getElementById('feature-content');
    content.innerHTML = `
      <div class="shells-container">
        <div class="shells-header">${el.symbol} — ${el.name}</div>
        ${svg}
        <div class="shells-config">${shells.join('-')}</div>
      </div>
    `;
  },

  // Called when hovering over table elements
  updateShellsOnHover(atomicNumber) {
    if (this._activeFeature === 'shells') {
      this._renderShells(atomicNumber);
    }
  },

  // ── Periodic Trends ────────────────────────────────────
  _renderTrends() {
    const props = ['electronegativity', 'atomicRadius', 'meltingPoint', 'atomicMass'];
    const content = document.getElementById('feature-content');

    const buttons = props.map(p =>
      `<button class="trend-prop-btn ${this._trendsProp === p ? 'active' : ''}" data-prop="${p}">
        ${p.replace(/([A-Z])/g, ' $1').trim()}
      </button>`
    ).join('');

    const propLabels = {
      electronegativity: '(Pauling scale)',
      atomicRadius: '(picometres)',
      meltingPoint: '(°C)',
      atomicMass: '(u)'
    };

    let trendsHtml = `<div class="trends-container">
      <div class="trend-header">
        <div class="trend-title">${this._trendsProp.replace(/([A-Z])/g, ' $1').trim()} ${propLabels[this._trendsProp]}</div>
        <div class="trend-legend">
          <span style="font-size:0.55rem;color:var(--muted)">Colors: Element categories | Opacity: unlocked vs locked</span>
        </div>
      </div>
      <div class="trend-buttons">${buttons}</div>
      <div class="trends-chart" id="trends-chart"></div>
    </div>`;

    content.innerHTML = trendsHtml;

    content.querySelectorAll('.trend-prop-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this._trendsProp = e.currentTarget.dataset.prop;
        this._renderTrends();
      });
    });

    this._drawTrendsChart();
  },

  _drawTrendsChart() {
    const chartContainer = document.getElementById('trends-chart');
    const prop = this._trendsProp;
    const rows = {};

    // Group by period
    for (let i = 1; i <= 118; i++) {
      const el = ELEMENT_BY_NUMBER[i];
      const s = ResourceEngine.state[i];
      const props = ELEMENT_PROPS[i];
      if (!rows[el.period]) rows[el.period] = [];

      const value = props[prop];
      rows[el.period].push({ atomicNumber: i, value, unlocked: s?.unlocked });
    }

    let html = '';
    const maxValue = Math.max(...Object.values(rows).flat().map(x => x.value || 0).filter(v => v > 0));

    for (let p = 1; p <= 7; p++) {
      if (!rows[p]) continue;
      html += `<div class="trend-row"><span class="trend-label">P${p}:</span><div class="trend-bars">`;

      rows[p].forEach(item => {
        if (!item.value) {
          html += `<div class="trend-bar empty"></div>`;
        } else {
          const pct = (item.value / maxValue) * 100;
          const color = UI._CATEGORY_COLORS[ELEMENT_BY_NUMBER[item.atomicNumber].category] || 'var(--accent)';
          const opacity = item.unlocked ? 1 : 0.3;
          html += `<div class="trend-bar" style="width:${pct}%;background:${color};opacity:${opacity}" title="${item.value.toFixed(2)}"></div>`;
        }
      });

      html += `</div></div>`;
    }

    chartContainer.innerHTML = html;
  },

  // ── Discovery Timeline ─────────────────────────────────
  _renderTimeline() {
    const content = document.getElementById('feature-content');
    let html = '<div class="timeline-container">';

    const centuries = ['Prehistoric', '1600s', '1700s', '1800s', '1900s', '2000s'];
    for (const century of centuries) {
      const nums = this._historyCenturies[century];
      if (nums.length === 0) continue;

      html += `<div class="timeline-century"><h4>${century}</h4>`;

      nums.forEach(n => {
        const el = ELEMENT_BY_NUMBER[n];
        const s = ResourceEngine.state[n];
        const props = ELEMENT_PROPS[n];
        const unlocked = s?.unlocked;
        const year = props.discoveryYear || 'Unknown';
        const by = props.discoveredBy || 'Ancient';

        const color = unlocked ? 'var(--accent)' : 'var(--muted)';
        html += `<div class="timeline-row" style="color:${color}">
          <span class="tl-year">${year}</span>
          <span class="tl-symbol">${el.symbol}</span>
          <span class="tl-name">${el.name}</span>
          <span class="tl-by">${by}</span>
        </div>`;
      });

      html += '</div>';
    }

    html += '</div>';
    content.innerHTML = html;
  },
};
