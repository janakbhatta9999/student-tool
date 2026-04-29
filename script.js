/* =========================================
   STUDYHUB — script.js
   All 8 Tool Logics
   ========================================= */

// =============================================
// TAB SWITCHING
// =============================================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});


// =============================================
// 1. POMODORO TIMER
// =============================================
(function () {
  const display    = document.getElementById('timerDisplay');
  const label      = document.getElementById('timerLabel');
  const ring       = document.getElementById('ringProgress');
  const btnStart   = document.getElementById('pomoBtnStart');
  const btnReset   = document.getElementById('pomoBtnReset');
  const sessionEl  = document.getElementById('sessionCount');
  const customInp  = document.getElementById('pomoCustomInput');
  const customSet  = document.getElementById('pomoCustomSetBtn');
  const pomoDesc   = document.getElementById('pomoDesc');
  const circumference = 2 * Math.PI * 88; // r=88

  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = 0;

  let totalSeconds = 25 * 60;
  let remaining    = totalSeconds;
  let running      = false;
  let interval     = null;
  let sessions     = 0;

  function setProgress(rem) {
    const pct = rem / totalSeconds;
    ring.style.strokeDashoffset = circumference * (1 - pct);
  }

  function render() {
    const m = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s = String(remaining % 60).padStart(2, '0');
    display.textContent = `${m}:${s}`;
    setProgress(remaining);
  }

  function start() {
    running = true;
    btnStart.textContent = '⏸ Pause';
    interval = setInterval(() => {
      if (remaining <= 0) {
        clearInterval(interval);
        running = false;
        btnStart.textContent = '▶ Start';
        if (label.textContent === 'Focus') {
          sessions++;
          sessionEl.textContent = sessions;
        }
        if (typeof fireConfetti === 'function') fireConfetti();
        alert(`${label.textContent} session complete! 🎉`);
        return;
      }
      remaining--;
      render();
    }, 1000);
  }

  function pause() {
    clearInterval(interval);
    running = false;
    btnStart.textContent = '▶ Resume';
  }

  btnStart.addEventListener('click', () => running ? pause() : start());

  btnReset.addEventListener('click', () => {
    clearInterval(interval);
    running = false;
    remaining = totalSeconds;
    btnStart.textContent = '▶ Start';
    render();
  });

  const modeBtns = document.querySelectorAll('.pomo-mode');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(interval);
      running = false;
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      totalSeconds = parseInt(btn.dataset.min) * 60;
      remaining = totalSeconds;
      label.textContent = btn.dataset.label;
      btnStart.textContent = '▶ Start';
      render();
    });
  });

  if (customSet && customInp) {
    customSet.addEventListener('click', () => {
      let focusMins = parseInt(customInp.value);
      if (isNaN(focusMins) || focusMins < 1) {
        alert("Please enter a valid number of minutes.");
        return;
      }
      
      // Auto-calculate breaks: short is 1/5th, long is 3/5ths
      let shortMins = Math.max(1, Math.round(focusMins / 5));
      let longMins = Math.max(1, Math.round(focusMins * 3 / 5));
      
      // Update the data-min values
      modeBtns[0].dataset.min = focusMins;
      modeBtns[1].dataset.min = shortMins;
      modeBtns[2].dataset.min = longMins;
      
      if (pomoDesc) {
        pomoDesc.textContent = `Focus for ${focusMins} min, then take a ${shortMins}-min break.`;
      }
      
      // Trigger focus mode click to apply
      modeBtns[0].click();
      customInp.value = '';
    });
  }

  render();
})();


// =============================================
// 2. TO-DO LIST
// =============================================
(function () {
  let tasks = [];
  let currentFilter = 'all';

  const input      = document.getElementById('todoInput');
  const priority   = document.getElementById('todoPriority');
  const addBtn     = document.getElementById('todoAddBtn');
  const list       = document.getElementById('todoList');
  const countEl    = document.getElementById('todoCount');
  const clearBtn   = document.getElementById('clearDone');

  function render() {
    list.innerHTML = '';
    let visible = tasks.filter(t =>
      currentFilter === 'all'    ? true :
      currentFilter === 'active' ? !t.done :
      t.done
    );

    if (visible.length === 0) {
      const li = document.createElement('li');
      li.style.cssText = 'color:var(--text-muted);font-size:.85rem;padding:.5rem 0;text-align:center;';
      li.textContent = 'No tasks here.';
      list.appendChild(li);
    }

    visible.forEach(task => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (task.done ? ' done' : '');

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'todo-checkbox';
      cb.checked = task.done;
      cb.addEventListener('change', () => {
        task.done = cb.checked;
        render();
      });

      const dot = document.createElement('span');
      dot.className = `priority-dot ${task.priority}`;

      const txt = document.createElement('span');
      txt.className = 'todo-text';
      txt.textContent = task.text;

      const del = document.createElement('button');
      del.className = 'todo-del';
      del.textContent = '✕';
      del.addEventListener('click', () => {
        tasks = tasks.filter(t => t !== task);
        render();
      });

      li.append(cb, dot, txt, del);
      list.appendChild(li);
    });

    const active = tasks.filter(t => !t.done).length;
    countEl.textContent = `${active} task${active !== 1 ? 's' : ''} left`;
  }

  addBtn.addEventListener('click', addTask);
  input.addEventListener('keydown', e => e.key === 'Enter' && addTask());

  function addTask() {
    const val = input.value.trim();
    if (!val) return;
    tasks.push({ text: val, priority: priority.value, done: false });
    input.value = '';
    render();
  }

  clearBtn.addEventListener('click', () => {
    const originalLen = tasks.length;
    tasks = tasks.filter(t => !t.done);
    if (tasks.length < originalLen && typeof fireConfetti === 'function') fireConfetti();
    render();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  render();
})();


// =============================================
// 3. WORD COUNTER
// =============================================
(function () {
  const ta = document.getElementById('wcTextarea');

  function update() {
    const text = ta.value;
    const words      = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const chars      = text.length;
    const charsNoSp  = text.replace(/\s/g, '').length;
    const sentences  = text.trim() === '' ? 0 : (text.match(/[.!?]+/g) || []).length;
    const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0);
    const readTime   = Math.max(1, Math.ceil(words / 200));

    document.getElementById('wcWords').textContent       = words;
    document.getElementById('wcChars').textContent       = chars;
    document.getElementById('wcCharsNoSpace').textContent = charsNoSp;
    document.getElementById('wcSentences').textContent   = sentences;
    document.getElementById('wcParagraphs').textContent  = paragraphs;
    document.getElementById('wcReadTime').textContent    = readTime + ' min';
  }

  ta.addEventListener('input', update);
  document.getElementById('wcClear').addEventListener('click', () => { ta.value = ''; update(); });
  update();
})();


