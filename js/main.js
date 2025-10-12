/* main.js
   Wire the UI to calculator.js
*/

(function(){
  const tierSelect = document.getElementById('tierSelect');
  const cardLevel = document.getElementById('cardLevel');
  const guildLevel = document.getElementById('guildLevel');
  const guildLevelOut = document.getElementById('guildLevelOut');
  const talentLevel = document.getElementById('talentLevel');
  const roundMode = document.getElementById('roundMode');
  const guildApplyDH = document.getElementById('guildApplyDH');

  const binsList = document.getElementById('binsList');
  const addBinBtn = document.getElementById('addBinBtn');
  const clearBinsBtn = document.getElementById('clearBinsBtn');

  const includeDH = document.getElementById('includeDH');
  const dhOptions = document.getElementById('dhOptions');
  const dhLevel = document.getElementById('dhLevel');
  const dhLevelOut = document.getElementById('dhLevelOut');

  const totalValue = document.getElementById('totalValue');
  const breakdown = document.getElementById('breakdown');
  const toggleBreakdown = document.getElementById('toggleBreakdown');

  // initial values
  let binsState = []; // array of {id, level, count}
  let uid = 1;

  function createBinRow(bin){
    // DOM structure:
    // .bin-row -> level slider + levelOut, count input, remove button
    const div = document.createElement('div');
    div.className = 'bin-row';
    div.dataset.id = bin.id;

    const col1 = document.createElement('div'); col1.className='col';
    const label = document.createElement('label'); label.textContent = 'Level';
    const lvl = document.createElement('input'); lvl.type='range'; lvl.min=1; lvl.max=25; lvl.value=bin.level;
    const lvlOut = document.createElement('output'); lvlOut.textContent = bin.level;
    col1.appendChild(label); col1.appendChild(lvl); col1.appendChild(lvlOut);

    const col2 = document.createElement('div'); col2.className='col';
    const lbl2 = document.createElement('label'); lbl2.textContent = 'Count';
    const count = document.createElement('input'); count.type='number'; count.min=1; count.value=bin.count; count.className='count';
    col2.appendChild(lbl2); col2.appendChild(count);

    const col3 = document.createElement('div'); col3.className='col';
    const remove = document.createElement('button'); remove.className='remove secondary'; remove.textContent='Remove';
    col3.appendChild(remove);

    div.appendChild(col1);
    div.appendChild(col2);
    div.appendChild(col3);

    // events
    lvl.addEventListener('input', () => {
      lvlOut.textContent = lvl.value;
      syncBin(bin.id, { level: Number(lvl.value) });
    });
    count.addEventListener('change', () => {
      let v = parseInt(count.value,10);
      if(isNaN(v) || v < 1) v = 1;
      count.value = v;
      syncBin(bin.id, { count: v });
    });
    remove.addEventListener('click', () => {
      removeBin(bin.id);
    });

    return div;
  }

  function renderBins(){
    binsList.innerHTML = '';
    binsState.forEach(b => {
      binsList.appendChild(createBinRow(b));
    });
    if(binsState.length === 0){
      // add a friendly placeholder
      const p = document.createElement('p');
      p.className = 'small';
      p.textContent = 'No bins yet — click "Add bin" to add a bin entry.';
      binsList.appendChild(p);
    }
    updateAndRender();
  }

  function syncBin(id, patch){
    const idx = binsState.findIndex(x => x.id === id);
    if(idx === -1) return;
    binsState[idx] = Object.assign({}, binsState[idx], patch);
    updateAndRender();
  }

  function addBin(level = 1, count = 1){
    const b = { id: uid++, level: level, count: count };
    binsState.push(b);
    renderBins();
  }

  function removeBin(id){
    binsState = binsState.filter(b => b.id !== id);
    renderBins();
  }

  function clearBins(){
    binsState = [];
    renderBins();
  }

  // update the talent options depending on tier
  function refreshTalentOptions(){
    const tier = tierSelect.value;
    const map = window.ResourceCalc.TalentMap || {};
    const arr = map[tier] || [];
    talentLevel.innerHTML = '';
    // allow 0 as option (no talent)
    const opt0 = document.createElement('option'); opt0.value = '0'; opt0.textContent = '0 — none';
    talentLevel.appendChild(opt0);
    for(let i=0;i<arr.length;i++){
      const level = i+1;
      const pct = Math.round(arr[i]*100);
      const opt = document.createElement('option');
      opt.value = String(level);
      opt.textContent = `${level} — ${pct}%`;
      talentLevel.appendChild(opt);
    }
    // ensure selected value doesn't exceed new max
    if(Number(talentLevel.value) > arr.length) talentLevel.value = '0';
  }

  // read inputs and compute
  function gatherConfig(){
    return {
      tier: tierSelect.value,
      bins: binsState.map(b => ({ level: Number(b.level), count: Number(b.count) })),
      guildLevel: Number(guildLevel.value),
      cardLevel: Number(cardLevel.value),
      talentLevel: Number(talentLevel.value),
      includeDH: includeDH.checked,
      dhLevel: Number(dhLevel.value),
      roundingMode: roundMode.value,
      applyGuildToDH: guildApplyDH.checked
    };
  }

  function updateAndRender(){
    const cfg = gatherConfig();
    const res = window.ResourceCalc.totalCapacity(cfg);
    totalValue.textContent = res.total;

    // breakdown rendering
    breakdown.innerHTML = '';
    const rows = res.breakdown.rows || [];
    if(rows.length === 0 && !res.breakdown.dh){
      const p = document.createElement('p'); p.className='small'; p.textContent='No bins to show in breakdown.';
      breakdown.appendChild(p);
      return;
    }

    rows.forEach(r => {
      const item = document.createElement('div'); item.className='item';
      const left = document.createElement('div');
      left.innerHTML = `<strong>${r.label}</strong> <div class="small">base ${r.base} + guild ${r.guildFlat} → unit ${r.perUnit}</div>`;
      const right = document.createElement('div');
      right.innerHTML = `<div>${r.subtotal}</div><div class="small">${r.perUnit} × ${r.count}</div>`;
      item.appendChild(left);
      item.appendChild(right);
      breakdown.appendChild(item);
    });

    if(res.breakdown.dh){
      const r = res.breakdown.dh;
      const item = document.createElement('div'); item.className='item';
      const left = document.createElement('div');
      left.innerHTML = `<strong>${r.label}</strong> <div class="small">base ${r.base} + guild ${r.guildFlat} → unit ${r.perUnit}</div>`;
      const right = document.createElement('div');
      right.innerHTML = `<div>${r.subtotal}</div><div class="small">${r.perUnit} × ${r.count}</div>`;
      item.appendChild(left);
      item.appendChild(right);
      breakdown.appendChild(item);
    }
  }

  // wire events
  tierSelect.addEventListener('change', () => {
    refreshTalentOptions();
    updateAndRender();
  });

  cardLevel.addEventListener('change', updateAndRender);
  guildLevel.addEventListener('input', () => {
    guildLevelOut.value = guildLevel.value;
    updateAndRender();
  });
  talentLevel.addEventListener('change', updateAndRender);
  roundMode.addEventListener('change', updateAndRender);
  guildApplyDH.addEventListener('change', updateAndRender);

  addBinBtn.addEventListener('click', () => {
    addBin(1,1);
  });

  clearBinsBtn.addEventListener('click', () => {
    clearBins();
  });

  includeDH.addEventListener('change', () => {
    if(includeDH.checked){
      dhOptions.classList.remove('hidden');
    } else {
      dhOptions.classList.add('hidden');
    }
    updateAndRender();
  });

  dhLevel.addEventListener('input', () => {
    dhLevelOut.value = dhLevel.value;
    updateAndRender();
  });

  toggleBreakdown.addEventListener('click', () => {
    if(breakdown.classList.contains('hidden')){
      breakdown.classList.remove('hidden');
      toggleBreakdown.textContent = 'Hide breakdown';
    } else {
      breakdown.classList.add('hidden');
      toggleBreakdown.textContent = 'Show breakdown';
    }
  });

  // initial UI setup
  guildLevelOut.value = guildLevel.value;
  dhLevelOut.value = dhLevel.value;
  refreshTalentOptions();
  // default: create one bin row
  addBin(17,1); // helpful default so user sees something; you can remove or change as desired

  // update UI when talent changes to enforce caps (the talent select is rebuilt on tier change)
  talentLevel.addEventListener('change', () => updateAndRender());

})();
