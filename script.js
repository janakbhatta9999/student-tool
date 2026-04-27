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
    tasks = tasks.filter(t => !t.done);
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
// 6. FLASHCARDS
// =============================================
(function () {
  let cards = [];
  let current = 0;

  const frontInput = document.getElementById('fcFront');
  const backInput  = document.getElementById('fcBack');
  const addBtn     = document.getElementById('fcAdd');
  const flashcard  = document.getElementById('flashcard');
  const fcInner    = document.getElementById('fcInner');
  const fcFront    = document.getElementById('fcFrontDisplay');
  const fcBack     = document.getElementById('fcBackDisplay');
  const fcControls = document.getElementById('fcControls');
  const fcCounter  = document.getElementById('fcCounter');
  const fcEmpty    = document.getElementById('fcEmpty');
  const fcHint     = document.getElementById('fcHint');
  const clearBtn   = document.getElementById('fcClear');

  function renderCard() {
    if (cards.length === 0) {
      flashcard.style.display  = 'none';
      fcControls.style.display = 'none';
      fcHint.style.display     = 'none';
      fcEmpty.style.display    = 'block';
      return;
    }
    fcEmpty.style.display    = 'none';
    flashcard.style.display  = 'block';
    fcControls.style.display = 'flex';
    fcHint.style.display     = 'block';
    fcInner.classList.remove('flipped');
    fcFront.textContent = cards[current].front;
    fcBack.textContent  = cards[current].back;
    fcCounter.textContent = `${current + 1} / ${cards.length}`;
  }

  addBtn.addEventListener('click', () => {
    const f = frontInput.value.trim();
    const b = backInput.value.trim();
    if (!f || !b) return alert('Please fill both front and back!');
    cards.push({ front: f, back: b });
    frontInput.value = '';
    backInput.value  = '';
    current = cards.length - 1;
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

  clearBtn.addEventListener('click', () => {
    if (cards.length === 0) return;
    if (confirm('Clear all flashcards?')) {
      cards = [];
      current = 0;
      renderCard();
    }
  });

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