// =============================================
// 4. GPA CALCULATOR
// =============================================
(function () {
  const resultEl = document.getElementById('gpaResult');
  const calcBtn = document.getElementById('gpaCalc');
  let currentMode = 'marks';

  // Toggle mode
  document.querySelectorAll('.gpa-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gpa-mode-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.gpa-table-container').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      document.getElementById('gpa-' + currentMode + '-table').classList.add('active');
      resultEl.className = 'gpa-result';
    });
  });

  // Inject grade selects into grades table
  const selectHTML = `
    <select class="neb-grade-select">
      <option value="">-</option>
      <option value="4.0">A+ (4.0)</option>
      <option value="3.6">A (3.6)</option>
      <option value="3.2">B+ (3.2)</option>
      <option value="2.8">B (2.8)</option>
      <option value="2.4">C+ (2.4)</option>
      <option value="2.0">C (2.0)</option>
      <option value="1.6">D (1.6)</option>
      <option value="0.0">NG (0.0)</option>
    </select>
  `;
  document.querySelectorAll('.grade-cell').forEach(cell => {
    cell.innerHTML = selectHTML;
  });

  function getGradePointFromPercentage(pct) {
    if (pct >= 90) return 4.0;
    if (pct >= 80) return 3.6;
    if (pct >= 70) return 3.2;
    if (pct >= 60) return 2.8;
    if (pct >= 50) return 2.4;
    if (pct >= 40) return 2.0;
    if (pct >= 35) return 1.6;
    return 0.0;
  }

  calcBtn.addEventListener('click', () => {
    let totalPoints = 0, totalCredits = 0;
    let hasNG = false;
    let anyValid = false;

    if (currentMode === 'marks') {
      const rows = document.querySelectorAll('#gpaMarksRows tr');
      rows.forEach(row => {
        const credit = parseFloat(row.dataset.credit);
        const thMax = parseFloat(row.dataset.thMax) || 75;
        const inMax = parseFloat(row.dataset.inMax) || 25;
        const thVal = row.querySelector('.neb-th').value;
        const inVal = row.querySelector('.neb-in').value;
        if (thVal !== '' || inVal !== '') {
          anyValid = true;
          
          let thGp = null;
          let inGp = null;
          let gp = 0;

          if (thVal !== '') {
            const th = parseFloat(thVal) || 0;
            const thPct = (th / thMax) * 100;
            thGp = getGradePointFromPercentage(thPct);
            if (thGp === 0.0) hasNG = true;
          }
          if (inVal !== '') {
            const inM = parseFloat(inVal) || 0;
            const inPct = (inM / inMax) * 100;
            inGp = getGradePointFromPercentage(inPct);
            if (inGp === 0.0) hasNG = true;
          }

          if (thGp !== null && inGp !== null) {
            const totalMax = thMax + inMax;
            gp = (thGp * (thMax / totalMax)) + (inGp * (inMax / totalMax));
          } else if (thGp !== null) {
            gp = thGp;
          } else if (inGp !== null) {
            gp = inGp;
          }

          totalPoints += credit * gp;
          totalCredits += credit;
        }
      });
    } else {
      const rows = document.querySelectorAll('#gpaGradesRows tr');
      rows.forEach(row => {
        const credit = parseFloat(row.dataset.credit);
        const thSel = row.querySelector('.grade-cell.th select').value;
        const prSel = row.querySelector('.grade-cell.pr select').value;
        
        if (thSel !== '' || prSel !== '') {
          anyValid = true;
          let gp;
          
          if (thSel !== '' && prSel !== '') {
            // Assume 75% theory, 25% practical for simplicity when combining grades
            gp = (parseFloat(thSel) * 0.75) + (parseFloat(prSel) * 0.25);
            if (parseFloat(thSel) === 0.0 || parseFloat(prSel) === 0.0) hasNG = true;
          } else {
            // If only one is provided, treat it as the total subject grade
            gp = parseFloat(thSel !== '' ? thSel : prSel);
            if (gp === 0.0) hasNG = true;
          }
          
          totalPoints += credit * gp;
          totalCredits += credit;
        }
      });
    }

    if (!anyValid || totalCredits === 0) {
      resultEl.className = 'gpa-result show';
      resultEl.innerHTML = `<span style="color:var(--rose)">Please enter marks or grades.</span>`;
      return;
    }

    const gpa = (totalPoints / totalCredits).toFixed(2);
    let letterGrade;
    if (hasNG) {
      letterGrade = 'NG';
    } else {
      letterGrade = gpa >= 3.6 ? 'A+' : gpa >= 3.2 ? 'A' : gpa >= 2.8 ? 'B+' :
                    gpa >= 2.4 ? 'B'  : gpa >= 2.0 ? 'C+' : gpa >= 1.6 ? 'C' :
                    gpa > 0.0 ? 'D' : 'NG';
    }

    resultEl.className = 'gpa-result show';
    resultEl.innerHTML = `
      <div class="neb-result-box">
        <div class="neb-stat">
          <span class="neb-label">Your GPA</span>
          <span class="neb-val">${gpa}</span>
        </div>
        <div class="neb-stat highlight">
          <span class="neb-label">Letter Grade</span>
          <span class="neb-val grade-${letterGrade.replace('+', 'plus')}">${letterGrade}</span>
        </div>
        <div class="neb-stat">
          <span class="neb-label">Total Credits</span>
          <span class="neb-val small">${totalCredits}</span>
        </div>
      </div>
    `;
  });
})();

