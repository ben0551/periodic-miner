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
    mode: 'symbol-to-name', // or 'name-to-symbol' or 'config-to-element'
    current: null,
  },
  _builderState: {
    targetElectrons: null,
    placed: {}, // { shellIndex: count }
    current: null,
  },
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
      case 'builder': this._renderBuilder(); break;
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
        <div class="shells-tip">Hover over elements in the table to see their electron shells</div>
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
  // ── Element Builder (learn electron shell filling) ─────
  _renderBuilder() {
    if (!this._builderState.current) {
      this._startNewBuilderChallenge();
    }
    this._drawBuilderChallenge();
  },

  _startNewBuilderChallenge() {
    const unlockedNumbers = ELEMENTS_SORTED
      .filter(el => ResourceEngine.state[el.atomicNumber]?.unlocked)
      .map(el => el.atomicNumber);

    if (unlockedNumbers.length === 0) {
      document.getElementById('feature-content').innerHTML =
        '<p class="text-muted" style="padding:1rem">Unlock elements to use the builder.</p>';
      return;
    }

    // Pick a random unlocked element
    const num = unlockedNumbers[Math.floor(Math.random() * unlockedNumbers.length)];
    const props = ELEMENT_PROPS[num];
    const totalElectrons = props.shells.reduce((a, b) => a + b, 0);

    this._builderState.current = num;
    this._builderState.targetElectrons = totalElectrons;
    this._builderState.placed = {};
  },

  _drawBuilderChallenge() {
    const state = this._builderState;
    const el = ELEMENT_BY_NUMBER[state.current];
    const props = ELEMENT_PROPS[state.current];
    const maxShells = props.shells.length;

    let html = `<div class="builder-container">
      <div class="builder-title">Place ${state.targetElectrons} electrons in shells</div>
      <div class="builder-hint">Shells fill: 2, then 8, then 18, then 32...</div>
      <div class="builder-shells">`;

    const shellMaxes = [2, 8, 18, 32];
    let remainingElectrons = state.targetElectrons;

    for (let i = 0; i < maxShells; i++) {
      const maxInShell = shellMaxes[i];
      const placed = state.placed[i] || 0;
      const correct = props.shells[i];

      html += `<div class="shell-row">
        <span class="shell-label">Shell ${i + 1}:</span>
        <div class="shell-display">`;

      // Draw electron slots
      for (let j = 0; j < maxInShell; j++) {
        const isFilled = j < placed;
        const isCorrect = j < correct;
        const className = isFilled ? 'electron filled' : (isCorrect ? 'electron correct' : 'electron empty');
        html += `<div class="${className}" data-shell="${i}" data-slot="${j}"></div>`;
      }

      html += `</div>
        <span class="shell-count">${placed}/${correct}</span>
      </div>`;
    }

    html += `</div>
      <div class="builder-controls">
        <button id="builder-add">+ Electron</button>
        <button id="builder-clear">Clear</button>
        <button id="builder-submit" ${remainingElectrons === state.targetElectrons ? '' : 'disabled'}>Submit</button>
      </div>
    </div>`;

    const content = document.getElementById('feature-content');
    content.innerHTML = html;

    // Wire up buttons
    document.getElementById('builder-add').addEventListener('click', () => {
      const totalPlaced = Object.values(state.placed).reduce((a, b) => a + b, 0);
      if (totalPlaced < state.targetElectrons) {
        // Add to first non-full shell
        for (let i = 0; i < maxShells; i++) {
          if ((state.placed[i] || 0) < shellMaxes[i]) {
            state.placed[i] = (state.placed[i] || 0) + 1;
            break;
          }
        }
        this._drawBuilderChallenge();
      }
    });

    document.getElementById('builder-clear').addEventListener('click', () => {
      state.placed = {};
      this._drawBuilderChallenge();
    });

    document.getElementById('builder-submit').addEventListener('click', () => {
      // Check if correct
      let correct = true;
      for (let i = 0; i < maxShells; i++) {
        if ((state.placed[i] || 0) !== props.shells[i]) {
          correct = false;
          break;
        }
      }

      if (correct) {
        UpgradeEngine.protons += 3;
        content.innerHTML = `<div class="builder-success">
          <div style="font-size:1rem;color:var(--success);margin-bottom:0.5rem">✓ Correct!</div>
          <div style="font-size:0.8rem">${el.symbol} — ${el.name}</div>
          <div style="font-size:0.7rem;color:var(--gold);margin-top:0.3rem">+3 Protons</div>
        </div>`;
        setTimeout(() => {
          state.current = null;
          this._renderBuilder();
        }, 1500);
      } else {
        content.querySelector('.builder-submit').style.backgroundColor = 'var(--danger)';
        setTimeout(() => {
          this._drawBuilderChallenge();
        }, 800);
      }
    });
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