// =============================================
// 4.5 SEMESTER GPA CALCULATOR
// =============================================
(function () {
  const resultEl = document.getElementById('semGpaResult');
  const calcBtn = document.getElementById('semGpaCalc');
  const addRowBtn = document.getElementById('semGpaAddRow');
  const tbody = document.getElementById('semGpaDynamicRows');

  // Add row dynamically
  if (addRowBtn && tbody) {
    addRowBtn.addEventListener('click', () => {
      const tr = document.createElement('tr');
      const rowCount = tbody.children.length + 1;
      tr.innerHTML = `
        <td><input type="text" class="dyn-sub" placeholder="Subject ${rowCount}"></td>
        <td><input type="number" class="dyn-cred" min="0.5" step="0.5" value="3"></td>
        <td>
          <div class="marks-group">
            <input type="number" class="dyn-th-obt" placeholder="Obt" min="0">
            <span class="marks-sep">/</span>
            <input type="number" class="dyn-th-max" placeholder="Max" value="75" min="1">
          </div>
        </td>
        <td>
          <div class="marks-group">
            <input type="number" class="dyn-pr-obt" placeholder="Obt" min="0">
            <span class="marks-sep">/</span>
            <input type="number" class="dyn-pr-max" placeholder="Max" value="25" min="0">
          </div>
        </td>
        <td><button class="link-btn danger del-row">✕</button></td>
      `;
      tbody.appendChild(tr);
    });

    // Delete row via event delegation
    tbody.addEventListener('click', (e) => {
      if (e.target.classList.contains('del-row')) {
        e.target.closest('tr').remove();
      }
    });
  }

  function getGradePointFromPercentage(pct) {
    if (pct >= 90) return 4.0;
    if (pct >= 80) return 3.6;
    if (pct >= 70) return 3.2;
    if (pct >= 60) return 2.8;
    if (pct >= 50) return 2.4;
    if (pct >= 40) return 2.0;
    if (pct >= 35) return 1.6;
    return 0.0;
  }

  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      let totalPoints = 0, totalCredits = 0;
      let hasNG = false;
      let anyValid = false;

      const rows = document.querySelectorAll('#semGpaDynamicRows tr');
      rows.forEach(row => {
        const credit = parseFloat(row.querySelector('.dyn-cred').value) || 0;
        if (credit <= 0) return;

        const thObtInput = row.querySelector('.dyn-th-obt').value;
        const thMaxInput = row.querySelector('.dyn-th-max').value;
        const prObtInput = row.querySelector('.dyn-pr-obt').value;
        const prMaxInput = row.querySelector('.dyn-pr-max').value;

        if (thObtInput !== '' || prObtInput !== '') {
          anyValid = true;
          let thGp = null, inGp = null, gp = 0;
          let thMax = parseFloat(thMaxInput) || 0;
          let prMax = parseFloat(prMaxInput) || 0;

          if (thObtInput !== '' && thMax > 0) {
            const th = parseFloat(thObtInput) || 0;
            const thPct = (th / thMax) * 100;
            thGp = getGradePointFromPercentage(thPct);
            if (thGp === 0.0) hasNG = true;
          }

          if (prObtInput !== '' && prMax > 0) {
            const pr = parseFloat(prObtInput) || 0;
            const prPct = (pr / prMax) * 100;
            inGp = getGradePointFromPercentage(prPct);
            if (inGp === 0.0) hasNG = true;
          }

          if (thGp !== null && inGp !== null) {
            const totalMax = thMax + prMax;
            gp = (thGp * (thMax / totalMax)) + (inGp * (prMax / totalMax));
          } else if (thGp !== null) {
            gp = thGp;
          } else if (inGp !== null) {
            gp = inGp;
          }

          totalPoints += credit * gp;
          totalCredits += credit;
        }
      });

      if (!anyValid || totalCredits === 0) {
        resultEl.className = 'gpa-result show';
        resultEl.innerHTML = `<span style="color:var(--rose)">Please enter obtained marks for at least one subject.</span>`;
        return;
      }

      const gpa = (totalPoints / totalCredits).toFixed(2);
      let letterGrade;
      if (hasNG) {
        letterGrade = 'NG';
      } else {
        letterGrade = gpa >= 3.6 ? 'A+' : gpa >= 3.2 ? 'A' : gpa >= 2.8 ? 'B+' :
                      gpa >= 2.4 ? 'B'  : gpa >= 2.0 ? 'C+' : gpa >= 1.6 ? 'C' :
                      gpa > 0.0 ? 'D' : 'NG';
      }

      resultEl.className = 'gpa-result show';
      resultEl.innerHTML = `
        <div class="neb-result-box">
          <div class="neb-stat">
            <span class="neb-label">Your GPA</span>
            <span class="neb-val">${gpa}</span>
          </div>
          <div class="neb-stat highlight">
            <span class="neb-label">Letter Grade</span>
            <span class="neb-val grade-${letterGrade.replace('+', 'plus')}">${letterGrade}</span>
          </div>
          <div class="neb-stat">
            <span class="neb-label">Total Credits</span>
            <span class="neb-val small">${totalCredits}</span>
          </div>
        </div>
      `;
    });
  }
})();


// =============================================
// 5. PERCENTAGE CALCULATOR
// =============================================
(function () {
  // Mode tabs
  document.querySelectorAll('.pct-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pct-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.pct-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('pct-' + btn.dataset.mode).classList.add('active');
    });
  });

  function gradeInfo(pct) {
    if (pct >= 90) return { letter: 'A+', color: '#4ecdc4' };
    if (pct >= 80) return { letter: 'A',  color: '#4ecdc4' };
    if (pct >= 70) return { letter: 'B',  color: 'var(--gold)' };
    if (pct >= 60) return { letter: 'C',  color: '#f5c542' };
    if (pct >= 50) return { letter: 'D',  color: '#f5a742' };
    return { letter: 'F', color: 'var(--rose)' };
  }

  // Marks %
  document.getElementById('pctMarksCalc').addEventListener('click', () => {
    const obt   = parseFloat(document.getElementById('pctObtained').value);
    const total = parseFloat(document.getElementById('pctTotal').value);
    const res   = document.getElementById('pctMarksResult');
    if (isNaN(obt) || isNaN(total) || total === 0) {
      res.className = 'pct-result show';
      res.innerHTML = `<span style="color:var(--rose)">Please enter valid marks.</span>`;
      return;
    }
    const pct = ((obt / total) * 100).toFixed(2);
    const g = gradeInfo(parseFloat(pct));
    res.className = 'pct-result show';
    res.innerHTML = `
      <span class="pct-big">${pct}%</span>
      <span class="grade-badge" style="background:${g.color}22;color:${g.color};border:1px solid ${g.color}55">${g.letter}</span>
      <div style="margin-top:.5rem;font-size:.83rem;color:var(--text-muted)">${obt} out of ${total} marks</div>
    `;
  });

  // % of number
  document.getElementById('pctPercentCalc').addEventListener('click', () => {
    const pct = parseFloat(document.getElementById('pctPct').value);
    const num = parseFloat(document.getElementById('pctNum').value);
    const res = document.getElementById('pctPercentResult');
    if (isNaN(pct) || isNaN(num)) {
      res.className = 'pct-result show';
      res.innerHTML = `<span style="color:var(--rose)">Please enter valid numbers.</span>`;
      return;
    }
    const ans = ((pct / 100) * num).toFixed(4).replace(/\.?0+$/, '');
    res.className = 'pct-result show';
    res.innerHTML = `<span class="pct-big">${ans}</span><div style="margin-top:.4rem;font-size:.83rem;color:var(--text-muted)">${pct}% of ${num} = ${ans}</div>`;
  });

  // % change
  document.getElementById('pctChangeCalc').addEventListener('click', () => {
    const oldVal = parseFloat(document.getElementById('pctOld').value);
    const newVal = parseFloat(document.getElementById('pctNew').value);
    const res    = document.getElementById('pctChangeResult');
    if (isNaN(oldVal) || isNaN(newVal) || oldVal === 0) {
      res.className = 'pct-result show';
      res.innerHTML = `<span style="color:var(--rose)">Please enter valid values.</span>`;
      return;
    }
    const change = (((newVal - oldVal) / Math.abs(oldVal)) * 100).toFixed(2);
    const isUp = parseFloat(change) >= 0;
    res.className = 'pct-result show';
    res.innerHTML = `
      <span class="pct-big" style="color:${isUp ? 'var(--teal)' : 'var(--rose)'}">${isUp ? '+' : ''}${change}%</span>
      <div style="margin-top:.4rem;font-size:.83rem;color:var(--text-muted)">${oldVal} → ${newVal} (${isUp ? 'increase' : 'decrease'})</div>
    `;
  });
})();


// =============================================
// 6. FLASHCARDS (with Spaced Repetition)
// =============================================
(function () {
  let cards = JSON.parse(localStorage.getItem('studyhub_flashcards')) || [];
  let current = 0;

  const frontInput  = document.getElementById('fcFront');
  const backInput   = document.getElementById('fcBack');
  const addBtn      = document.getElementById('fcAdd');
  const flashcard   = document.getElementById('flashcard');
  const fcInner     = document.getElementById('fcInner');
  const fcFront     = document.getElementById('fcFrontDisplay');
  const fcBack      = document.getElementById('fcBackDisplay');
  const fcControls  = document.getElementById('fcControls');
  const fcCounter   = document.getElementById('fcCounter');
  const fcEmpty     = document.getElementById('fcEmpty');
  const fcHint      = document.getElementById('fcHint');
  const clearBtn    = document.getElementById('fcClear');
  const srsControls = document.getElementById('fcSrsControls');

  function save() { localStorage.setItem('studyhub_flashcards', JSON.stringify(cards)); }

  // Sort cards so harder ones (higher weight) appear first
  function sortByPriority() {
    cards.sort((a, b) => (b.weight || 3) - (a.weight || 3));
  }

  function renderCard() {
    if (cards.length === 0) {
      flashcard.style.display  = 'none';
      fcControls.style.display = 'none';
      fcHint.style.display     = 'none';
      fcEmpty.style.display    = 'block';
      if (srsControls) srsControls.style.display = 'none';
      return;
    }
    fcEmpty.style.display    = 'none';
    flashcard.style.display  = 'block';
    fcControls.style.display = 'flex';
    fcHint.style.display     = 'block';
    if (srsControls) srsControls.style.display = 'flex';
    fcInner.classList.remove('flipped');
    fcFront.textContent = cards[current].front;
    fcBack.textContent  = cards[current].back;
    fcCounter.textContent = `${current + 1} / ${cards.length}`;
  }

  function rateCard(difficulty) {
    if (cards.length === 0) return;
    // difficulty: 'hard' = weight stays high, 'good' = medium, 'easy' = drops low
    if (difficulty === 'hard') cards[current].weight = Math.min(10, (cards[current].weight || 3) + 2);
    else if (difficulty === 'good') cards[current].weight = Math.max(1, (cards[current].weight || 3));
    else cards[current].weight = Math.max(1, (cards[current].weight || 3) - 2);
    save();
    sortByPriority();
    current = (current + 1) % cards.length;
    renderCard();
  }

  addBtn.addEventListener('click', () => {
    const f = frontInput.value.trim();
    const b = backInput.value.trim();
    if (!f || !b) return alert('Please fill both front and back!');
    cards.push({ front: f, back: b, weight: 5 });
    frontInput.value = '';
    backInput.value  = '';
    current = cards.length - 1;
    save();
    renderCard();
  });

  flashcard.addEventListener('click', () => fcInner.classList.toggle('flipped'));

  document.getElementById('fcPrev').addEventListener('click', () => {
    fcInner.classList.remove('flipped');
    current = (current - 1 + cards.length) % cards.length;
    renderCard();
  });
  document.getElementById('fcNext').addEventListener('click', () => {
    fcInner.classList.remove('flipped');
    current = (current + 1) % cards.length;
    renderCard();
  });

  // SRS buttons
  if (document.getElementById('fcHard')) {
    document.getElementById('fcHard').addEventListener('click', () => rateCard('hard'));
    document.getElementById('fcGood').addEventListener('click', () => rateCard('good'));
    document.getElementById('fcEasy').addEventListener('click', () => rateCard('easy'));
  }

  clearBtn.addEventListener('click', () => {
    if (cards.length === 0) return;
    if (confirm('Clear all flashcards?')) {
      cards = [];
      current = 0;
      save();
      renderCard();
    }
  });

  sortByPriority();
  renderCard();
})();


// =============================================
// 7. UNIT CONVERTER
// =============================================
(function () {
  const units = {
    length: {
      label: 'Length',
      options: ['Meter','Kilometer','Centimeter','Millimeter','Mile','Yard','Foot','Inch'],
      toBase: [1, 1000, 0.01, 0.001, 1609.344, 0.9144, 0.3048, 0.0254]
    },
    weight: {
      label: 'Weight',
      options: ['Kilogram','Gram','Milligram','Pound','Ounce','Metric Ton'],
      toBase: [1, 0.001, 0.000001, 0.453592, 0.0283495, 1000]
    },
    temp: {
      label: 'Temperature',
      options: ['Celsius','Fahrenheit','Kelvin'],
      toBase: null // handled specially
    },
    area: {
      label: 'Area',
      options: ['Square Meter','Square Kilometer','Square Foot','Square Inch','Acre','Hectare'],
      toBase: [1, 1e6, 0.092903, 0.00064516, 4046.86, 10000]
    },
    time: {
      label: 'Time',
      options: ['Second','Minute','Hour','Day','Week','Month','Year'],
      toBase: [1, 60, 3600, 86400, 604800, 2629800, 31557600]
    }
  };

  let currentCat = 'length';

  const fromInput  = document.getElementById('convFrom');
  const toInput    = document.getElementById('convTo');
  const fromSelect = document.getElementById('convFromUnit');
  const toSelect   = document.getElementById('convToUnit');
  const resultEl   = document.getElementById('convResult');

  function populateSelects(cat) {
    const opts = units[cat].options;
    [fromSelect, toSelect].forEach((sel, i) => {
      sel.innerHTML = opts.map((o, idx) =>
        `<option value="${idx}" ${i===1 && idx===1 ? 'selected' : ''}>${o}</option>`
      ).join('');
    });
  }

  function convert() {
    const val  = parseFloat(fromInput.value);
    const fromI = parseInt(fromSelect.value);
    const toI   = parseInt(toSelect.value);
    const cat   = currentCat;

    if (isNaN(val)) { toInput.value = ''; resultEl.className = 'conv-result'; return; }

    let result;

    if (cat === 'temp') {
      const opts = units.temp.options;
      const from = opts[fromI];
      const to   = opts[toI];
      let celsius;
      if (from === 'Celsius')    celsius = val;
      else if (from === 'Fahrenheit') celsius = (val - 32) * 5/9;
      else celsius = val - 273.15;

      if (to === 'Celsius')    result = celsius;
      else if (to === 'Fahrenheit') result = celsius * 9/5 + 32;
      else result = celsius + 273.15;
    } else {
      const tb = units[cat].toBase;
      const baseVal = val * tb[fromI];
      result = baseVal / tb[toI];
    }

    const display = parseFloat(result.toPrecision(8));
    toInput.value = display;
    resultEl.className = 'conv-result show';
    resultEl.innerHTML = `<strong>${val} ${units[cat].options[fromI]}</strong> = <strong>${display} ${units[cat].options[toI]}</strong>`;
  }

  document.querySelectorAll('.conv-cat').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.conv-cat').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      fromInput.value = '';
      toInput.value = '';
      resultEl.className = 'conv-result';
      populateSelects(currentCat);
    });
  });

  document.getElementById('convCalc').addEventListener('click', convert);
  fromInput.addEventListener('input', convert);
  fromSelect.addEventListener('change', convert);
  toSelect.addEventListener('change', convert);

  document.getElementById('convSwap').addEventListener('click', () => {
    const tmpSel = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = tmpSel;
    fromInput.value = toInput.value || fromInput.value;
    convert();
  });

  populateSelects(currentCat);
})();


// =============================================
// 8. STUDY PLANNER
// =============================================
(function () {
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  let sessions = {};
  DAYS.forEach(d => sessions[d] = []);

  const grid      = document.getElementById('plannerGrid');
  const addBtn    = document.getElementById('plannerAdd');
  const subjectEl = document.getElementById('plannerSubject');
  const timeEl    = document.getElementById('plannerTime');
  const dayEl     = document.getElementById('plannerDay');
  const durEl     = document.getElementById('plannerDuration');

  function renderGrid() {
    grid.innerHTML = '';
    DAYS.forEach(day => {
      const col = document.createElement('div');
      col.className = 'day-column';
      col.innerHTML = `<h4>${day}</h4>`;

      sessions[day].forEach((sess, i) => {
        const item = document.createElement('div');
        item.className = 'plan-item';
        item.innerHTML = `
          <div class="plan-item-info">
            <span>${sess.subject}</span>
            <small>${sess.time} · ${sess.duration} min</small>
          </div>
          <button class="plan-del" data-day="${day}" data-idx="${i}">✕</button>
        `;
        col.appendChild(item);
      });

      if (sessions[day].length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = 'font-size:.78rem;color:var(--text-muted);padding:.3rem 0;';
        empty.textContent = 'No sessions';
        col.appendChild(empty);
      }

      grid.appendChild(col);
    });

    grid.querySelectorAll('.plan-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = btn.dataset.day;
        const idx = parseInt(btn.dataset.idx);
        sessions[day].splice(idx, 1);
        renderGrid();
      });
    });
  }

  addBtn.addEventListener('click', () => {
    const subject  = subjectEl.value.trim();
    const time     = timeEl.value;
    const day      = dayEl.value;
    const duration = parseInt(durEl.value);

    if (!subject || !time || isNaN(duration) || duration < 1) {
      alert('Please fill in all fields!');
      return;
    }

    sessions[day].push({ subject, time, duration });
    sessions[day].sort((a, b) => a.time.localeCompare(b.time));

    subjectEl.value = '';
    timeEl.value    = '';
    durEl.value     = '';
    renderGrid();
  });

  renderGrid();
})();


// =============================================
// 9. BMI CALCULATOR
// =============================================
(function () {
  let heightUnit = 'cm';

  // Toggle cm / ft-in
  document.querySelectorAll('.height-unit').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.height-unit').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      heightUnit = btn.dataset.unit;
      document.getElementById('bmiHeightCm').classList.toggle('active', heightUnit === 'cm');
      document.getElementById('bmiHeightFt').classList.toggle('active', heightUnit === 'ft');
    });
  });

  document.getElementById('bmiCalc').addEventListener('click', () => {
    const weight   = parseFloat(document.getElementById('bmiWeight').value);
    const age      = parseInt(document.getElementById('bmiAge').value) || null;
    const sex      = document.getElementById('bmiSex').value;
    const resultEl = document.getElementById('bmiResult');

    let heightM;
    if (heightUnit === 'cm') {
      const cm = parseFloat(document.getElementById('bmiCm').value);
      if (isNaN(cm) || cm < 50 || cm > 300) return alert('Please enter a valid height in cm (50–300).');
      heightM = cm / 100;
    } else {
      const ft   = parseFloat(document.getElementById('bmiFt').value) || 0;
      const inch = parseFloat(document.getElementById('bmiIn').value) || 0;
      if (ft < 1) return alert('Please enter a valid height in feet.');
      heightM = (ft * 12 + inch) * 0.0254;
    }

    if (isNaN(weight) || weight < 1 || weight > 500)
      return alert('Please enter a valid weight (1–500 kg).');

    const bmi      = weight / (heightM * heightM);
    const bmiRound = Math.round(bmi * 10) / 10;

    // Category & advice
    let category, catColor, tip;
    if (bmi < 18.5) {
      category = 'Underweight'; catColor = '#4ecdc4';
      tip = '💡 Your BMI is below the healthy range. Focus on nutrient-rich foods and consider consulting a doctor or dietitian for a healthy weight-gain plan.';
    } else if (bmi < 25) {
      category = 'Normal Weight'; catColor = '#a8e063';
      tip = '✅ You are within the healthy BMI range. Maintain your balanced diet and regular physical activity to stay healthy.';
    } else if (bmi < 30) {
      category = 'Overweight'; catColor = '#f5c542';
      tip = '⚠️ Your BMI is slightly above the healthy range. Small lifestyle changes like daily walks and a balanced diet can make a big difference.';
    } else if (bmi < 35) {
      category = 'Obese (Class I)'; catColor = '#f5a742';
      tip = '⚠️ Your BMI indicates Class I obesity. Speaking with a healthcare provider about diet and exercise changes is a helpful first step.';
    } else {
      category = 'Obese (Class II+)'; catColor = '#f26b6b';
      tip = '🚨 Your BMI indicates Class II+ obesity. Please consult a doctor for a personalised health plan. Small consistent steps matter greatly.';
    }

    // Healthy weight range
    const minW = (18.5 * heightM * heightM).toFixed(1);
    const maxW = (24.9 * heightM * heightM).toFixed(1);

    // Needle: map BMI 15–40 → 0–100%
    const needlePct = Math.min(100, Math.max(0, ((bmi - 15) / (40 - 15)) * 100));

    document.getElementById('bmiScore').textContent = bmiRound;
    const catEl = document.getElementById('bmiCategory');
    catEl.textContent       = category;
    catEl.style.background  = catColor + '22';
    catEl.style.color       = catColor;

    document.getElementById('bmiInfo').innerHTML = `
      <strong>Healthy weight for your height:</strong><br/>
      ${minW} kg – ${maxW} kg<br/><br/>
      ${age ? `<strong>Age:</strong> ${age} years<br/>` : ''}
      ${sex ? `<strong>Sex:</strong> ${sex.charAt(0).toUpperCase() + sex.slice(1)}<br/>` : ''}
      <strong>Height:</strong> ${(heightM * 100).toFixed(1)} cm<br/>
      <strong>Weight:</strong> ${weight} kg
    `;

    document.getElementById('bmiNeedle').style.left = needlePct + '%';
    document.getElementById('bmiTip').textContent   = tip;
    resultEl.className = 'bmi-result show';
  });
})();

// =============================================
// 10. BUDGET TRACKER
// =============================================
(function () {
  const budgetBalance = document.getElementById('budgetBalance');
  const budgetIncome = document.getElementById('budgetIncome');
  const budgetExpense = document.getElementById('budgetExpense');
  const budgetName = document.getElementById('budgetName');
  const budgetAmount = document.getElementById('budgetAmount');
  const budgetType = document.getElementById('budgetType');
  const budgetAddBtn = document.getElementById('budgetAddBtn');
  const budgetList = document.getElementById('budgetList');

  if (!budgetBalance) return; // guard

  let transactions = JSON.parse(localStorage.getItem('studyhub_budget')) || [];

  function saveAndRender() {
    localStorage.setItem('studyhub_budget', JSON.stringify(transactions));
    
    let totalIncome = 0;
    let totalExpense = 0;
    budgetList.innerHTML = '';

    transactions.forEach((t, i) => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;

      const li = document.createElement('li');
      li.className = `budget-item ${t.type}`;
      li.innerHTML = `
        <div class="budget-item-info">
          <span class="budget-item-name">${t.name}</span>
          <span class="budget-item-date">${new Date(t.date).toLocaleDateString()}</span>
        </div>
        <div class="budget-item-amount">${t.type === 'income' ? '+' : '-'}Rs. ${t.amount}</div>
        <button class="budget-del" data-idx="${i}">✕</button>
      `;
      budgetList.appendChild(li);
    });

    const balance = totalIncome - totalExpense;
    budgetBalance.textContent = 'Rs. ' + balance;
    budgetIncome.textContent = 'Rs. ' + totalIncome;
    budgetExpense.textContent = 'Rs. ' + totalExpense;

    budgetList.querySelectorAll('.budget-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        transactions.splice(idx, 1);
        saveAndRender();
      });
    });
  }

  budgetAddBtn.addEventListener('click', () => {
    const name = budgetName.value.trim();
    const amount = parseFloat(budgetAmount.value);
    const type = budgetType.value;

    if (!name || isNaN(amount) || amount <= 0) return alert('Enter a valid name and amount.');

    transactions.unshift({ name, amount, type, date: new Date().toISOString() });
    budgetName.value = '';
    budgetAmount.value = '';
    saveAndRender();
  });

  saveAndRender();
})();

// =============================================
// CONFETTI ANIMATION
// =============================================
function fireConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = [];
  const colors = ['#e8b86d', '#4ecdc4', '#f26b6b', '#f5d49a', '#a8e063'];

  for (let i = 0; i < 150; i++) {
    pieces.push({
      x: canvas.width / 2,
      y: canvas.height / 2 + (Math.random() * 50),
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 1) * 20 - 5,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10
    });
  }

  let animationId;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.5; // gravity
      p.rot += p.rotSpeed;
      
      if (p.y < canvas.height) active = true;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
      ctx.restore();
    });

    if (active) {
      animationId = requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  update();
}

// =============================================
// 12. ASSIGNMENT DEADLINE TRACKER
// =============================================
(function () {
  const dlName   = document.getElementById('dlName');
  const dlDate   = document.getElementById('dlDate');
  const dlAddBtn = document.getElementById('dlAddBtn');
  const dlList   = document.getElementById('dlList');

  if (!dlName) return;

  let deadlines = JSON.parse(localStorage.getItem('studyhub_deadlines')) || [];

  function save() { localStorage.setItem('studyhub_deadlines', JSON.stringify(deadlines)); }

  function daysUntil(dateStr) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  }

  function render() {
    deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
    dlList.innerHTML = '';

    if (deadlines.length === 0) {
      dlList.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:1rem;">No deadlines added yet.</p>';
      return;
    }

    deadlines.forEach((d, i) => {
      const days = daysUntil(d.date);
      let badgeClass, badgeText, borderColor;

      if (days < 0) {
        badgeClass = 'deadline-urgent'; badgeText = 'OVERDUE'; borderColor = 'var(--rose)';
      } else if (days <= 2) {
        badgeClass = 'deadline-urgent';
        badgeText = days === 0 ? 'DUE TODAY' : days === 1 ? 'TOMORROW' : `${days} DAYS`;
        borderColor = 'var(--rose)';
      } else if (days <= 7) {
        badgeClass = 'deadline-soon'; badgeText = `${days} DAYS`; borderColor = '#f5c542';
      } else {
        badgeClass = 'deadline-later'; badgeText = `${days} DAYS`; borderColor = 'var(--teal)';
      }

      const item = document.createElement('div');
      item.className = 'deadline-item';
      item.style.borderLeftColor = borderColor;
      item.innerHTML = `
        <div class="deadline-item-info">
          <span class="deadline-item-name">${d.name}</span>
          <span class="deadline-item-date">Due: ${new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <span class="deadline-badge ${badgeClass}">${badgeText}</span>
        <button class="budget-del" data-idx="${i}">✕</button>
      `;
      dlList.appendChild(item);
    });

    dlList.querySelectorAll('.budget-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        deadlines.splice(parseInt(e.target.dataset.idx), 1);
        save();
        render();
      });
    });
  }

  dlAddBtn.addEventListener('click', () => {
    const name = dlName.value.trim();
    const date = dlDate.value;
    if (!name || !date) return alert('Please enter both a name and a date.');
    deadlines.push({ name, date });
    dlName.value = '';
    dlDate.value = '';
    save();
    render();
  });

  render();
})();


// =============================================
// 13. QUICK NOTES (Multiple Saved Notes)
// =============================================
(function () {
  const noteTitle      = document.getElementById('noteTitle');
  const noteInput      = document.getElementById('noteInput');
  const notePreview    = document.getElementById('notePreview');
  const noteSaveBtn    = document.getElementById('noteSaveBtn');
  const noteNewBtn     = document.getElementById('noteNewBtn');
  const noteEditBtn    = document.getElementById('noteEditBtn');
  const notePreviewBtn = document.getElementById('notePreviewBtn');
  const noteDownloadBtn = document.getElementById('noteDownloadBtn');
  const savedNotesList  = document.getElementById('savedNotesList');

  if (!noteInput) return;

  let notes = JSON.parse(localStorage.getItem('studyhub_notes')) || [];
  let editingIdx = -1;

  function save() { localStorage.setItem('studyhub_notes', JSON.stringify(notes)); }

  function markdownToHtml(md) {
    let html = md
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br/>');
    html = html.replace(/((<li>.*?<\/li><br\/>?)+)/g, '<ul>$1</ul>');
    return html;
  }

  function renderList() {
    if (notes.length === 0) {
      savedNotesList.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No saved notes yet.</p>';
      return;
    }
    savedNotesList.innerHTML = '';
    notes.forEach((n, i) => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:rgba(28,32,48,0.7);border:1px solid rgba(255,255,255,0.08);padding:0.6rem 1rem;border-radius:8px;cursor:pointer;transition:all 0.2s;margin-bottom:0.4rem;';
      item.innerHTML = `
        <div style="flex:1;">
          <span style="font-weight:600;color:var(--gold);font-size:0.9rem;">${n.title || 'Untitled'}</span>
          <span style="font-size:0.75rem;color:var(--text-muted);margin-left:0.5rem;">${new Date(n.date).toLocaleDateString()}</span>
        </div>
        <button class="budget-del" data-idx="${i}" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0.3rem;font-size:0.9rem;">✕</button>
      `;
      item.querySelector('div').addEventListener('click', () => {
        editingIdx = i;
        noteTitle.value = n.title;
        noteInput.value = n.content;
        noteInput.style.display = 'block';
        notePreview.style.display = 'none';
        noteEditBtn.classList.add('active');
        notePreviewBtn.classList.remove('active');
      });
      item.querySelector('.budget-del').addEventListener('click', (e) => {
        e.stopPropagation();
        notes.splice(i, 1);
        save();
        renderList();
        if (editingIdx === i) { editingIdx = -1; noteTitle.value = ''; noteInput.value = ''; }
      });
      savedNotesList.appendChild(item);
    });
  }

  noteSaveBtn.addEventListener('click', () => {
    const title = noteTitle.value.trim() || 'Untitled Note';
    const content = noteInput.value;
    if (!content.trim()) return alert('Write something before saving!');

    if (editingIdx >= 0 && editingIdx < notes.length) {
      notes[editingIdx].title = title;
      notes[editingIdx].content = content;
      notes[editingIdx].date = new Date().toISOString();
    } else {
      notes.unshift({ title, content, date: new Date().toISOString() });
      editingIdx = 0;
    }
    save();
    renderList();
    alert('Note saved! ✅');
  });

  noteNewBtn.addEventListener('click', () => {
    editingIdx = -1;
    noteTitle.value = '';
    noteInput.value = '';
    noteInput.style.display = 'block';
    notePreview.style.display = 'none';
    noteEditBtn.classList.add('active');
    notePreviewBtn.classList.remove('active');
    noteInput.focus();
  });

  noteEditBtn.addEventListener('click', () => {
    noteInput.style.display = 'block';
    notePreview.style.display = 'none';
    noteEditBtn.classList.add('active');
    notePreviewBtn.classList.remove('active');
  });

  notePreviewBtn.addEventListener('click', () => {
    notePreview.innerHTML = markdownToHtml(noteInput.value);
    noteInput.style.display = 'none';
    notePreview.style.display = 'block';
    notePreviewBtn.classList.add('active');
    noteEditBtn.classList.remove('active');
  });

  noteDownloadBtn.addEventListener('click', () => {
    const text = noteInput.value;
    if (!text.trim()) return alert('Nothing to download!');
    const title = noteTitle.value.trim() || 'note';
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = title.replace(/[^a-z0-9]/gi, '_') + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  renderList();
})();


// =============================================
// 14. CITATION GENERATOR
// =============================================
(function () {
  const citFormat   = document.getElementById('citFormat');
  const citAuthor   = document.getElementById('citAuthor');
  const citYear     = document.getElementById('citYear');
  const citTitle    = document.getElementById('citTitle');
  const citSite     = document.getElementById('citSite');
  const citUrl      = document.getElementById('citUrl');
  const citGenBtn   = document.getElementById('citGenerateBtn');
  const citResult   = document.getElementById('citResult');
  const citText     = document.getElementById('citText');
  const citCopyBtn  = document.getElementById('citCopyBtn');

  if (!citGenBtn) return;

  citGenBtn.addEventListener('click', () => {
    const author = citAuthor.value.trim();
    const year   = citYear.value.trim();
    const title  = citTitle.value.trim();
    const site   = citSite.value.trim();
    const url    = citUrl.value.trim();
    const format = citFormat.value;

    if (!author && !title) return alert('Please enter at least an author or title.');

    let citation = '';

    if (format === 'APA') {
      if (author) citation += author;
      if (year) citation += ` (${year}).`;
      else citation += '.';
      if (title) citation += ` ${title}.`;
      if (site) citation += ` <em>${site}</em>.`;
      if (url) citation += ` ${url}`;
    } else {
      if (author) citation += author + '. ';
      if (title) citation += `"${title}." `;
      if (site) citation += `<em>${site}</em>, `;
      if (year) citation += `${year}, `;
      if (url) citation += `${url}`;
      if (citation.endsWith(', ')) citation = citation.slice(0, -2);
      citation += '.';
    }

    citText.innerHTML = citation;
    citResult.style.display = 'flex';
  });

  citCopyBtn.addEventListener('click', () => {
    const plainText = citText.innerText;
    navigator.clipboard.writeText(plainText).then(() => {
      citCopyBtn.textContent = '✓ Copied!';
      setTimeout(() => { citCopyBtn.textContent = 'Copy'; }, 2000);
    });
  });
})();


// =============================================
// 15. EMI CALCULATOR
// =============================================
(function () {
  const emiCalcBtn = document.getElementById('emiCalcBtn');
  if (!emiCalcBtn) return;

  function formatNum(n) {
    return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  emiCalcBtn.addEventListener('click', () => {
    const P = parseFloat(document.getElementById('emiPrincipal').value);
    const annualRate = parseFloat(document.getElementById('emiRate').value);
    const tenure = parseFloat(document.getElementById('emiTenure').value);
    const tenureType = document.getElementById('emiTenureType').value;
    const resultEl = document.getElementById('emiResult');

    if (isNaN(P) || P <= 0 || isNaN(annualRate) || isNaN(tenure) || tenure <= 0) {
      return alert('Please enter valid loan details.');
    }

    // Convert to months
    const n = tenureType === 'years' ? tenure * 12 : tenure;

    let emi, totalPayment, totalInterest;

    if (annualRate === 0) {
      // No interest
      emi = P / n;
      totalPayment = P;
      totalInterest = 0;
    } else {
      // Monthly interest rate
      const r = (annualRate / 100) / 12;
      // EMI formula: P × r × (1+r)^n / ((1+r)^n - 1)
      const factor = Math.pow(1 + r, n);
      emi = P * r * factor / (factor - 1);
      totalPayment = emi * n;
      totalInterest = totalPayment - P;
    }

    document.getElementById('emiMonthly').textContent = 'Rs. ' + formatNum(emi);
    document.getElementById('emiInterest').textContent = 'Rs. ' + formatNum(totalInterest);
    document.getElementById('emiTotal').textContent = 'Rs. ' + formatNum(totalPayment);
    resultEl.style.display = 'block';
  });
})();